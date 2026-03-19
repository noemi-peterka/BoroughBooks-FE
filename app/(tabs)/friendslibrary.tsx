import BookList from "@/components/BookList";
import type { Book } from "@/context/BooksContext";
import axios from "axios";
import { useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import { Image, StyleSheet, Text, View } from "react-native";

const API_BASE_URL = "https://boroughbooks.onrender.com/api";

export default function FriendsLibrary() {
  const { username, profilepic } = useLocalSearchParams();

  const [books, setBooks] = useState<Book[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    async function fetchFriendsBooks() {
      setIsLoading(true);
      try {
        const response = await axios.get<{ books: Book[] }>(
          `${API_BASE_URL}/users/${username}/my-library`,
        );
        setBooks(response.data.books);
      } catch (error) {
        console.error("Failed to fetch Friend's Library:", error);
      } finally {
        setIsLoading(false);
      }
    }
    fetchFriendsBooks();
  }, [username]);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Image source={{ uri: profilepic as string }} style={styles.avatar} />
        <Text style={styles.title}>{username}'s Library</Text>
      </View>
      <BookList books={books} isLoading={isLoading} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    gap: 16,
  },
  backButton: {
    fontSize: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: "600",
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingTop: 16,
    marginBottom: 4,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: "700",
    color: "#111",
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginRight: 12,
    backgroundColor: "#D9D9D9",
  },
});
