import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  TextInput,
} from "react-native";
import { useRouter } from "expo-router";

interface Conversation {
  conversation_id: number;
  user1_username: string;
  user2_username: string;
  created_at: string;
}

interface ConversationListProps {
  currentUsername: string;
  backendUrl: string;
}

export default function ConversationListScreen({
  currentUsername,
  backendUrl,
}: ConversationListProps) {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [newChatUsername, setNewChatUsername] = useState("");
  const [creating, setCreating] = useState(false);
  const router = useRouter();

  useEffect(() => {
    loadConversations();
  }, []);

  const loadConversations = async () => {
    try {
      setLoading(true);
      const response = await fetch(
        `https://boroughbooks.onrender.com/api/conversations?username=${currentUsername}`,
      );

      if (!response.ok) {
        throw new Error("Failed to load conversations");
      }

      const data = await response.json();
      setConversations(data.conversations || []);
    } catch (error) {
      console.error("Error loading conversations:", error);
      alert("Failed to load conversations. Check your backend URL.");
    } finally {
      setLoading(false);
    }
  };

  const createNewConversation = async () => {
    if (!newChatUsername.trim()) {
      alert("Please enter a username");
      return;
    }

    if (newChatUsername.trim() === currentUsername) {
      alert("You can't chat with yourself!");
      return;
    }

    try {
      setCreating(true);
      const response = await fetch(
        `https://boroughbooks.onrender.com/api/conversations`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            user1_username: currentUsername,
            user2_username: newChatUsername.trim(),
          }),
        },
      );

      if (!response.ok) {
        throw new Error("Failed to create conversation");
      }

      const data = await response.json();
      const conversation = data.conversation;

      // Navigate to chat screen
      openChat(conversation.conversation_id, newChatUsername.trim());

      setNewChatUsername("");
      loadConversations(); // Refresh list
    } catch (error) {
      console.error("Error creating conversation:", error);
      alert("Failed to start conversation. Make sure the user exists.");
    } finally {
      setCreating(false);
    }
  };

  const openChat = (conversationId: number, otherUsername: string) => {
    router.push({
      pathname: "/chat",
      params: {
        conversationId,
        currentUsername,
        otherUsername,
        backendUrl,
      },
    });
  };

  const getOtherUsername = (conv: Conversation): string => {
    return conv.user1_username === currentUsername
      ? conv.user2_username
      : conv.user1_username;
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

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>Loading conversations...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Messages</Text>
        <Text style={styles.headerSubtitle}>
          Logged in as {currentUsername}
        </Text>
      </View>

      {/* New Chat Section */}
      <View style={styles.newChatSection}>
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
      </View>

      {/* Conversations List */}
      <FlatList
        data={conversations}
        keyExtractor={(item) => item.conversation_id.toString()}
        renderItem={renderConversation}
        contentContainerStyle={styles.listContent}
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
