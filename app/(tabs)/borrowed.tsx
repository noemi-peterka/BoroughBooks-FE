import Ionicons from "@expo/vector-icons/Ionicons";
import { router } from "expo-router";
import { useState } from "react";
import {
  Alert,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import BookList from "../../components/BookList";
import { useBooks, type Book } from "../../context/BooksContext";
import { returnBook } from "../../utils/returnBook";

export default function BorrowedScreen() {
  const { borrowedBooks, deleteBook } = useBooks();
  const [search, setSearch] = useState("");

  const filteredBooks = borrowedBooks.filter((book) => {
    const query = search.trim().toLowerCase();

    return (
      book.imagelinks &&
      (book.title.toLowerCase().includes(query) ||
        book.authors.toLowerCase().includes(query))
    );
  });

  const handleDeleteBook = (book: Book) => {
    deleteBook("borrowed", book.isbn);
  };

  const handleLendBook = (book: Book) => {
    Alert.alert("Lend book", `You selected "${book.title}" to lend.`);
  };

  const handleReturnBook = (book: Book, ownerUsername: string) => {
    Alert.alert("Return book", `Return "${book.title}" to ${book.username}?`, [
      {
        text: "No",
        onPress: () => console.log("Cancel Pressed"),
        style: "cancel",
      },
      {
        text: "Yes",
        onPress: async () => {
          await returnBook(book);
          Alert.alert(
            `You've returned this book to ${book.username}. Thank you!`,
          );
        },
      },
    ]);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.iconButton}
        >
          <Ionicons name="chevron-back" size={30} color="#111" />
        </TouchableOpacity>
      </View>

      <View style={styles.searchWrapper}>
        <Ionicons name="search-outline" size={18} color="#7A7A7A" />
        <TextInput
          placeholder="Search"
          placeholderTextColor="#7A7A7A"
          style={styles.searchInput}
          value={search}
          onChangeText={setSearch}
        />
        {search.length > 0 && (
          <Ionicons
            name="close-circle"
            size={18}
            color="#7A7A7A"
            onPress={() => setSearch("")}
          />
        )}
      </View>

      <BookList
        books={filteredBooks}
        isLoading={false}
        showReturn
        onReturn={handleReturnBook}
        collectionType="borrowed"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    paddingHorizontal: 18,
    paddingTop: 18,
    paddingBottom: 12,
  },
  searchWrapper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#E9E9E9",
    borderRadius: 18,
    paddingHorizontal: 10,
    height: 38,
    marginBottom: 20,
  },
  searchInput: {
    flex: 1,
    marginHorizontal: 8,
    fontSize: 14,
    color: "#111",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  iconButton: {
    width: 36,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 8,
  },
  heading: {
    flex: 1,
    fontSize: 24,
    fontWeight: "700",
    color: "#111",
  },
});
