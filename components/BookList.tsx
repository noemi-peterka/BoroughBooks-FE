import { FlatList, Image, StyleSheet, View } from "react-native";

type Book = {
  id: number;
  title: string;
  author: string;
  cover: string;
};

type BookListProps = {
  books: Book[];
};

export default function BookList({ books }: BookListProps) {
  return (
    <FlatList
      data={books}
      keyExtractor={(item) => item.id.toString()}
      numColumns={2}
      columnWrapperStyle={styles.row}
      contentContainerStyle={styles.container}
      renderItem={({ item }) => (
        <View style={styles.card}>
          <Image
            source={{ uri: item.cover }}
            style={styles.image}
            resizeMode="cover"
          />
        </View>
      )}
    />
  );
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: 10,
  },

  row: {
    justifyContent: "space-between",
    paddingHorizontal: 16,
  },

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
});
