import { ScrollView, StyleSheet, Text, View } from "react-native";
import BookList from "../../components/BookList";
import { useBooks } from "../../context/BooksContext";

export default function Library() {
  const { getMyAvailableBooks, getBorrowedBooks, getLentBooks } = useBooks();

  const availableBooks = getMyAvailableBooks();
  const borrowedBooks = getBorrowedBooks();
  const lentBooks = getLentBooks();

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.sectionTitle}>Available</Text>
      <BookList books={availableBooks} isLoading={false} />

      <View style={styles.sectionSpacing} />

      <Text style={styles.sectionTitle}>Lent</Text>
      <BookList books={lentBooks} isLoading={false} />

      <View style={styles.sectionSpacing} />

      <Text style={styles.sectionTitle}>Borrowed</Text>
      <BookList books={borrowedBooks} isLoading={false} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  content: {
    paddingBottom: 24,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: "700",
    color: "#111",
    paddingHorizontal: 16,
    paddingTop: 16,
    marginBottom: 4,
  },
  sectionSpacing: {
    height: 8,
  },
});