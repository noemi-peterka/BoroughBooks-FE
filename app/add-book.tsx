import Ionicons from "@expo/vector-icons/Ionicons";
import { router } from "expo-router";
import { useState } from "react";
import {
  Alert,
  FlatList,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import CoverCamera from "../components/CoverCamera";
import ISBNScanner from "../components/ISBNScanner";
import { useBooks } from "../context/BooksContext";

type GoogleBookItem = {
  id: string;
  volumeInfo?: {
    title?: string;
    authors?: string[];
    categories?: string[];
    publishedDate?: string;
    description?: string;
    imageLinks?: {
      thumbnail?: string;
      smallThumbnail?: string;
    };
    industryIdentifiers?: {
      type?: string;
      identifier?: string;
    }[];
  };
};

export default function AddBookScreen() {
  const { addBook } = useBooks();

  const [showCamera, setShowCamera] = useState(false);
  const [showScanner, setShowScanner] = useState(false);

  const [title, setTitle] = useState("");
  const [author, setAuthor] = useState("");
  const [genre, setGenre] = useState("");
  const [year, setYear] = useState("");
  const [cover, setCover] = useState("");
  const [description, setDescription] = useState("");

  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<GoogleBookItem[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  const resetForm = () => {
    setTitle("");
    setAuthor("");
    setGenre("");
    setYear("");
    setCover("");
    setDescription("");
    setShowCamera(false);
    setShowScanner(false);
    setSearchQuery("");
    setSearchResults([]);
  };

  const autofillForm = (book: GoogleBookItem) => {
    const info = book.volumeInfo;

    if (!info) return;

    setTitle(info.title || "");
    setAuthor(info.authors?.join(", ") || "");
    setGenre(info.categories?.[0] || "");
    setDescription(info.description || "");
    setCover(
      info.imageLinks?.thumbnail || info.imageLinks?.smallThumbnail || "",
    );

    const publishedDate = info.publishedDate || "";
    const parsedYear = publishedDate.slice(0, 4);
    setYear(/^\d{4}$/.test(parsedYear) ? parsedYear : "");

    setSearchResults([]);
    setSearchQuery(info.title || "");
  };

  const searchGoogleBooks = async (query: string) => {
    const trimmed = query.trim();

    if (!trimmed) {
      setSearchResults([]);
      return;
    }

    try {
      setIsSearching(true);

      const response = await fetch(
        `https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(trimmed)}&maxResults=10`,
      );

      if (!response.ok) {
        throw new Error("Failed to fetch books");
      }

      const data = await response.json();
      setSearchResults(data.items || []);
    } catch (error) {
      console.error("Google Books search error:", error);
      Alert.alert("Search failed", "Could not fetch books right now.");
    } finally {
      setIsSearching(false);
    }
  };

  const searchByISBN = async (isbn: string) => {
    try {
      setIsSearching(true);

      const cleanISBN = isbn.replace(/[^0-9Xx]/g, "");

      const response = await fetch(
        `https://www.googleapis.com/books/v1/volumes?q=isbn:${encodeURIComponent(cleanISBN)}`,
      );

      if (!response.ok) {
        throw new Error("Failed to fetch ISBN result");
      }

      const data = await response.json();
      const firstMatch = data.items?.[0];

      if (!firstMatch) {
        Alert.alert(
          "No match found",
          `No Google Books result found for ISBN ${cleanISBN}.`,
        );
        return;
      }

      autofillForm(firstMatch);
      Alert.alert("Book found", "Form auto-filled from barcode scan.");
    } catch (error) {
      console.error("ISBN search error:", error);
      Alert.alert("Lookup failed", "Could not fetch book data from ISBN.");
    } finally {
      setIsSearching(false);
      setShowScanner(false);
    }
  };

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

  if (showScanner) {
    return (
      <ISBNScanner
        onScanned={searchByISBN}
        onCancel={() => setShowScanner(false)}
      />
    );
  }

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.heading}>Add Book</Text>

        <View style={styles.searchWrapper}>
          <Ionicons name="search-outline" size={18} color="#7A7A7A" />

          <TextInput
            placeholder={isSearching ? "Searching..." : "Search by title"}
            placeholderTextColor="#7A7A7A"
            style={styles.searchInput}
            value={searchQuery}
            onChangeText={setSearchQuery}
            onSubmitEditing={() => searchGoogleBooks(searchQuery)}
            returnKeyType="search"
          />

          {searchQuery.length > 0 && (
            <Ionicons
              name="close-circle"
              size={18}
              color="#7A7A7A"
              onPress={() => setSearchQuery("")}
            />
          )}
        </View>

        <Pressable
          style={styles.scanButton}
          onPress={() => setShowScanner(true)}
        >
          <Text style={styles.scanButtonText}>Scan Barcode</Text>
        </Pressable>

        {searchResults.length > 0 && (
          <View style={styles.resultsContainer}>
            <FlatList
              data={searchResults}
              keyExtractor={(item) => item.id}
              scrollEnabled={false}
              renderItem={({ item }) => {
                const info = item.volumeInfo;
                return (
                  <Pressable
                    style={styles.resultCard}
                    onPress={() => autofillForm(item)}
                  >
                    <Text style={styles.resultTitle}>
                      {info?.title || "Untitled"}
                    </Text>
                    <Text style={styles.resultAuthor}>
                      {info?.authors?.join(", ") || "Unknown author"}
                    </Text>
                  </Pressable>
                );
              }}
            />
          </View>
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
        {cover.trim() ? (
          <Image source={{ uri: cover }} style={styles.coverPreview} />
        ) : (
          <View style={styles.fallbackCover}>
            <Text style={styles.fallbackTitle}>
              {title.trim() || "Book Title"}
            </Text>
          </View>
        )}

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
    </SafeAreaView>
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
  input: {
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    padding: 12,
    marginBottom: 14,
  },
  searchButton: {
    backgroundColor: "#2d6cdf",
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
    marginBottom: 12,
  },
  searchButtonText: {
    color: "#fff",
    fontWeight: "600",
  },
  scanButton: {
    backgroundColor: "#444",
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
    marginBottom: 16,
  },
  scanButtonText: {
    color: "#fff",
    fontWeight: "600",
  },
  resultsContainer: {
    marginBottom: 16,
  },
  resultCard: {
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#e2e2e2",
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
  },
  resultTitle: {
    fontWeight: "700",
    fontSize: 15,
    marginBottom: 4,
  },
  resultAuthor: {
    color: "#666",
  },
  coverPreview: {
    width: 140,
    height: 200,
    borderRadius: 10,
    alignSelf: "center",
    marginBottom: 16,
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
  searchWrapper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#E9E9E9",
    borderRadius: 18,
    paddingHorizontal: 10,
    height: 38,
    marginBottom: 16,
  },

  searchInput: {
    flex: 1,
    marginHorizontal: 8,
    fontSize: 14,
    color: "#111",
  },
});
