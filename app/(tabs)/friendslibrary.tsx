import BookList from "@/components/BookList";
import type { Book } from "@/context/BooksContext";
import axios from "axios";
import { useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import { View } from "react-native";

const API_BASE_URL = "https://boroughbooks.onrender.com/api";

export default function FriendsLibrary() {
  const { username } = useLocalSearchParams();

  const [books, setBooks] = useState<Book[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    async function fetchFriendsBooks() {
      setIsLoading(true);
      try {
        const response = await axios.get<{ books: Book[] }>(
          `${API_BASE_URL}/users/${username}/my-library`,
        );
        setBooks(response.data.books);
      } catch (error) {
        console.error("Failed to fetch Friend's Library:", error);
      } finally {
        setIsLoading(false);
      }
    }
    fetchFriendsBooks();
  }, [username]);

  return (
    <View>
      <BookList books={books} isLoading={isLoading} />
    </View>
  );
}
