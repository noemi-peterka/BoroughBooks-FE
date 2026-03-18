import { Friend } from "@/utils/getData";
import { useRouter } from "expo-router";
import { Image, Pressable, StyleSheet, Text, View } from "react-native";

export const FriendCard = ({
  relating_username,
  friend_profile_pic_url,
  friend_status,
}: Friend) => {
  const router = useRouter();

  return (
    <Pressable
      onPress={() =>
        router.push(`/friendslibrary?username=${relating_username}`)
      }
      style={({ pressed }) => [styles.card, pressed && styles.pressed]}
    >
      <Image source={{ uri: friend_profile_pic_url }} style={styles.avatar} />

      <View style={styles.textContainer}>
        <Text style={styles.name}>{relating_username}</Text>
        <Text style={styles.name}>
          {friend_status === "accepted" ? "Friend" : friend_status}
        </Text>
      </View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  card: {
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
    backgroundColor: "#D9D9D9",
  },
  textContainer: {
    flex: 1,
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
