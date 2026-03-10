import { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
} from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import { router } from "expo-router";
import { FriendList } from "../../components/FriendList";

const friends = [
  {
    id: "1",
    name: "John Smith",
    subtitle: "1 book lent",
    avatar: "https://randomuser.me/api/portraits/men/32.jpg",
  },
  {
    id: "2",
    name: "Kevin Brown",
    subtitle: "3 books borrowed",
    avatar: "https://randomuser.me/api/portraits/men/45.jpg",
  },
  {
    id: "3",
    name: "Anna Pavlova",
    avatar: "https://randomuser.me/api/portraits/women/65.jpg",
  },
  {
    id: "4",
    name: "Maria Ivanova",
    avatar: "https://randomuser.me/api/portraits/women/44.jpg",
  },
  {
    id: "5",
    name: "Alex Green",
    avatar: "https://randomuser.me/api/portraits/men/12.jpg",
  },
];

export default function FriendsScreen() {
  const [search, setSearch] = useState("");

  const filteredFriends = friends.filter((friend) =>
    friend.name.toLowerCase().includes(search.trim().toLowerCase())
  );

  const handleFriendPress = (id: string) => {
    router.push(`/friend/${id}`);
  };

  return (
    <View style={styles.screen}>
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>My friends</Text>

          <TouchableOpacity>
            <Ionicons name="menu" size={32} color="#111" />
          </TouchableOpacity>
        </View>

        <View style={styles.searchWrapper}>
          <Ionicons name="search-outline" size={18} color="#7A7A7A" />
          <TextInput
            placeholder="Search"
            placeholderTextColor="#7A7A7A"
            style={styles.searchInput}
            value={search}
            onChangeText={setSearch}
          />
          {search.length > 0 && (
            <Ionicons
              name="close-circle"
              size={18}
              color="#7A7A7A"
              onPress={() => setSearch("")}
            />
          )}
        </View>

        <FriendList friends={filteredFriends} onFriendPress={handleFriendPress} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#F3F3F3",
    paddingHorizontal: 24,
    paddingTop: 24,
  },
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 18,
    paddingTop: 18,
    paddingBottom: 12,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
    color: "#000",
  },
  searchWrapper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#E9E9E9",
    borderRadius: 18,
    paddingHorizontal: 10,
    height: 38,
    marginBottom: 28,
  },
  searchInput: {
    flex: 1,
    marginHorizontal: 8,
    fontSize: 14,
    color: "#111",
  },
});