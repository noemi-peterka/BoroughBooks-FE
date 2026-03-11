import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";

import type { Book } from "../data/books";
import BookCard from "./BookCard";

type LibraryItem = { type: "add"; id: string } | ({ type: "book" } & Book);

type BookListProps = {
  books: Book[];
  isLoading: boolean;

  showDelete?: boolean;
  showSwap?: boolean;
  showRequest?: boolean;

  onRequest?: (book: Book) => void;
  onDelete?: (book: Book) => void;
  onSwap?: (book: Book) => void;

  showAddTile?: boolean;
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
  showAddTile = false,
}: BookListProps) {
  const router = useRouter();

  if (isLoading) {
    return (
      <View style={styles.stateContainer}>
        <ActivityIndicator size="large" />
        <Text style={styles.stateText}>Loading books...</Text>
      </View>
    );
  }

  if (books.length === 0 && !showAddTile) {
    return (
      <View style={styles.stateContainer}>
        <Text style={styles.stateText}>No books found.</Text>
      </View>
    );
  }

  const data: LibraryItem[] = showAddTile
    ? [
        { type: "add", id: "add-tile" },
        ...books.map((book) => ({ ...book, type: "book" as const })),
      ]
    : books.map((book) => ({ ...book, type: "book" as const }));

  return (
    <FlatList
      data={data}
      keyExtractor={(item) => item.id.toString()}
      numColumns={2}
      columnWrapperStyle={styles.row}
      contentContainerStyle={styles.container}
      showsVerticalScrollIndicator={false}
      renderItem={({ item }) => {
        if (item.type === "add") {
          return (
            <Pressable
              style={styles.card}
              onPress={() => router.push("/add-book")}
            >
              <View style={styles.addTile}>
                <Ionicons name="add" size={40} color="#aaa" />
              </View>
            </Pressable>
          );
        }

        return (
          <BookCard
            book={item}
            showDelete={showDelete}
            showSwap={showSwap}
            showRequest={showRequest}
            onRequest={onRequest}
            onDelete={onDelete}
            onSwap={onSwap}
          />
        );
      }}
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

  card: {
    width: "48%",
    marginVertical: 10,
    borderRadius: 10,
    overflow: "hidden",
  },

  addTile: {
    width: "100%",
    height: 250,
    backgroundColor: "#e5e5e5",
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
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
