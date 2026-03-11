import { Alert, StyleSheet, View } from "react-native";
import BookList from "../../components/BookList";
import { useBooks } from "../../context/BooksContext";
import type { Book } from "../../data/books";

export default function Library() {
  const { books, deleteBook } = useBooks();

  const handleDeleteBook = (book: Book) => {
    deleteBook(book.id);
  };

  const handleLendBook = (book: Book) => {
    Alert.alert("Lend book", `You selected "${book.title}" to lend.`);
  };

  return (
    <View style={styles.container}>
      <BookList
        books={books}
        isLoading={false}
        showDelete
        showSwap
        onDelete={handleDeleteBook}
        onSwap={handleLendBook}
        showAddTile
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
});
