import { useEffect, useState } from "react";
import { View, StyleSheet } from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";

import { useSession } from "../../context/UserContext";
import { Friend, getFriendsByUsername } from "../../utils/getData";
import { FriendList } from "@/components/FriendList";

type User = {
  username: string;
  profile_pic_url: string;
};

export default function FriendsScreen() {
  const { user } = useSession();
  const [friends, setFriends] = useState<Friend[]>([]);

  useEffect(() => {
    const fetchFriends = async () => {
      if (user) {
        const friendsList = await getFriendsByUsername(user.username);
        setFriends(friendsList);
      }
    };

    fetchFriends();
  }, [user]);

  return (
    <View style={styles.screen}>
      <FriendList friends={friends} />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    paddingTop: 8,
    paddingBottom: 12,
  },
  searchWrapper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#E9E9E9",
    borderRadius: 18,
    marginHorizontal: 16,
    paddingHorizontal: 10,
    height: 38,
    marginTop: 8,
    marginBottom: 20,
  },
  searchInput: {
    flex: 1,
    marginHorizontal: 8,
    fontSize: 14,
    color: "#111",
  },
});
