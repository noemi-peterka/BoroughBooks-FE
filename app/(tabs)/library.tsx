import { StyleSheet, View } from "react-native";
import BookList from "../../components/BookList";
import { books } from "../../data/books";

export default function Library() {
  return (
    <>
      <View style={styles.container}>
        <BookList books={books} />
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
