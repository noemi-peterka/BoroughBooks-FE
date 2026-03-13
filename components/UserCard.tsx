import { useState } from "react";
import { Image, Pressable, StyleSheet, Text, View } from "react-native";

import { useSession } from "../data/userContext";
import type { User } from "../context/UserContext";

type UserCardProps = {
  user: User;
};

export default function UserCard({ user }: UserCardProps) {
  const { setLoggedInUser } = useSession();
  const [selected, setSelected] = useState(false);

  const hasPicture = !!user.profile_pic_url?.trim();

  const handlePress = () => {
    setSelected(true);
    setLoggedInUser(user);
  };

  return (
    <Pressable
      onPress={handlePress}
      style={{ backgroundColor: selected ? "lightblue" : "transparent" }}
    >
      {hasPicture ? (
        <Image source={{ uri: user.profile_pic_url }} />
      ) : (
        <Text>{user.username}</Text>
      )}
    </Pressable>
  );
}
