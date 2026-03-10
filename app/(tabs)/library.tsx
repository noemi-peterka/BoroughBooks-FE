import { StyleSheet, View } from "react-native";
import BookList from "../../components/BookList";
import { useBooks } from "../../context/BooksContext";

export default function Library() {
  const { books } = useBooks();

  return (
    <View style={styles.container}>
      <BookList books={books} isLoading={false} showAddTile />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
});
