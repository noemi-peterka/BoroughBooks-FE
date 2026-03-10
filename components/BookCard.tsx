import { useState } from "react";
import {
  Image,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

type Book = {
  id: number;
  title: string;
  author: string;
  genre: string;
  year: number;
  description: string;
  cover: string;
};

type BookCardProps = {
  book: Book;
};

export default function BookCard({ book }: BookCardProps) {
  const [modalVisible, setModalVisible] = useState(false);

  return (
    <>
      <Pressable style={styles.card} onPress={() => setModalVisible(true)}>
        <Image source={{ uri: book.cover }} style={styles.image} />
      </Pressable>

      <Modal visible={modalVisible} animationType="slide" transparent>
        <View style={styles.modalBackground}>
          <View style={styles.modalCard}>
            <Pressable
              style={styles.closeButton}
              onPress={() => setModalVisible(false)}
            >
              <Text style={styles.closeText}>✕</Text>
            </Pressable>

            <ScrollView>
              <Text style={styles.title}>{book.title}</Text>
              <Text style={styles.author}>{book.author}</Text>

              <Image source={{ uri: book.cover }} style={styles.modalImage} />

              <Text style={styles.meta}>
                {book.genre} • {book.year}
              </Text>

              <Text style={styles.description}>{book.description}</Text>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  card: {
    width: "48%",
    marginVertical: 10,
    borderRadius: 10,
    overflow: "hidden",
  },

  image: {
    width: "100%",
    height: 250,
    borderRadius: 8,
  },

  modalBackground: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "center",
    alignItems: "center",
  },

  modalCard: {
    width: "85%",
    backgroundColor: "#fff",
    borderRadius: 15,
    padding: 20,
    maxHeight: "80%",
  },

  closeButton: {
    position: "absolute",
    right: 15,
    top: 15,
    zIndex: 10,
  },

  closeText: {
    fontSize: 22,
    fontWeight: "bold",
  },

  title: {
    fontSize: 18,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 4,
  },

  author: {
    textAlign: "center",
    color: "#666",
    marginBottom: 10,
  },

  modalImage: {
    width: "50%",
    height: 220,
    borderRadius: 10,
    marginVertical: 10,
    alignSelf: "center",
  },

  meta: {
    textAlign: "center",
    fontSize: 14,
    color: "#888",
    marginBottom: 10,
  },

  description: {
    fontSize: 14,
    lineHeight: 20,
    textAlign: "center",
  },
});
