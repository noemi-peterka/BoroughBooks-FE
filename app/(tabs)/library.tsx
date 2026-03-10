
import { useEffect, useState } from "react";
import { Alert, StyleSheet, View } from "react-native";
import BookList from "../../components/BookList";
import { books as mockBooks } from "../../data/books";
import type { Book } from "../../components/BookCard";
import { useBooks } from "../../context/BooksContext";

export default function Library() {
  const { books } = useBooks();

  const handleDeleteBook = (book: Book) => {
    setBooks((prevBooks) => prevBooks.filter((item) => item.id !== book.id));
  };

  const handleLendBook = (book: Book) => {
    Alert.alert("Lend book", `You selected "${book.title}" to lend.`);
  };

  return (
    <View style={styles.container}>
      <BookList
        books={books}
        isLoading={isLoading}
        showDelete={true}
        showSwap={true}
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