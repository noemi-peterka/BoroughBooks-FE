import { FlatList, StyleSheet, View } from "react-native";
import { FriendCard } from "./FriendCard";
import { Friend } from "@/utils/getData";

export const FriendList = ({ friends }: { friends: Friend[] }) => {
  return (
    <View style={{ flex: 1 }}>
      <FlatList
        data={friends}
        keyExtractor={(item) => item.relating_username}
        renderItem={({ item }) => (
          //@ts-ignore
          <FriendCard
            relating_username={item.relating_username}
            profile_pic_url={item.profile_pic_url}
            friend_status={item.friend_status}
          />
        )}
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
