import { FlatList, StyleSheet, View } from "react-native";
import { FriendCard } from "./FriendCard";
import { Friend } from "@/utils/getData";

interface FriendListProps {
  friends: Friend[];
  user: {
    username: string;
    profile_pic_url: string;
  } | null;
}

export const FriendList = ({ friends, user }: FriendListProps) => {
  return (
    <View style={{ flex: 1 }}>
      <FlatList<Friend>
        data={friends}
        keyExtractor={(item) => item.user_relationship_id.toString()}
        renderItem={({ item }) => {
          let friendName = "";
          let friendPic = "";
          if (user?.username === item.origin_username) {
            friendName = item.relating_username;
            friendPic = item.friend_profile_pic_url;
          } else {
            friendName = item.origin_username;
            friendPic = item.origin_profile_pic_url;
          }
          return (
            //@ts-ignore
            <FriendCard
              relating_username={friendName}
              friend_profile_pic_url={friendPic}
              friend_status={item.friend_status}
            />
          );
        }}
        contentContainerStyle={styles.listContent}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  listContent: {
    paddingBottom: 24,
    paddingHorizontal: 16,
  },
});
