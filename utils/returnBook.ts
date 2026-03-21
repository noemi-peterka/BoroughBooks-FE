import type { Book } from "@/context/BooksContext";
import axios from "axios";

export async function returnBook(book: Book): Promise<void> {
  const borrowedBookInfo = await axios.get(
    `https://boroughbooks.onrender.com/api/users/${book.username}/my-library/${book.isbn}`,
  );
  const usersBookId = borrowedBookInfo.data.usersBookByIsbn[0].users_book_id;
  const response = await axios.delete(
    `https://boroughbooks.onrender.com/api/users/${book.username}/loaned/${usersBookId}`,
  );
  return;
}
