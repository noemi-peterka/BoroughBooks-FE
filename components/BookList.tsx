import {
  ActivityIndicator,
  FlatList,
  StyleSheet,
  Text,
  View,
} from "react-native";
import BookCard from "./BookCard";

type Book = {
  id: number;
  title: string;
  author: string;
  genre: string;
  year: number;
  description: string;
  cover: string;
};

type BookListProps = {
  books: Book[];
  isLoading: boolean;
};

export default function BookList({ books, isLoading }: BookListProps) {
  if (isLoading) {
    return (
      <View style={styles.stateContainer}>
        <ActivityIndicator size="large" />
        <Text style={styles.stateText}>Loading books...</Text>
      </View>
    );
  }

  if (books.length === 0) {
    return (
      <View style={styles.stateContainer}>
        <Text style={styles.stateText}>No books found.</Text>
      </View>
    );
  }
  return (
    <FlatList
      data={books}
      keyExtractor={(item) => item.id.toString()}
      numColumns={2}
      columnWrapperStyle={styles.row}
      contentContainerStyle={styles.container}
      renderItem={({ item }) => <BookCard book={item} />}
    />
  );
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: 10,
  },

  row: {
    justifyContent: "space-between",
    paddingHorizontal: 16,
  },

  stateContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },

  stateText: {
    marginTop: 12,
    fontSize: 16,
  },
});
