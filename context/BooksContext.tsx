import axios from "axios";
import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type PropsWithChildren,
} from "react";
import { useSession } from "./UserContext";

export type CollectionType = "library" | "wishlist" | "borrowed" | "lent";

export type Book = {
  isbn: string;
  username?: string;
  title: string;
  authors: string;
  publisher?: string;
  published_date?: string;
  description?: string;
  imagelinks?: string;
};

type BooksContextType = {
  books: Book[];
  libraryBooks: Book[];
  wishlistBooks: Book[];
  borrowedBooks: Book[];
  lentBooks: Book[];
  isLoading: boolean;
  errorMessage: string | null;
  addBook: (collection: CollectionType, book: Book) => void;
  deleteBook: (collection: CollectionType, isbn: string) => void;
  getBookById: (isbn?: string) => Book | undefined;
  refetchBooks: () => Promise<void>;
};

const BooksContext = createContext<BooksContextType | undefined>(undefined);

export function BooksProvider({ children }: PropsWithChildren) {
  const { user } = useSession();

  const [libraryBooks, setLibraryBooks] = useState<Book[]>([]);
  const [wishlistBooks, setWishlistBooks] = useState<Book[]>([]);
  const [borrowedBooks, setBorrowedBooks] = useState<Book[]>([]);
  const [lentBooks, setLentBooks] = useState<Book[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const refetchBooks = async () => {
    if (!user?.username) {
      setLibraryBooks([]);
      setWishlistBooks([]);
      setBorrowedBooks([]);
      setLentBooks([]);
      setErrorMessage(null);
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);

    try {
      const [
        libraryResponse,
        loansResponse,
        borrowingResponse,
        wishListResponse,
      ] = await Promise.all([
        axios.get(
          `https://boroughbooks.onrender.com/api/users/${user.username}/my-library`,
        ),
        axios.get(
          `https://boroughbooks.onrender.com/api/users/${user.username}/loaned`,
        ),
        axios.get(
          `https://boroughbooks.onrender.com/api/users/${user.username}/borrowed`,
        ),
        axios.get(
          `https://boroughbooks.onrender.com/api/users/${user.username}/wish-list`,
        ),
      ]);

      setLibraryBooks(libraryResponse.data.books || []);
      setLentBooks(loansResponse.data.books || []);
      setBorrowedBooks(borrowingResponse.data.books || []);
      setWishlistBooks(wishListResponse.data.usersWishList || []);
    } catch (error) {
      console.error("Failed to fetch user books:", error);
      setLibraryBooks([]);
      setLentBooks([]);
      setBorrowedBooks([]);
      setWishlistBooks([]);
      setErrorMessage("Could not load this user's books.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    refetchBooks();
  }, [user?.username]);

  const books = useMemo(() => {
    return [...libraryBooks, ...wishlistBooks, ...borrowedBooks, ...lentBooks];
  }, [libraryBooks, wishlistBooks, borrowedBooks, lentBooks]);

  const addBook = (collection: CollectionType, book: Book) => {
    switch (collection) {
      case "library":
        setLibraryBooks((currentBooks) => [book, ...currentBooks]);
        break;
      case "wishlist":
        setWishlistBooks((currentBooks) => [book, ...currentBooks]);
        break;
      case "borrowed":
        setBorrowedBooks((currentBooks) => [book, ...currentBooks]);
        break;
      case "lent":
        setLentBooks((currentBooks) => [book, ...currentBooks]);
        break;
    }
  };

  const deleteBook = (collection: CollectionType, isbn: string) => {
    switch (collection) {
      case "library":
        setLibraryBooks((currentBooks) =>
          currentBooks.filter((book) => book.isbn !== isbn),
        );
        break;
      case "wishlist":
        setWishlistBooks((currentBooks) =>
          currentBooks.filter((book) => book.isbn !== isbn),
        );
        break;
      case "borrowed":
        setBorrowedBooks((currentBooks) =>
          currentBooks.filter((book) => book.isbn !== isbn),
        );
        break;
      case "lent":
        setLentBooks((currentBooks) =>
          currentBooks.filter((book) => book.isbn !== isbn),
        );
        break;
    }
  };

  const getBookById = (isbn?: string) => {
    return books.find((book) => book.isbn === isbn);
  };

  const value = useMemo(
    () => ({
      books,
      libraryBooks,
      wishlistBooks,
      borrowedBooks,
      lentBooks,
      isLoading,
      errorMessage,
      addBook,
      deleteBook,
      getBookById,
      refetchBooks,
    }),
    [
      books,
      libraryBooks,
      wishlistBooks,
      borrowedBooks,
      lentBooks,
      isLoading,
      errorMessage,
    ],
  );

  return (
    <BooksContext.Provider value={value}>{children}</BooksContext.Provider>
  );
}

export function useBooks() {
  const context = useContext(BooksContext);

  if (!context) {
    throw new Error("useBooks must be used within a BooksProvider");
  }

  return context;
}
