import { useBooks } from "@/context/BooksContext";
import { useSession } from "@/context/UserContext";
import {
  buildBorrowApprovedMessage,
  buildBorrowDeclinedMessage,
  parseBorrowApprovedMessage,
  parseBorrowDeclinedMessage,
  parseBorrowRequestMessage,
} from "@/utils/borrowRequest";
import { createLoan } from "@/utils/createLoan";
import { supabase } from "@/utils/supabase";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Image,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

const BACKEND_URL = "https://boroughbooks.onrender.com";

interface Message {
  message_id: number;
  conversation_id: number;
  sender_username: string;
  content: string;
  sent_at: string;
  read_at: string | null;
}

export default function MessagesScreen() {
  const params = useLocalSearchParams();
  const router = useRouter();
  const { user, isLoading: sessionLoading } = useSession();
  const { refetchBooks } = useBooks();

  const currentUsername = user?.username;
  const conversationId = Number(params.conversationId);
  const otherUsername = (params.otherUsername as string) || "Chat";
  const otherProfilePic = (params.otherProfilePic as string) || "";

  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [processingRequestId, setProcessingRequestId] = useState<number | null>(
    null,
  );

  const flatListRef = useRef<FlatList>(null);

  useEffect(() => {
    if (!sessionLoading && currentUsername && conversationId) {
      loadMessages();
    }
  }, [sessionLoading, currentUsername, conversationId]);

  const loadMessages = async () => {
    try {
      setLoading(true);

      const response = await fetch(
        `${BACKEND_URL}/api/conversations/${conversationId}/messages`,
      );

      if (!response.ok) {
        const text = await response.text();
        throw new Error(`Failed to load messages: ${text}`);
      }

      const data = await response.json();
      setMessages(data.messages || []);
    } catch (error: any) {
      console.error("Error loading messages:", error);
      Alert.alert("Error", error?.message || "Failed to load messages.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!conversationId) return;

    const channel = supabase
      .channel(`conversation-${conversationId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
          filter: `conversation_id=eq.${conversationId}`,
        },
        (payload) => {
          const incomingMessage = payload.new as Message;

          setMessages((prev) => {
            const exists = prev.some(
              (message) => message.message_id === incomingMessage.message_id,
            );
            if (exists) return prev;
            return [...prev, incomingMessage];
          });

          setTimeout(() => {
            flatListRef.current?.scrollToEnd({ animated: true });
          }, 100);
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [conversationId]);

  const sendMessage = async (contentOverride?: string) => {
    if (!currentUsername) {
      Alert.alert("Error", "No logged in user found.");
      return;
    }

    const messageContent = (contentOverride ?? newMessage).trim();
    if (!messageContent) return;

    if (!contentOverride) {
      setNewMessage("");
    }

    setSending(true);

    try {
      const response = await fetch(`${BACKEND_URL}/api/messages`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          conversation_id: conversationId,
          sender_username: currentUsername,
          content: messageContent,
        }),
      });

      if (!response.ok) {
        const text = await response.text();
        throw new Error(`Failed to send message: ${text}`);
      }

      await response.json();
    } catch (error: any) {
      console.error("Error sending message:", error);
      Alert.alert("Error", error?.message || "Failed to send message.");

      if (!contentOverride) {
        setNewMessage(messageContent);
      }
    } finally {
      setSending(false);
    }
  };

  const hasRequestBeenResolved = (message: Message) => {
    const request = parseBorrowRequestMessage(message.content);
    if (!request) return false;

    return messages.some((otherMessage) => {
      const approved = parseBorrowApprovedMessage(otherMessage.content);
      if (approved && approved.isbn === request.isbn) return true;

      const declined = parseBorrowDeclinedMessage(otherMessage.content);
      if (declined && declined.isbn === request.isbn) return true;

      return false;
    });
  };

  const handleApproveBorrow = async (message: Message) => {
    if (!currentUsername) {
      Alert.alert("Error", "No logged in user found.");
      return;
    }

    const request = parseBorrowRequestMessage(message.content);
    if (!request) {
      Alert.alert("Error", "This borrow request could not be read.");
      return;
    }

    setProcessingRequestId(message.message_id);

    try {
      await createLoan(currentUsername, request.isbn, message.sender_username);

      await sendMessage(
        buildBorrowApprovedMessage({
          isbn: request.isbn,
          title: request.title,
          imagelinks: request.imagelinks,
        }),
      );

      await refetchBooks();

      Alert.alert("Approved", `"${request.title}" has been loaned out.`);
    } catch (error: any) {
      console.error("Error approving borrow request:", error);
      Alert.alert(
        "Error",
        error?.message || "Failed to approve borrow request.",
      );
    } finally {
      setProcessingRequestId(null);
    }
  };

  const handleRejectBorrow = async (message: Message) => {
    const request = parseBorrowRequestMessage(message.content);
    if (!request) {
      Alert.alert("Error", "This borrow request could not be read.");
      return;
    }

    setProcessingRequestId(message.message_id);

    try {
      await sendMessage(
        buildBorrowDeclinedMessage({
          isbn: request.isbn,
          title: request.title,
          imagelinks: request.imagelinks,
        }),
      );

      Alert.alert("Declined", `Request for "${request.title}" was declined.`);
    } catch (error: any) {
      console.error("Error declining borrow request:", error);
      Alert.alert(
        "Error",
        error?.message || "Failed to decline borrow request.",
      );
    } finally {
      setProcessingRequestId(null);
    }
  };

  const renderMessage = ({ item }: { item: Message }) => {
    const isMyMessage = item.sender_username === currentUsername;

    const borrowRequest = parseBorrowRequestMessage(item.content);
    const borrowApproved = parseBorrowApprovedMessage(item.content);
    const borrowDeclined = parseBorrowDeclinedMessage(item.content);

    if (borrowRequest) {
      const isOwnerViewing = !isMyMessage;
      const resolved = hasRequestBeenResolved(item);
      const isProcessing = processingRequestId === item.message_id;

      return (
        <View
          style={[
            styles.messageContainer,
            isMyMessage ? styles.myMessage : styles.otherMessage,
          ]}
        >
          {!isMyMessage && (
            <Text style={styles.senderName}>{item.sender_username}</Text>
          )}

          <View style={styles.requestCard}>
            <Text style={styles.requestLabel}>Borrow request</Text>

            {!!borrowRequest.imagelinks && (
              <Image
                source={{ uri: borrowRequest.imagelinks }}
                style={styles.requestBookCover}
                resizeMode="cover"
              />
            )}

            <Text
              style={[
                styles.requestTitle,
                isMyMessage ? styles.myMessageText : styles.otherMessageText,
              ]}
            >
              {borrowRequest.title}
            </Text>

            {isOwnerViewing && !resolved && (
              <View style={styles.requestActionRow}>
                <TouchableOpacity
                  style={styles.requestActionButton}
                  onPress={() => handleApproveBorrow(item)}
                  disabled={isProcessing}
                >
                  <Ionicons
                    name="checkmark-circle"
                    size={24}
                    color={isProcessing ? "#999" : "green"}
                  />
                  <Text style={styles.requestActionText}>Approve</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.requestActionButton}
                  onPress={() => handleRejectBorrow(item)}
                  disabled={isProcessing}
                >
                  <Ionicons
                    name="close-circle"
                    size={24}
                    color={isProcessing ? "#999" : "red"}
                  />
                  <Text style={styles.requestActionText}>Decline</Text>
                </TouchableOpacity>
              </View>
            )}

            {resolved && (
              <Text
                style={[
                  styles.resolvedText,
                  isMyMessage
                    ? styles.myResolvedText
                    : styles.otherResolvedText,
                ]}
              >
                This request has been handled.
              </Text>
            )}
          </View>

          <Text style={styles.timestamp}>
            {new Date(item.sent_at).toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </Text>
        </View>
      );
    }

    if (borrowApproved) {
      return (
        <View
          style={[
            styles.messageContainer,
            isMyMessage ? styles.myMessage : styles.otherMessage,
          ]}
        >
          {!isMyMessage && (
            <Text style={styles.senderName}>{item.sender_username}</Text>
          )}

          <View style={styles.requestCard}>
            <Text style={styles.requestLabel}>Borrow approved</Text>

            {!!borrowApproved.imagelinks && (
              <Image
                source={{ uri: borrowApproved.imagelinks }}
                style={styles.requestBookCover}
                resizeMode="cover"
              />
            )}

            <Text
              style={[
                styles.messageText,
                isMyMessage ? styles.myMessageText : styles.otherMessageText,
              ]}
            >
              Approved: "{borrowApproved.title}" is ready to borrow.
            </Text>
          </View>

          <Text style={styles.timestamp}>
            {new Date(item.sent_at).toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </Text>
        </View>
      );
    }

    if (borrowDeclined) {
      return (
        <View
          style={[
            styles.messageContainer,
            isMyMessage ? styles.myMessage : styles.otherMessage,
          ]}
        >
          {!isMyMessage && (
            <Text style={styles.senderName}>{item.sender_username}</Text>
          )}

          <View style={styles.requestCard}>
            <Text style={styles.requestLabel}>Borrow declined</Text>

            {!!borrowDeclined.imagelinks && (
              <Image
                source={{ uri: borrowDeclined.imagelinks }}
                style={styles.requestBookCover}
                resizeMode="cover"
              />
            )}

            <Text
              style={[
                styles.messageText,
                isMyMessage ? styles.myMessageText : styles.otherMessageText,
              ]}
            >
              Declined: "{borrowDeclined.title}" is not available right now.
            </Text>
          </View>

          <Text style={styles.timestamp}>
            {new Date(item.sent_at).toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </Text>
        </View>
      );
    }

    return (
      <View
        style={[
          styles.messageContainer,
          isMyMessage ? styles.myMessage : styles.otherMessage,
        ]}
      >
        {!isMyMessage && (
          <Text style={styles.senderName}>{item.sender_username}</Text>
        )}

        <Text
          style={[
            styles.messageText,
            isMyMessage ? styles.myMessageText : styles.otherMessageText,
          ]}
        >
          {item.content}
        </Text>

        <Text style={styles.timestamp}>
          {new Date(item.sent_at).toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          })}
        </Text>
      </View>
    );
  };

  if (sessionLoading || loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>Loading messages...</Text>
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
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      keyboardVerticalOffset={90}
    >
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.push("/(tabs)/chat")}
          style={styles.backButton}
        >
          <Text style={styles.backText}>‹ Back</Text>
        </TouchableOpacity>

        {otherProfilePic ? (
          <Image source={{ uri: otherProfilePic }} style={styles.avatar} />
        ) : null}

        <Text style={styles.headerTitle}>{otherUsername}</Text>
      </View>

      <FlatList
        ref={flatListRef}
        data={messages}
        keyExtractor={(item) => item.message_id.toString()}
        renderItem={renderMessage}
        contentContainerStyle={styles.messagesList}
        onContentSizeChange={() =>
          flatListRef.current?.scrollToEnd({ animated: true })
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No messages yet. Say hello! 👋</Text>
          </View>
        }
      />

      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          value={newMessage}
          onChangeText={setNewMessage}
          placeholder="Type a message..."
          placeholderTextColor="#999"
          multiline
          maxLength={500}
          editable={!sending}
        />

        <TouchableOpacity
          style={[
            styles.sendButton,
            (!newMessage.trim() || sending) && styles.sendButtonDisabled,
          ]}
          onPress={() => sendMessage()}
          disabled={!newMessage.trim() || sending}
        >
          {sending ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <Text style={styles.sendButtonText}>Send</Text>
          )}
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
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
    paddingTop: 50,
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
    flexDirection: "row",
    alignItems: "center",
  },
  backButton: {
    marginRight: 12,
  },
  backText: {
    fontSize: 18,
    color: "#007AFF",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#111",
  },
  messagesList: {
    padding: 16,
    flexGrow: 1,
  },
  messageContainer: {
    maxWidth: "75%",
    padding: 12,
    borderRadius: 16,
    marginBottom: 12,
  },
  myMessage: {
    alignSelf: "flex-end",
    backgroundColor: "#007AFF",
  },
  otherMessage: {
    alignSelf: "flex-start",
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#e0e0e0",
  },
  senderName: {
    fontSize: 12,
    fontWeight: "600",
    color: "#666",
    marginBottom: 4,
  },
  messageText: {
    fontSize: 16,
    lineHeight: 20,
  },
  myMessageText: {
    color: "#fff",
  },
  otherMessageText: {
    color: "#111",
  },
  timestamp: {
    fontSize: 11,
    color: "#999",
    marginTop: 4,
    alignSelf: "flex-end",
  },
  requestCard: {
    gap: 4,
  },
  requestLabel: {
    fontSize: 12,
    color: "#666",
    textTransform: "uppercase",
    letterSpacing: 0.4,
  },
  requestTitle: {
    fontSize: 16,
    fontWeight: "700",
    lineHeight: 22,
  },
  requestBookCover: {
    width: 90,
    height: 130,
    borderRadius: 8,
    marginTop: 6,
    marginBottom: 10,
  },
  requestActionRow: {
    flexDirection: "row",
    gap: 20,
    marginTop: 8,
  },
  requestActionButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  requestActionText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#111",
  },
  resolvedText: {
    marginTop: 8,
    fontSize: 13,
    fontStyle: "italic",
  },
  myResolvedText: {
    color: "#E5E7EB",
  },
  otherResolvedText: {
    color: "#666",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 16,
    color: "#999",
    textAlign: "center",
  },
  inputContainer: {
    flexDirection: "row",
    padding: 12,
    backgroundColor: "#fff",
    borderTopWidth: 1,
    borderTopColor: "#e0e0e0",
    alignItems: "flex-end",
  },
  input: {
    flex: 1,
    backgroundColor: "#f0f0f0",
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    fontSize: 16,
    maxHeight: 100,
    marginRight: 8,
  },
  sendButton: {
    backgroundColor: "#007AFF",
    borderRadius: 20,
    paddingHorizontal: 20,
    paddingVertical: 10,
    justifyContent: "center",
    alignItems: "center",
    minWidth: 60,
  },
  sendButtonDisabled: {
    backgroundColor: "#ccc",
  },
  sendButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    marginRight: 8,
    backgroundColor: "#D9D9D9",
  },
});
