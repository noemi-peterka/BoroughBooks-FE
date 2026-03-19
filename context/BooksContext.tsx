import { deleteBookFromUserProfile } from "@/utils/deleteBookFromUserProfile";
import axios from "axios";
import {
  createContext,
  useContext,
  useEffect,
  useState,
  type PropsWithChildren,
} from "react";
import { useSession } from "./UserContext";

export type CollectionType = "library" | "wishlist" | "borrowed" | "lent";

export type Book = {
  isbn: string;
  username?: string;
  borrower_id?: string;
  title: string;
  authors: string;
  publisher?: string;
  published_date?: string | number;
  description?: string;
  imagelinks?: string;
};

type BooksResponse = {
  books: Book[];
};

type WishListResponse = {
  usersWishList: Book[];
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

const API_BASE_URL = "https://boroughbooks.onrender.com/api";

export function BooksProvider({ children }: PropsWithChildren) {
  const { user } = useSession();

  const [libraryBooks, setLibraryBooks] = useState<Book[]>([]);
  const [wishlistBooks, setWishlistBooks] = useState<Book[]>([]);
  const [borrowedBooks, setBorrowedBooks] = useState<Book[]>([]);
  const [lentBooks, setLentBooks] = useState<Book[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const clearAllBooks = () => {
    setLibraryBooks([]);
    setWishlistBooks([]);
    setBorrowedBooks([]);
    setLentBooks([]);
  };

  const refetchBooks = async () => {
    if (!user?.username) {
      clearAllBooks();
      setErrorMessage(null);
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);

    try {
      const username = encodeURIComponent(user.username);

      const [
        libraryResponse,
        loansResponse,
        borrowingResponse,
        wishListResponse,
      ] = await Promise.all([
        axios.get<BooksResponse>(
          `${API_BASE_URL}/users/${username}/my-library`,
        ),
        axios.get<BooksResponse>(`${API_BASE_URL}/users/${username}/loaned`),
        axios.get<BooksResponse>(`${API_BASE_URL}/users/${username}/borrowed`),
        axios.get<WishListResponse>(
          `${API_BASE_URL}/users/${username}/wish-list`,
        ),
      ]);

      setLibraryBooks(libraryResponse.data.books || []);
      setLentBooks(loansResponse.data.books || []);
      setBorrowedBooks(borrowingResponse.data.books || []);
      setWishlistBooks(wishListResponse.data.usersWishList || []);
    } catch (error) {
      console.error("Failed to fetch user books:", error);
      clearAllBooks();
      setErrorMessage("Could not load this user's books.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    refetchBooks();
  }, [user?.username]);

  const books = [
    ...libraryBooks,
    ...wishlistBooks,
    ...borrowedBooks,
    ...lentBooks,
  ];

  const addBook = (collection: CollectionType, book: Book) => {
    if (collection === "library") {
      setLibraryBooks((currentBooks) => [book, ...currentBooks]);
      return;
    }

    if (collection === "wishlist") {
      setWishlistBooks((currentBooks) => [book, ...currentBooks]);
      return;
    }

    if (collection === "borrowed") {
      setBorrowedBooks((currentBooks) => [book, ...currentBooks]);
      return;
    }

    setLentBooks((currentBooks) => [book, ...currentBooks]);
  };

  const deleteBook = async (collection: CollectionType, isbn: string) => {
    if (collection === "library") {
      if (!user) return;
      await deleteBookFromUserProfile(user?.username, isbn, collection);
      setLibraryBooks((currentBooks) =>
        currentBooks.filter((book) => book.isbn !== isbn),
      );
      return;
    }

    if (collection === "wishlist") {
      if (!user) return;
      await deleteBookFromUserProfile(user?.username, isbn, collection);
      setWishlistBooks((currentBooks) =>
        currentBooks.filter((book) => book.isbn !== isbn),
      );
      return;
    }

    if (collection === "borrowed") {
      setBorrowedBooks((currentBooks) =>
        currentBooks.filter((book) => book.isbn !== isbn),
      );
      return;
    }

    setLentBooks((currentBooks) =>
      currentBooks.filter((book) => book.isbn !== isbn),
    );
  };

  const getBookById = (isbn?: string) => {
    return books.find((book) => book.isbn === isbn);
  };

  const value = {
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
  };

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
