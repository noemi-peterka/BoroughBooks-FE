import { createContext, ReactNode, useContext, useMemo, useState } from "react";
import { books as mockBooks } from "../data/books";

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

type BooksContextType = {
  books: Book[];
  addBook: (book: NewBook) => void;
  deleteBook: (id: number) => void;
};

const BooksContext = createContext<BooksContextType | undefined>(undefined);

export function BooksProvider({ children }: { children: ReactNode }) {
  const [books, setBooks] = useState<Book[]>(mockBooks);

  const addBook = (book: NewBook) => {
    setBooks((currentBooks) => [
      {
        id: Date.now(),
        ...book,
      },
      ...currentBooks,
    ]);
  };

  const deleteBook = (id: number) => {
    setBooks((currentBooks) => currentBooks.filter((book) => book.id !== id));
  };

  const value = useMemo(() => ({ books, addBook, deleteBook }), [books]);

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
