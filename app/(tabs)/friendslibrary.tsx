import BookList from "@/components/BookList";
import type { Book } from "@/context/BooksContext";
import { useSession } from "@/context/UserContext";
import { buildBorrowRequestMessage } from "@/utils/borrowRequest";
import axios from "axios";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { Alert, Image, StyleSheet, Text, View } from "react-native";

const API_BASE_URL = "https://boroughbooks.onrender.com/api";

interface Conversation {
  conversation_id: number;
  user1_username: string;
  user2_username: string;
  created_at: string;
}

export default function FriendsLibrary() {
  const { username, profilepic } = useLocalSearchParams();
  const router = useRouter();
  const { user } = useSession();

  const friendUsername = Array.isArray(username) ? username[0] : username;

  const [books, setBooks] = useState<Book[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSendingRequest, setIsSendingRequest] = useState(false);

  useEffect(() => {
    async function fetchFriendsBooks() {
      if (!friendUsername) return;

      setIsLoading(true);

      try {
        const encodedUsername = encodeURIComponent(friendUsername);

        const [libraryResponse, loanedResponse] = await Promise.all([
          axios.get<{ books: Book[] }>(
            `${API_BASE_URL}/users/${encodedUsername}/my-library`,
          ),
          axios.get<{ books: Book[] }>(
            `${API_BASE_URL}/users/${encodedUsername}/loaned`,
          ),
        ]);

        const libraryBooks = libraryResponse.data.books || [];
        const loanedBooks = loanedResponse.data.books || [];

        const loanedBooksByIsbn = new Map(
          loanedBooks.map((book) => [book.isbn, book]),
        );

        const mergedBooks = libraryBooks.map((book) => {
          const loanedMatch = loanedBooksByIsbn.get(book.isbn);

          if (!loanedMatch) {
            return {
              ...book,
              is_loaned: false,
            };
          }

          return {
            ...book,
            is_loaned: true,
            borrower_id: loanedMatch.borrower_id,
            borrower_profile_pic: loanedMatch.borrower_profile_pic,
          };
        });

        setBooks(mergedBooks);
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
      `${API_BASE_URL}/conversations/${encodeURIComponent(currentUsername)}`,
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

  const sendBorrowRequestMessage = async (
    conversationId: number,
    senderUsername: string,
    book: Book,
  ) => {
    const content = buildBorrowRequestMessage({
      isbn: book.isbn,
      title: book.title,
      imagelinks: book.imagelinks,
    });

    const response = await fetch(`${API_BASE_URL}/messages`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        conversation_id: conversationId,
        sender_username: senderUsername,
        content,
      }),
    });

    if (!response.ok) {
      const text = await response.text();
      throw new Error(`Failed to send borrow request: ${text}`);
    }

    return response.json();
  };

  const handleRequestBook = async (book: Book) => {
    if (!user?.username) {
      Alert.alert("Error", "No logged in user found.");
      return;
    }

    if (!friendUsername) {
      Alert.alert("Error", "Could not find this friend's username.");
      return;
    }

    if (book.is_loaned) {
      Alert.alert(
        "Unavailable",
        `This book is already borrowed by ${book.borrower_id ?? "someone else"}.`,
      );
      return;
    }

    if (isSendingRequest) return;

    setIsSendingRequest(true);

    try {
      const existingConversation = await findExistingConversation(
        user.username,
        friendUsername,
      );

      const conversation =
        existingConversation ??
        (await createConversation(user.username, friendUsername));

      await sendBorrowRequestMessage(
        conversation.conversation_id,
        user.username,
        book,
      );

      router.push({
        pathname: "/messages",
        params: {
          conversationId: String(conversation.conversation_id),
          otherUsername: friendUsername,
        },
      });
    } catch (error: any) {
      console.error("Failed to start borrow request:", error);
      Alert.alert(
        "Error",
        error?.message || "Could not send borrow request for this book.",
      );
    } finally {
      setIsSendingRequest(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Image source={{ uri: profilepic as string }} style={styles.avatar} />
        <Text style={styles.title}>{friendUsername}&apos;s Library</Text>
      </View>

      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Library</Text>
      </View>

      <BookList
        books={books}
        isLoading={isLoading}
        showRequest
        onRequest={handleRequestBook}
        collectionType="library"
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
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginRight: 12,
    backgroundColor: "#D9D9D9",
  },
});
