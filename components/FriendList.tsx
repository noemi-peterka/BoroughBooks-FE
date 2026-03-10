import { FlatList, View, StyleSheet } from "react-native";
import { FriendCard } from "./FriendCard";

export type Friend = {
    id: string;
    name: string;
    subtitle?: string;
    avatar: string;
  };

type FriendListProps = {
  friends: Friend[];
};

export const FriendList = ({ friends }: FriendListProps) => {
  return (
    <FlatList
      data={friends}
      keyExtractor={(item) => item.id}
      renderItem={({ item }) => (
        <FriendCard name={item.name} subtitle={item.subtitle} avatar={item.avatar}/>
      )}
      contentContainerStyle={styles.listContent}
      showsVerticalScrollIndicator={false}
    />
  );
};

const styles = StyleSheet.create({
  listContent: {
    paddingBottom: 24,
  },
});