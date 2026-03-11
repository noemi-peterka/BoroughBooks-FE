import { useEffect, useRef, useState } from "react";
import {
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
import Ionicons from "@expo/vector-icons/Ionicons";
import { router, Stack, useLocalSearchParams } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";

type Book = {
  id: number;
  title: string;
  author: string;
  cover: string;
};

type Message = {
  id: string;
  sender: "me" | "friend";
  text: string;
  time: string;
  book?: Book;
};

const friends = [
  {
    id: "1",
    name: "John Smith",
    avatar: "https://randomuser.me/api/portraits/men/32.jpg",
  },
  {
    id: "2",
    name: "Kevin Brown",
    avatar: "https://randomuser.me/api/portraits/men/45.jpg",
  },
  {
    id: "3",
    name: "Anna Pavlova",
    avatar: "https://randomuser.me/api/portraits/women/65.jpg",
  },
];

const messagesByFriend: Record<string, Message[]> = {
  "1": [
    {
      id: "m1",
      sender: "me",
      text: "Hi John, can I borrow this book from you?",
      time: "15:10",
      book: {
        id: 1,
        title: "The Hobbit",
        author: "J.R.R. Tolkien",
        cover: "https://covers.openlibrary.org/b/isbn/9780345272577-L.jpg",
      },
    },
    {
      id: "m2",
      sender: "friend",
      text: "Sure, you can borrow it.",
      time: "15:20",
    },
  ],
  "2": [
    {
      id: "m3",
      sender: "friend",
      text: "Where would be convenient to meet?",
      time: "Yesterday",
    },
  ],
  "3": [],
};

export default function ChatDetailsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [messageText, setMessageText] = useState("");
  const flatListRef = useRef<FlatList<Message>>(null);

  const friend = friends.find((item) => item.id === id);

  const [messages, setMessages] = useState<Message[]>(
    messagesByFriend[id ?? ""] || []
  );

  const scrollToBottom = (animated = true) => {
    requestAnimationFrame(() => {
      flatListRef.current?.scrollToEnd({ animated });
    });
  };

  useEffect(() => {
    scrollToBottom(false);
  }, []);

  useEffect(() => {
    scrollToBottom(true);
  }, [messages]);

  const handleSend = () => {
    const trimmedMessage = messageText.trim();

    if (!trimmedMessage) return;

    const newMessage: Message = {
      id: Date.now().toString(),
      sender: "me",
      text: trimmedMessage,
      time: "Now",
    };

    setMessages((prev) => [...prev, newMessage]);
    setMessageText("");
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={["top"]}>
      <Stack.Screen options={{ headerShown: false }} />

      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={20}
      >
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={styles.iconButton}
          >
            <Ionicons name="chevron-back" size={30} color="#111" />
          </TouchableOpacity>

          <Text style={styles.title} numberOfLines={1}>
            {friend?.name ?? "Chat"}
          </Text>

          <View style={styles.iconButton} />
        </View>

        <FlatList
          ref={flatListRef}
          data={messages}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.messagesContainer}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          onContentSizeChange={() => scrollToBottom(false)}
          onLayout={() => scrollToBottom(false)}
          renderItem={({ item }) => {
            const isMe = item.sender === "me";

            return (
              <View
                style={[
                  styles.messageWrapper,
                  isMe ? styles.messageWrapperMe : styles.messageWrapperFriend,
                ]}
              >
                <View
                  style={[
                    styles.messageBubble,
                    isMe ? styles.myMessage : styles.friendMessage,
                  ]}
                >
                  <Text
                    style={[styles.messageText, isMe && styles.myMessageText]}
                  >
                    {item.text}
                  </Text>

                  {item.book && (
                    <View style={styles.bookCard}>
                      <Image
                        source={{ uri: item.book.cover }}
                        style={styles.bookCover}
                      />
                      <View style={styles.bookInfo}>
                        <Text style={styles.bookTitle} numberOfLines={2}>
                          {item.book.title}
                        </Text>
                        <Text style={styles.bookAuthor} numberOfLines={1}>
                          {item.book.author}
                        </Text>
                      </View>
                    </View>
                  )}

                  <Text
                    style={[styles.messageTime, isMe && styles.myMessageTime]}
                  >
                    {item.time}
                  </Text>
                </View>
              </View>
            );
          }}
        />

        <SafeAreaView edges={["bottom"]} style={styles.inputArea}>
          <View style={styles.inputWrapper}>
            <TextInput
              placeholder="Type a message..."
              placeholderTextColor="#7A7A7A"
              style={styles.input}
              value={messageText}
              onChangeText={setMessageText}
              multiline
              textAlignVertical="top"
            />

            <TouchableOpacity onPress={handleSend} style={styles.sendButton}>
              <Ionicons name="send" size={18} color="#fff" />
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#fff",
  },
  keyboardView: {
    flex: 1,
    backgroundColor: "#fff",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#EFEFEF",
    backgroundColor: "#fff",
  },
  iconButton: {
    width: 36,
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    flex: 1,
    fontSize: 20,
    fontWeight: "700",
    color: "#111",
    marginHorizontal: 8,
  },
  messagesContainer: {
    padding: 16,
    paddingBottom: 24,
  },
  messageWrapper: {
    marginBottom: 12,
    flexDirection: "row",
  },
  messageWrapperMe: {
    justifyContent: "flex-end",
  },
  messageWrapperFriend: {
    justifyContent: "flex-start",
  },
  messageBubble: {
    maxWidth: "78%",
    borderRadius: 18,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  myMessage: {
    backgroundColor: "#3a24ff",
  },
  friendMessage: {
    backgroundColor: "#EFEFEF",
  },
  messageText: {
    fontSize: 15,
    color: "#111",
    lineHeight: 20,
  },
  myMessageText: {
    color: "#fff",
  },
  messageTime: {
    marginTop: 6,
    fontSize: 11,
    color: "#777",
    alignSelf: "flex-end",
  },
  myMessageTime: {
    color: "#DDD",
  },
  bookCard: {
    flexDirection: "row",
    backgroundColor: "#fff",
    borderRadius: 12,
    marginTop: 10,
    padding: 8,
    alignItems: "center",
  },
  bookCover: {
    width: 42,
    height: 60,
    borderRadius: 6,
    marginRight: 10,
    backgroundColor: "#D9D9D9",
  },
  bookInfo: {
    flex: 1,
  },
  bookTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#111",
    marginBottom: 4,
  },
  bookAuthor: {
    fontSize: 12,
    color: "#666",
  },
  inputArea: {
    backgroundColor: "#fff",
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 18,
    borderTopWidth: 1,
    borderTopColor: "#EFEFEF",
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "flex-end",
  },
  input: {
    flex: 1,
    backgroundColor: "#F0F0F0",
    borderRadius: 24,
    paddingHorizontal: 14,
    paddingTop: 12,
    paddingBottom: 12,
    minHeight: 48,
    maxHeight: 110,
    fontSize: 16,
    color: "#111",
  },
  sendButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#3a24ff",
    alignItems: "center",
    justifyContent: "center",
    marginLeft: 12,
  },
});