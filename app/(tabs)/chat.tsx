import { useSession } from "@/context/UserContext";
import { Friend, getFriendsByUsername } from "@/utils/getData";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Image,
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
  const [friends, setFriends] = useState<Friend[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    if (!sessionLoading && currentUsername) {
      loadConversations();
      loadFriends();
    }
  }, [sessionLoading, currentUsername]);

  const loadFriends = async () => {
    if (!currentUsername) return;

    try {
      const friendsList = await getFriendsByUsername(currentUsername);
      const acceptedFriends = friendsList.filter(
        (friend) => friend.friend_status === "accepted",
      );
      setFriends(acceptedFriends);
    } catch (error: any) {
      console.error("Error loading friends:", error);
    }
  };

  const loadConversations = async () => {
    if (!currentUsername) return;

    try {
      setLoading(true);
      const response = await fetch(
        `${BACKEND_URL}/api/conversations/${currentUsername}`,
      );

      if (!response.ok) throw new Error("Failed to load");

      const data = await response.json();
      const allConversations = data.conversations || [];

      const conversationsWithMessages = await Promise.all(
        allConversations.map(async (conv: Conversation) => {
          try {
            const msgResponse = await fetch(
              `${BACKEND_URL}/api/conversations/${conv.conversation_id}/messages`,
            );
            const msgData = await msgResponse.json();
            return msgData.messages && msgData.messages.length > 0
              ? conv
              : null;
          } catch {
            return null;
          }
        }),
      );

      const filtered = conversationsWithMessages.filter(
        (conv) => conv !== null,
      ) as Conversation[];

      setConversations(filtered);
    } catch (error: any) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const startChatWithFriend = async (
    friendUsername: string,
    friendProfilePic: string,
  ) => {
    if (!currentUsername) {
      Alert.alert("Error", "No logged in user found.");
      return;
    }

    try {
      setCreating(true);

      const existingConversation = conversations.find((conv) => {
        const otherUser = getOtherUsername(conv);
        return otherUser === friendUsername;
      });

      if (existingConversation) {
        router.push({
          pathname: "/messages",
          params: {
            conversationId: String(existingConversation.conversation_id),
            otherUsername: friendUsername,
            otherProfilePic: friendProfilePic,
          },
        });
        return;
      }

      const response = await fetch(`${BACKEND_URL}/api/conversations`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          user1_username: currentUsername,
          user2_username: friendUsername,
        }),
      });

      if (!response.ok) {
        const text = await response.text();
        throw new Error(`Failed to create conversation: ${text}`);
      }

      const data = await response.json();
      const conversation = data.conversation;

      await loadConversations();

      router.push({
        pathname: "/messages",
        params: {
          conversationId: String(conversation.conversation_id),
          otherUsername: friendUsername,
          otherProfilePic: friendProfilePic,
        },
      });
    } catch (error: any) {
      console.error("Error creating conversation:", error);
      Alert.alert("Error", error?.message || "Failed to start conversation.");
    } finally {
      setCreating(false);
    }
  };

  const getFriendUsername = (friend: Friend) => {
    if (!currentUsername) return "";
    return friend.origin_username === currentUsername
      ? friend.relating_username
      : friend.origin_username;
  };

  const getFriendProfilePic = (friend: Friend) => {
    if (!currentUsername) return "";
    return friend.origin_username === currentUsername
      ? friend.friend_profile_pic_url
      : friend.origin_profile_pic_url;
  };

  const getOtherUsername = (conversation: Conversation) => {
    if (!currentUsername) return "";
    return conversation.user1_username === currentUsername
      ? conversation.user2_username
      : conversation.user1_username;
  };

  const getConversationProfilePic = (conversation: Conversation) => {
    const otherUsername = getOtherUsername(conversation);

    const friend = friends.find((f) => {
      const friendUsername = getFriendUsername(f);
      return friendUsername === otherUsername;
    });

    if (friend) {
      return getFriendProfilePic(friend);
    }

    return null;
  };

  const openChat = (
    conversationId: number,
    otherUsername: string,
    profilePic: string | null,
  ) => {
    router.push({
      pathname: "/messages",
      params: {
        conversationId: String(conversationId),
        otherUsername,
        otherProfilePic: profilePic ?? "",
      },
    });
  };

  const renderFriendItem = ({ item }: { item: Friend }) => {
    const friendUsername = getFriendUsername(item);
    const friendProfilePic = getFriendProfilePic(item);

    return (
      <TouchableOpacity
        style={styles.friendItem}
        onPress={() => startChatWithFriend(friendUsername, friendProfilePic)}
        disabled={creating}
      >
        <Image source={{ uri: friendProfilePic }} style={styles.friendAvatar} />
        <Text style={styles.friendName} numberOfLines={1}>
          {friendUsername}
        </Text>
      </TouchableOpacity>
    );
  };

  const renderConversation = ({ item }: { item: Conversation }) => {
    const otherUsername = getOtherUsername(item);
    const profilePic = getConversationProfilePic(item);

    return (
      <TouchableOpacity
        style={styles.conversationItem}
        onPress={() =>
          openChat(item.conversation_id, otherUsername, profilePic)
        }
      >
        {profilePic ? (
          <Image
            source={{ uri: profilePic }}
            style={styles.conversationAvatar}
          />
        ) : (
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {otherUsername.charAt(0).toUpperCase()}
            </Text>
          </View>
        )}

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

      {friends.length > 0 && (
        <View style={styles.friendsSection}>
          <Text style={styles.sectionTitle}>Start a chat with friends</Text>
          <FlatList
            horizontal
            data={friends}
            keyExtractor={(item) => item.user_relationship_id.toString()}
            renderItem={renderFriendItem}
            contentContainerStyle={styles.friendsList}
            showsHorizontalScrollIndicator={false}
          />
        </View>
      )}

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
              No conversations yet.{"\n"}
              {friends.length > 0
                ? "Start one with a friend above!"
                : "Add some friends to start chatting!"}
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
  headerSubtitle: {
    fontSize: 14,
    color: "#666",
    marginTop: 4,
  },
  friendsSection: {
    backgroundColor: "#fff",
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#111",
    marginBottom: 12,
    paddingHorizontal: 16,
  },
  friendsList: {
    paddingHorizontal: 12,
  },
  friendItem: {
    alignItems: "center",
    marginHorizontal: 4,
    width: 70,
  },
  friendAvatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "#D9D9D9",
    marginBottom: 6,
  },
  friendName: {
    fontSize: 12,
    color: "#111",
    textAlign: "center",
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
  conversationAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "#D9D9D9",
    marginRight: 12,
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
