import { View, Text, StyleSheet, Image } from "react-native";

export type FriendCardProps = {
  name: string;
  subtitle?: string;
  avatar: string;
};

export const FriendCard = ({ name, subtitle, avatar }: FriendCardProps) => {
  return (
    <View style={styles.card}>
      <Image source={{ uri: avatar }} style={styles.avatar} />

      <View style={styles.textContainer}>
        <Text style={styles.name}>{name}</Text>
        {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 24,
  },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    marginRight: 20,
  },
  textContainer: {
    flex: 1,
  },
  name: {
    fontSize: 18,
    fontWeight: "500",
  },
  subtitle: {
    fontSize: 14,
    color: "#555",
  },
});