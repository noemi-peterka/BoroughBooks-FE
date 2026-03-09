import { StyleSheet, Text, View } from "react-native";

export default function FriendsScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Friends screen</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#ffffffff",
    justifyContent: "center",
    alignItems: "center",
  },
  text: {
    color: "#000000ff",
  },
});
