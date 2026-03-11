import { createContext, ReactNode, useContext, useMemo, useState } from "react";
import { books as mockLibraryBooks } from "../data/books";
import { borrowedBooks as mockBorrowedBooks } from "../data/borrowedBooks";
import { lentBooks as mockLentBooks } from "../data/lentBooks";
import { wishlistBooks as mockWishlistBooks } from "../data/wishlistBooks";

export type Book = {
  id: number;
  title: string;
  author: string;
  genre: string;
  year: number;
  cover: string;
  description: string;
};

type NewBook = Omit<Book, "id">;

export type CollectionType = "library" | "wishlist" | "borrowed" | "lent";

type BooksContextType = {
  libraryBooks: Book[];
  wishlistBooks: Book[];
  borrowedBooks: Book[];
  lentBooks: Book[];
  addBook: (collection: CollectionType, book: NewBook) => void;
  deleteBook: (collection: CollectionType, id: number) => void;
};

const BooksContext = createContext<BooksContextType | undefined>(undefined);

export function BooksProvider({ children }: { children: ReactNode }) {
  const [libraryBooks, setLibraryBooks] = useState<Book[]>(mockLibraryBooks);
  const [wishlistBooks, setWishlistBooks] = useState<Book[]>(mockWishlistBooks);
  const [borrowedBooks, setBorrowedBooks] = useState<Book[]>(mockBorrowedBooks);
  const [lentBooks, setLentBooks] = useState<Book[]>(mockLentBooks);

  const addBook = (collection: CollectionType, book: NewBook) => {
    const newBook: Book = {
      id: Date.now(),
      ...book,
    };

    switch (collection) {
      case "library":
        setLibraryBooks((current) => [newBook, ...current]);
        break;
      case "wishlist":
        setWishlistBooks((current) => [newBook, ...current]);
        break;
      case "borrowed":
        setBorrowedBooks((current) => [newBook, ...current]);
        break;
      case "lent":
        setLentBooks((current) => [newBook, ...current]);
        break;
    }
  };

  const deleteBook = (collection: CollectionType, id: number) => {
    switch (collection) {
      case "library":
        setLibraryBooks((current) => current.filter((book) => book.id !== id));
        break;
      case "wishlist":
        setWishlistBooks((current) => current.filter((book) => book.id !== id));
        break;
      case "borrowed":
        setBorrowedBooks((current) => current.filter((book) => book.id !== id));
        break;
      case "lent":
        setLentBooks((current) => current.filter((book) => book.id !== id));
        break;
    }
  };

  const value = useMemo(
    () => ({
      libraryBooks,
      wishlistBooks,
      borrowedBooks,
      lentBooks,
      addBook,
      deleteBook,
    }),
    [libraryBooks, wishlistBooks, borrowedBooks, lentBooks],
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
