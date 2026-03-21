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

import type { Book } from "../context/BooksContext";
import BookCard from "./BookCard";

type LibraryItem = { type: "add"; id: string } | ({ type: "book" } & Book);

type BookListProps = {
  books: Book[];
  isLoading: boolean;
  showDelete?: boolean;
  showSwap?: boolean;
  showRequest?: boolean;
  showReturn?: boolean;
  onRequest?: (book: Book) => void;
  onDelete?: (book: Book) => void;
  onSwap?: (book: Book) => void;
  onReturn?: (book: Book) => void;
  addToCollection?: "library" | "wishlist" | "borrowed" | "lent";
  collectionType?: "library" | "wishlist" | "borrowed" | "lent";
  showAddTile?: boolean;
  layout?: "grid" | "carousel";
};

export default function BookList({
  books,
  isLoading,
  showDelete = false,
  showSwap = false,
  showRequest = false,
  showReturn = false,
  onRequest,
  onDelete,
  onSwap,
  onReturn,
  showAddTile = false,
  collectionType,
  layout = "grid",
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

  const renderItem = ({ item }: { item: LibraryItem }) => {
    if (item.type === "add") {
      return (
        <Pressable
          style={
            layout === "carousel" ? styles.carouselAddCard : styles.gridCard
          }
          onPress={() => router.push("/add-book")}
        >
          <View style={styles.addTile}>
            <Ionicons name="add" size={32} color="#000" />
            <Text style={styles.addTileText}>Add book</Text>
          </View>
        </Pressable>
      );
    }

    return (
      <View
        style={layout === "carousel" ? styles.carouselCard : styles.gridCard}
      >
        <BookCard
          book={item}
          showDelete={showDelete && !item.is_loaned}
          showSwap={showSwap}
          showReturn={showReturn}
          showRequest={showRequest && !item.is_loaned}
          onRequest={onRequest}
          onDelete={onDelete}
          onSwap={onSwap}
          onReturn={onReturn}
          collectionType={collectionType}
        />
      </View>
    );
  };

  const keyExtractor = (item: LibraryItem) =>
    item.type === "add" ? item.id : item.isbn;

  if (layout === "carousel") {
    return (
      <FlatList
        data={data}
        keyExtractor={keyExtractor}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.carouselContainer}
        renderItem={renderItem}
      />
    );
  }

  return (
    <FlatList
      data={data}
      keyExtractor={keyExtractor}
      numColumns={2}
      columnWrapperStyle={styles.row}
      contentContainerStyle={styles.gridContainer}
      showsVerticalScrollIndicator={false}
      renderItem={renderItem}
    />
  );
}

const styles = StyleSheet.create({
  gridContainer: {
    paddingVertical: 10,
  },
  carouselContainer: {
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  row: {
    justifyContent: "space-between",
    paddingHorizontal: 16,
  },
  gridCard: {
    width: "48%",
    marginVertical: 10,
  },
  carouselCard: {
    width: 160,
    height: 220,
    marginRight: 12,
  },
  addTile: {
    width: "100%",
    height: 220,
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#000",
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
  },

  addTileText: {
    marginTop: 8,
    fontSize: 14,
    fontWeight: "600",
    color: "#000",
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
  carouselAddCard: {
    width: 100,
    marginRight: 20,
    justifyContent: "flex-start",
  },
});
