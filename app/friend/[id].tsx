import { useEffect, useMemo, useState } from "react";
import {
  Alert,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import { router, Stack, useLocalSearchParams } from "expo-router";
import BookList from "../../components/BookList";
import type { Book } from "../../components/BookCard";
import { SafeAreaView } from "react-native-safe-area-context";

const friends = [
  { id: "1", name: "John Smith" },
  { id: "2", name: "Kevin Brown" },
  { id: "3", name: "Anna Pavlova" },
];

const booksByFriend: Record<string, (Book & { available: boolean })[]> = {
  "1": [
    {
      id: 1,
      title: "The Hobbit",
      author: "J.R.R. Tolkien",
      genre: "Fantasy",
      year: 1937,
      description: "Bilbo Baggins goes on an unexpected journey.",
      cover: "https://covers.openlibrary.org/b/isbn/9780345272577-L.jpg",
      available: true,
    },
    {
      id: 2,
      title: "1984",
      author: "George Orwell",
      genre: "Dystopian",
      year: 1949,
      description: "A novel about surveillance, control, and totalitarianism.",
      cover: "https://covers.openlibrary.org/b/isbn/9780451524935-L.jpg",
      available: true,
    },
    {
      id: 3,
      title: "Cracking the Coding Interview",
      author: "Gayle Laakmann McDowell",
      genre: "Programming",
      year: 2015,
      description: "Programming interview questions and solutions.",
      cover: "https://covers.openlibrary.org/b/isbn/9780984782857-L.jpg",
      available: true,
    },
    {
      id: 4,
      title: "God's Troubadour",
      author: "Sophie Jewett",
      genre: "Biography",
      year: 1910,
      description: "The story of Saint Francis of Assisi.",
      cover: "https://covers.openlibrary.org/b/isbn/9780690332605-L.jpg",
      available: true,
    },
  ],
  "2": [],
  "3": [],
};

export default function FriendLibraryScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [search, setSearch] = useState("");
  const [books, setBooks] = useState<Book[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const friend = friends.find((item) => item.id === id);

  useEffect(() => {
    const timer = setTimeout(() => {
      const friendBooks = booksByFriend[id ?? ""] || [];
      const availableBooks = friendBooks.filter((book) => book.available);
      setBooks(availableBooks);
      setIsLoading(false);
    }, 800);

    return () => clearTimeout(timer);
  }, [id]);

  const filteredBooks = useMemo(() => {
    return books.filter((book) =>
      book.title.toLowerCase().includes(search.trim().toLowerCase())
    );
  }, [books, search]);

  const handleRequestBook = (book: Book) => {
    Alert.alert("Request sent", `You requested "${book.title}"`);
  };

  return (
    <SafeAreaView style={styles.screen} edges={["top"]}>
      <Stack.Screen options={{ headerShown: false }} />

      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={32} color="#111" />
        </TouchableOpacity>

        <Text style={styles.title}>
          {friend ? `${friend.name}'s library` : "Friend's library"}
        </Text>

        <TouchableOpacity>
          <Ionicons name="menu" size={30} color="#111" />
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

      <View style={styles.listContainer}>
        <BookList
          books={filteredBooks}
          isLoading={isLoading}
          showRequest={true}
          onRequest={handleRequestBook}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#fff",
    paddingTop: 16,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  title: {
    flex: 1,
    fontSize: 22,
    fontWeight: "700",
    color: "#111",
    marginLeft: 8,
  },
  searchWrapper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#E9E9E9",
    borderRadius: 18,
    marginHorizontal: 16,
    paddingHorizontal: 10,
    height: 38,
    marginBottom: 8,
  },
  searchInput: {
    flex: 1,
    marginHorizontal: 8,
    fontSize: 14,
    color: "#111",
  },
  listContainer: {
    flex: 1,
  },
});