import {
  ActivityIndicator,
  FlatList,
  StyleSheet,
  Text,
  View,
} from "react-native";
import BookCard, { Book } from "./BookCard";

type BookListProps = {
  books: Book[];
  isLoading: boolean;
  showDelete?: boolean;
  showSwap?: boolean;
  showRequest?: boolean;
  onRequest?: (book: Book) => void;
  onDelete?: (book: Book) => void;
  onSwap?: (book: Book) => void;
};

export default function BookList({
  books,
  isLoading,
  showDelete = false,
  showSwap = false,
  showRequest = false,
  onRequest,
  onDelete,
  onSwap,
}: BookListProps) {
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
      showsVerticalScrollIndicator={false}
      renderItem={({ item }) => (
        <BookCard
          book={item}
          showDelete={showDelete}
          showSwap={showSwap}
          showRequest={showRequest}
          onRequest={onRequest}
          onDelete={onDelete}
          onSwap={onSwap}
        />
      )}
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