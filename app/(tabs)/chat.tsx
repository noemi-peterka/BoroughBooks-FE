import { useSession } from "@/context/UserContext";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

const BACKEND_URL = "https://boroughbooks.onrender.com";

interface Conversation {
  conversation_id: number;
  user1_username: string;
  user2_username: string;
  created_at: string;
}

export default function ConversationListScreen() {
  const router = useRouter();
  const { user, isLoading: sessionLoading } = useSession();

  const currentUsername = user?.username;

  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [newChatUsername, setNewChatUsername] = useState("");
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    if (!sessionLoading && currentUsername) {
      loadConversations();
    }
  }, [sessionLoading, currentUsername]);

  const loadConversations = async () => {
    if (!currentUsername) return;

    try {
      setLoading(true);

      const response = await fetch(
        `${BACKEND_URL}/api/conversations/${currentUsername}`,
      );

      if (!response.ok) {
        const text = await response.text();
        throw new Error(`Failed to load conversations: ${text}`);
      }

      const data = await response.json();
      setConversations(data.conversations || []);
    } catch (error: any) {
      console.error("Error loading conversations:", error);
      Alert.alert("Error", error?.message || "Failed to load conversations.");
    } finally {
      setLoading(false);
    }
  };

  const createNewConversation = async () => {
    if (!currentUsername) {
      Alert.alert("Error", "No logged in user found.");
      return;
    }

    const trimmedUsername = newChatUsername.trim();

    if (!trimmedUsername) {
      Alert.alert("Error", "Please enter a username.");
      return;
    }

    if (trimmedUsername === currentUsername) {
      Alert.alert("Error", "You can't chat with yourself.");
      return;
    }

    try {
      setCreating(true);

      const response = await fetch(`${BACKEND_URL}/api/conversations`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          user1_username: currentUsername,
          user2_username: trimmedUsername,
        }),
      });

      if (!response.ok) {
        const text = await response.text();
        throw new Error(`Failed to create conversation: ${text}`);
      }

      const data = await response.json();
      const conversation = data.conversation;

      setNewChatUsername("");
      await loadConversations();

      router.push({
        pathname: "/messages",
        params: {
          conversationId: String(conversation.conversation_id),
          otherUsername: trimmedUsername,
        },
      });
    } catch (error: any) {
      console.error("Error creating conversation:", error);
      Alert.alert("Error", error?.message || "Failed to start conversation.");
    } finally {
      setCreating(false);
    }
  };

  const getOtherUsername = (conversation: Conversation) => {
    if (!currentUsername) return "";
    return conversation.user1_username === currentUsername
      ? conversation.user2_username
      : conversation.user1_username;
  };

  const openChat = (conversationId: number, otherUsername: string) => {
    router.push({
      pathname: "/messages",
      params: {
        conversationId: String(conversationId),
        otherUsername,
      },
    });
  };

  const renderConversation = ({ item }: { item: Conversation }) => {
    const otherUsername = getOtherUsername(item);

    return (
      <TouchableOpacity
        style={styles.conversationItem}
        onPress={() => openChat(item.conversation_id, otherUsername)}
      >
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>
            {otherUsername.charAt(0).toUpperCase()}
          </Text>
        </View>

        <View style={styles.conversationInfo}>
          <Text style={styles.username}>{otherUsername}</Text>
          <Text style={styles.conversationDate}>
            Started {new Date(item.created_at).toLocaleDateString()}
          </Text>
        </View>

        <Text style={styles.arrow}>›</Text>
      </TouchableOpacity>
    );
  };

  if (sessionLoading || loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>Loading conversations...</Text>
      </View>
    );
  }

  if (!currentUsername) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>No user session found.</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerSubtitle}>
          Logged in as {currentUsername}
        </Text>
      </View>
      {/* start */}
      {/* <View style={styles.newChatSection}>
        <Text style={styles.sectionTitle}>Start New Chat</Text>

        <View style={styles.inputRow}>
          <TextInput
            style={styles.input}
            value={newChatUsername}
            onChangeText={setNewChatUsername}
            placeholder="Enter username..."
            placeholderTextColor="#999"
            autoCapitalize="none"
            editable={!creating}
          />

          <TouchableOpacity
            style={[
              styles.createButton,
              (!newChatUsername.trim() || creating) &&
                styles.createButtonDisabled,
            ]}
            onPress={createNewConversation}
            disabled={!newChatUsername.trim() || creating}
          >
            {creating ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <Text style={styles.createButtonText}>Start</Text>
            )}
          </TouchableOpacity>
        </View>
      </View> */}

      <FlatList
        data={conversations}
        keyExtractor={(item) => item.conversation_id.toString()}
        renderItem={renderConversation}
        contentContainerStyle={styles.listContent}
        refreshing={loading}
        onRefresh={loadConversations}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>
              No conversations yet.{"\n"}Start one above!
            </Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f5f5f5",
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: "#666",
  },
  header: {
    backgroundColor: "#fff",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: "700",
    color: "#111",
  },
  headerSubtitle: {
    fontSize: 14,
    color: "#666",
    marginTop: 4,
  },
  newChatSection: {
    backgroundColor: "#fff",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#111",
    marginBottom: 12,
  },
  inputRow: {
    flexDirection: "row",
    gap: 8,
  },
  input: {
    flex: 1,
    backgroundColor: "#f0f0f0",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
  },
  createButton: {
    backgroundColor: "#007AFF",
    borderRadius: 8,
    paddingHorizontal: 20,
    justifyContent: "center",
    alignItems: "center",
    minWidth: 70,
  },
  createButtonDisabled: {
    backgroundColor: "#ccc",
  },
  createButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  listContent: {
    flexGrow: 1,
  },
  conversationItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "#007AFF",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  avatarText: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "600",
  },
  conversationInfo: {
    flex: 1,
  },
  username: {
    fontSize: 17,
    fontWeight: "600",
    color: "#111",
    marginBottom: 4,
  },
  conversationDate: {
    fontSize: 14,
    color: "#666",
  },
  arrow: {
    fontSize: 24,
    color: "#ccc",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 16,
    color: "#999",
    textAlign: "center",
    lineHeight: 24,
  },
});
