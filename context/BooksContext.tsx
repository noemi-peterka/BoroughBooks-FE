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

export type BookStatus = "available" | "lent" | "borrowed" | "wishlist";

export type Book = {
  id: number;
  title: string;
  author: string;
  genre?: string;
  year: number;
  cover?: string;
  description: string;
  ownerId?: string;
  status?: BookStatus;
};

type ApiBook = {
  isbn: string;
  username?: string;
  title: string;
  authors: string;
  publisher?: string;
  published_date?: string;
  description?: string;
  imagelinks?: string;
};

type NewBook = Omit<Book, "id" | "ownerId" | "status">;

export type CollectionType = "library" | "wishlist" | "borrowed" | "lent";

type BooksContextType = {
  books: Book[];
  libraryBooks: Book[];
  wishlistBooks: Book[];
  borrowedBooks: Book[];
  lentBooks: Book[];
  isLoading: boolean;
  errorMessage: string | null;

  addBook: (collection: CollectionType, book: NewBook) => void;
  deleteBook: (collection: CollectionType, id: number) => void;
  getBookById: (bookId?: number) => Book | undefined;
  refetchBooks: () => Promise<void>;
};

const BooksContext = createContext<BooksContextType | undefined>(undefined);

function mapApiBookToBook(
  book: ApiBook,
  ownerId: string | undefined,
  status: BookStatus,
  index: number,
): Book {
  return {
    id: Number(book.isbn) || index + 1,
    title: book.title,
    author: book.authors || "Unknown author",
    genre: undefined,
    year: book.published_date
      ? new Date(book.published_date).getFullYear()
      : new Date().getFullYear(),
    cover: book.imagelinks || "",
    description: book.description || "No description provided.",
    ownerId,
    status,
  };
}

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

      const libraryData = libraryResponse.data as { books: ApiBook[] };
      const loansData = loansResponse.data as { books: ApiBook[] };
      const borrowingData = borrowingResponse.data as { books: ApiBook[] };
      const wishListData = wishListResponse.data as {
        usersWishList: ApiBook[];
      };

      const mappedLibraryBooks: Book[] = (libraryData.books || []).map(
        (book, index) =>
          mapApiBookToBook(book, user.username, "available", index),
      );

      const mappedLentBooks: Book[] = (loansData.books || []).map(
        (book, index) => mapApiBookToBook(book, user.username, "lent", index),
      );

      const mappedBorrowedBooks: Book[] = (borrowingData.books || []).map(
        (book, index) =>
          mapApiBookToBook(book, user.username, "borrowed", index),
      );

      const mappedWishlistBooks: Book[] = (
        wishListData.usersWishList || []
      ).map((book, index) =>
        mapApiBookToBook(book, user.username, "wishlist", index),
      );

      setLibraryBooks(mappedLibraryBooks);
      setLentBooks(mappedLentBooks);
      setBorrowedBooks(mappedBorrowedBooks);
      setWishlistBooks(mappedWishlistBooks);
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
  }, [user]);

  const books = useMemo(() => {
    return [...libraryBooks, ...wishlistBooks, ...borrowedBooks, ...lentBooks];
  }, [libraryBooks, wishlistBooks, borrowedBooks, lentBooks]);

  const addBook = (collection: CollectionType, book: NewBook) => {
    const newBook: Book = {
      id: Date.now(),
      ...book,
      ownerId: user?.username,
      status:
        collection === "library"
          ? "available"
          : collection === "wishlist"
            ? "wishlist"
            : collection === "borrowed"
              ? "borrowed"
              : "lent",
    };

    switch (collection) {
      case "library":
        setLibraryBooks((currentBooks) => [newBook, ...currentBooks]);
        break;
      case "wishlist":
        setWishlistBooks((currentBooks) => [newBook, ...currentBooks]);
        break;
      case "borrowed":
        setBorrowedBooks((currentBooks) => [newBook, ...currentBooks]);
        break;
      case "lent":
        setLentBooks((currentBooks) => [newBook, ...currentBooks]);
        break;
    }
  };

  const deleteBook = (collection: CollectionType, id: number) => {
    switch (collection) {
      case "library":
        setLibraryBooks((currentBooks) =>
          currentBooks.filter((book) => book.id !== id),
        );
        break;
      case "wishlist":
        setWishlistBooks((currentBooks) =>
          currentBooks.filter((book) => book.id !== id),
        );
        break;
      case "borrowed":
        setBorrowedBooks((currentBooks) =>
          currentBooks.filter((book) => book.id !== id),
        );
        break;
      case "lent":
        setLentBooks((currentBooks) =>
          currentBooks.filter((book) => book.id !== id),
        );
        break;
    }
  };

  const getBookById = (bookId?: number) => {
    return books.find((book) => book.id === bookId);
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
