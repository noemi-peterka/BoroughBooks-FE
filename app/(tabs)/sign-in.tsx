import { router } from "expo-router";
import { FlatList, Image, StyleSheet, Text, View } from "react-native";

import { useSession } from "../../context/UserContext";

import axios from "axios";
import { useEffect, useState } from "react";

type User = {
  username: string;
  profile_pic_url: string;
};

export default function SignIn() {
  const { signIn } = useSession();
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await axios.get(
          "https://boroughbooks.onrender.com/api/users",
        );

        const data = response.data as { users: any[] };
        const mappedUsers: User[] = data.users.map(
          (user: any, index: number) => ({
            username: user.username,
            profile_pic_url: user.profile_pic_url,
          }),
        );

        setUsers(mappedUsers);
      } catch (error) {
        console.error("Failed to fetch users:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUsers();
  }, []);

  return (
    <View style={styles.container}>
      <FlatList
        data={users}
        keyExtractor={(item) => item.username.toString()}
        showsHorizontalScrollIndicator={false}
        renderItem={({ item }) => (
          <View style={{ alignItems: "center", marginHorizontal: 10 }}>
            <Image
              source={{ uri: item.profile_pic_url }}
              style={styles.avatar}
            ></Image>

            <Text style={styles.subtitle}>{item.username}</Text>
            <Text
              onPress={() => {
                signIn();
                router.replace("/library");
              }}
            >
              Sign In
            </Text>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 50,
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 24,
    borderRadius: 16,
  },
  pressed: {
    opacity: 0.7,
  },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    marginRight: 20,
    backgroundColor: "#6e6e6eff",
  },

  name: {
    fontSize: 18,
    fontWeight: "500",
    color: "#111",
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: "#555",
  },
});
