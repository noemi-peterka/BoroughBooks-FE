import { Link } from "expo-router";
import { StyleSheet, Text, View } from "react-native";

export default function Library() {
  return (
    <>
      <View style={styles.container}>
        <Text style={styles.text}>Library screen</Text>
        <Link href="/friends" style={styles.button}>
          Go to friends screen
        </Link>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#ffffffff",
    alignItems: "center",
    justifyContent: "center",
  },
  text: {
    color: "#000000ff",
  },
  button: {
    fontSize: 20,
    textDecorationLine: "underline",
    color: "#fff",
  },
});
