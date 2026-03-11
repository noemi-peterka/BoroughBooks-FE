import { router } from "expo-router";
import { useState } from "react";
import {
  Alert,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
} from "react-native";
import CoverCamera from "../components/CoverCamera";
import { useBooks } from "../context/BooksContext";

export default function AddBookScreen() {
  const { addBook } = useBooks();

  const [showCamera, setShowCamera] = useState(false);
  const [title, setTitle] = useState("");
  const [author, setAuthor] = useState("");
  const [genre, setGenre] = useState("");
  const [year, setYear] = useState("");
  const [cover, setCover] = useState("");
  const [description, setDescription] = useState("");

  const resetForm = () => {
    setTitle("");
    setAuthor("");
    setGenre("");
    setYear("");
    setCover("");
    setDescription("");
    setShowCamera(false);
  };

  if (showCamera) {
    return (
      <CoverCamera
        onCapture={(uri) => {
          setCover(uri);
          setShowCamera(false);
        }}
        onCancel={() => setShowCamera(false)}
      />
    );
  }

  const handleAddBook = () => {
    if (!title.trim() || !author.trim()) {
      Alert.alert(
        "Missing information",
        "Please enter at least a title and author.",
      );
      return;
    }

    addBook({
      title: title.trim(),
      author: author.trim(),
      genre: genre.trim() || "Unknown",
      year: Number(year) || new Date().getFullYear(),
      cover: cover.trim(),
      description: description.trim() || "No description provided.",
    });

    resetForm();
    router.back();
  };
  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.heading}>Add Book</Text>

      {cover.trim() ? (
        <Image source={{ uri: cover }} style={styles.coverPreview} />
      ) : (
        <Pressable
          style={styles.fallbackCover}
          onPress={() => setShowCamera(true)}
        >
          <Text style={styles.fallbackTitle}>
            {title.trim() || "Book Title"}
          </Text>
        </Pressable>
      )}

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

      <TextInput
        style={styles.input}
        placeholder="Genre"
        value={genre}
        onChangeText={setGenre}
      />

      <TextInput
        style={styles.input}
        placeholder="Year"
        value={year}
        onChangeText={setYear}
        keyboardType="numeric"
      />

      <TextInput
        style={[styles.input, styles.textArea]}
        placeholder="Description"
        value={description}
        onChangeText={setDescription}
        multiline
      />
      <TextInput
        style={styles.input}
        placeholder="Cover image URL"
        value={cover}
        onChangeText={setCover}
      />

      <Pressable
        style={styles.cameraButton}
        onPress={() => setShowCamera(true)}
      >
        <Text style={styles.cameraButtonText}>Take cover photo</Text>
      </Pressable>

      <Pressable style={styles.saveButton} onPress={handleAddBook}>
        <Text style={styles.saveButtonText}>Save Book</Text>
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: "#f7f7f7",
    flexGrow: 1,
  },
  heading: {
    fontSize: 26,
    fontWeight: "700",
    marginBottom: 20,
  },
  coverPreview: {
    width: 140,
    height: 200,
    borderRadius: 10,
    alignSelf: "center",
    marginBottom: 16,
  },
  cameraButton: {
    backgroundColor: "#e5e5e5",
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
    marginBottom: 16,
  },
  cameraButtonText: {
    fontWeight: "600",
    color: "#111",
  },
  input: {
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    padding: 12,
    marginBottom: 14,
  },
  textArea: {
    minHeight: 120,
    textAlignVertical: "top",
  },
  saveButton: {
    backgroundColor: "#000",
    padding: 16,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 10,
  },
  saveButtonText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 16,
  },
  fallbackCover: {
    width: 140,
    height: 200,
    borderRadius: 10,
    alignSelf: "center",
    marginBottom: 16,
    backgroundColor: "#4a4a4a",
    justifyContent: "center",
    alignItems: "center",
    padding: 12,
  },
  fallbackTitle: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "700",
    textAlign: "center",
  },
});
