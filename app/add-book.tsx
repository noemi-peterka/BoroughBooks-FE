import { useState } from "react";
import { Button, StyleSheet, Text, TextInput, View } from "react-native";

export default function AddBookScreen() {
  const [title, setTitle] = useState("");
  const [author, setAuthor] = useState("");

  const handleAddBook = () => {
    console.log("Book added:", { title, author });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>Add book</Text>

      <TextInput
        style={styles.input}
        placeholder="Book title"
        value={title}
        onChangeText={setTitle}
      />

      <TextInput
        style={styles.input}
        placeholder="Author"
        value={author}
        onChangeText={setAuthor}
      />

      <Button title="Save book" onPress={handleAddBook} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: "#fff",
  },
  heading: {
    fontSize: 24,
    fontWeight: "600",
    marginBottom: 16,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
  },
});
