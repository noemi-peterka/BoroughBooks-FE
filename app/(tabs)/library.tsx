import { useEffect, useState } from "react";
import { StyleSheet, View } from "react-native";
import BookList from "../../components/BookList";
import { books as mockBooks } from "../../data/books";

export type Book = {
  id: number;
  title: string;
  author: string;
  genre: string;
  year: number;
  description: string;
  cover: string;
};

export default function Library() {
  const [books, setBooks] = useState<Book[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setBooks(mockBooks);
      setIsLoading(false);
    }, 1500);

    return () => clearTimeout(timer);
  }, []);

  return (
    <View style={styles.container}>
      <BookList books={books} isLoading={isLoading} showAddTile />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
});
