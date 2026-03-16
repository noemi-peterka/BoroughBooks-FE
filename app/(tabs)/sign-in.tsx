import axios from "axios";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Image,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";

import { useSession } from "../../context/UserContext";

type User = {
  username: string;
  profile_pic_url: string;
};

export default function SignIn() {
  const { signIn, user } = useSession();
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedUsername, setSelectedUsername] = useState<string | null>(null);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await axios.get(
          "https://boroughbooks.onrender.com/api/users",
        );

        const data = response.data as { users: any[] };

        const mappedUsers: User[] = data.users.map((user: any) => ({
          username: user.username,
          profile_pic_url: user.profile_pic_url,
        }));

        setUsers(mappedUsers);
      } catch (error) {
        console.error("Failed to fetch users:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUsers();
  }, []);

  const handleSignIn = (selectedUser: User) => {
    setSelectedUsername(selectedUser.username);
    signIn(selectedUser);
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" />
        <Text style={styles.loadingText}>Loading profiles...</Text>
      </View>
    );
  }

  return (
    <View style={styles.screen}>
      <Text style={styles.title}>Choose your profile</Text>
      <Text style={styles.description}>
        Pick a profile to view their library, friends, and activity.
      </Text>

      {selectedUsername ? (
        <View style={styles.successBanner}>
          <Text style={styles.successText}>
            Signed in as {selectedUsername}
          </Text>
        </View>
      ) : null}

      <FlatList
        contentContainerStyle={styles.listContent}
        data={users}
        keyExtractor={(item) => item.username}
        renderItem={({ item }) => {
          const isCurrentUser = user?.username === item.username;

          return (
            <View style={styles.card}>
              {item.profile_pic_url ? (
                <Image
                  source={{ uri: item.profile_pic_url }}
                  style={styles.avatar}
                />
              ) : (
                <View style={[styles.avatar, styles.avatarFallback]}>
                  <Text style={styles.avatarFallbackText}>
                    {item.username.charAt(0).toUpperCase()}
                  </Text>
                </View>
              )}

              <View style={styles.cardText}>
                <Text style={styles.username}>{item.username}</Text>
              </View>

              <Pressable
                style={[styles.button, isCurrentUser && styles.buttonDisabled]}
                onPress={() => handleSignIn(item)}
                disabled={isCurrentUser}
              >
                <Text
                  style={[
                    styles.buttonText,
                    isCurrentUser && styles.buttonTextDisabled,
                  ]}
                >
                  {isCurrentUser ? "Signed in" : "Sign in"}
                </Text>
              </Pressable>
            </View>
          );
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#f7f4ef",
    paddingHorizontal: 20,
    paddingTop: 32,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f7f4ef",
    padding: 24,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: "#5f5a55",
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
    color: "#2f2a25",
    marginBottom: 8,
  },
  description: {
    fontSize: 15,
    lineHeight: 22,
    color: "#6b645d",
    marginBottom: 20,
  },
  currentUserBanner: {
    backgroundColor: "#ede4d8",
    borderRadius: 14,
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  currentUserLabel: {
    fontSize: 13,
    color: "#7a6f63",
    marginBottom: 4,
  },
  currentUserName: {
    fontSize: 18,
    fontWeight: "700",
    color: "#2f2a25",
  },
  successBanner: {
    backgroundColor: "#dff4e4",
    borderRadius: 14,
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  successText: {
    color: "#1f6b36",
    fontSize: 15,
    fontWeight: "600",
  },
  listContent: {
    paddingBottom: 24,
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 18,
    padding: 16,
    marginBottom: 14,
    flexDirection: "row",
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
    elevation: 2,
  },
  avatar: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: "#d8d2ca",
    marginRight: 14,
  },
  avatarFallback: {
    justifyContent: "center",
    alignItems: "center",
  },
  avatarFallbackText: {
    fontSize: 24,
    fontWeight: "700",
    color: "#5f5a55",
  },
  cardText: {
    flex: 1,
  },
  username: {
    fontSize: 18,
    fontWeight: "700",
    color: "#2f2a25",
    marginBottom: 4,
  },
  subtext: {
    fontSize: 14,
    color: "#6b645d",
    lineHeight: 20,
  },
  button: {
    backgroundColor: "#7c5cff",
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 12,
    marginLeft: 12,
  },
  buttonDisabled: {
    backgroundColor: "#d8d2ef",
  },
  buttonText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 14,
  },
  buttonTextDisabled: {
    color: "#5f557e",
  },
});
