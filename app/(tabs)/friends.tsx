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
        const acceptedFriends = friendsList.filter(
          (friend) => friend.friend_status === "accepted",
        );
        setFriends(acceptedFriends);
      }
    };

    fetchFriends();
  }, [user]);

  return (
    <View style={styles.screen}>
      <FriendList friends={friends} user={user} />
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
});
