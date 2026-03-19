import BookList from "@/components/BookList";
import type { Book } from "@/context/BooksContext";
import { useSession } from "@/context/UserContext";
import axios from "axios";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { Alert, StyleSheet, Text, View } from "react-native";

const API_BASE_URL = "https://boroughbooks.onrender.com/api";

interface Conversation {
  conversation_id: number;
  user1_username: string;
  user2_username: string;
  created_at: string;
}

export default function FriendsLibrary() {
  const { username } = useLocalSearchParams();
  const router = useRouter();
  const { user } = useSession();

  const friendUsername = username as string;

  const [books, setBooks] = useState<Book[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    async function fetchFriendsBooks() {
      if (!friendUsername) return;

      setIsLoading(true);
      try {
        const response = await axios.get<{ books: Book[] }>(
          `${API_BASE_URL}/users/${friendUsername}/my-library`,
        );
        setBooks(response.data.books || []);
      } catch (error) {
        console.error("Failed to fetch friend's library:", error);
        Alert.alert("Error", "Could not load this friend's library.");
      } finally {
        setIsLoading(false);
      }
    }

    fetchFriendsBooks();
  }, [friendUsername]);

  const findExistingConversation = async (
    currentUsername: string,
    otherUsername: string,
  ) => {
    const response = await fetch(
      `${API_BASE_URL}/conversations/${currentUsername}`,
    );

    if (!response.ok) {
      const text = await response.text();
      throw new Error(`Failed to fetch conversations: ${text}`);
    }

    const data = await response.json();
    const conversations: Conversation[] = data.conversations || [];

    return conversations.find((conversation) => {
      return (
        (conversation.user1_username === currentUsername &&
          conversation.user2_username === otherUsername) ||
        (conversation.user1_username === otherUsername &&
          conversation.user2_username === currentUsername)
      );
    });
  };

  const createConversation = async (
    currentUsername: string,
    otherUsername: string,
  ) => {
    const response = await fetch(`${API_BASE_URL}/conversations`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        user1_username: currentUsername,
        user2_username: otherUsername,
      }),
    });

    if (!response.ok) {
      const text = await response.text();
      throw new Error(`Failed to create conversation: ${text}`);
    }

    const data = await response.json();
    return data.conversation as Conversation;
  };

  const handleRequestBook = async (book: Book) => {
    if (!user?.username) {
      Alert.alert("Error", "No logged in user found.");
      return;
    }

    try {
      const existingConversation = await findExistingConversation(
        user.username,
        friendUsername,
      );

      const conversation =
        existingConversation ??
        (await createConversation(user.username, friendUsername));

      router.push({
        pathname: "/messages",
        params: {
          conversationId: String(conversation.conversation_id),
          otherUsername: friendUsername,
          prefillText: `Can I borrow "${book.title}"?`,
          requestBookTitle: book.title,
          requestBookIsbn: book.isbn,
        },
      });
    } catch (error: any) {
      console.error("Failed to start borrow chat:", error);
      Alert.alert(
        "Error",
        error?.message || "Could not open chat for this book.",
      );
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>{friendUsername}'s Library</Text>
      </View>

      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Library</Text>
      </View>

      <BookList
        books={books}
        isLoading={isLoading}
        showRequest
        onRequest={handleRequestBook}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    gap: 16,
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
});
