import { DrawerContentScrollView, DrawerItem } from "@react-navigation/drawer";
import { router } from "expo-router";
import { Text, View, StyleSheet } from "react-native";
import { useAuth } from "../context/AuthContext";

export default function CustomDrawerContent(props: any) {
  const { user, signOut } = useAuth();

  return (
    <DrawerContentScrollView {...props}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Borough Books</Text>
        {user ? (
          <Text style={styles.headerSubtitle} numberOfLines={1}>
            {user.name ?? user.email ?? "Signed in"}
          </Text>
        ) : null}
      </View>

      <DrawerItem
        label="My library"
        onPress={() => router.push("/library")}
      />

      <DrawerItem label="Add a book" onPress={() => router.push("/add-book")} />

      <DrawerItem
        label="Borrowed"
        onPress={() => router.push("/borrowed")}
      />

      <DrawerItem label="Lent" onPress={() => router.push("/lent")} />

      <DrawerItem
        label="Wishlist"
        onPress={() => router.push("/wishlist")}
      />

      <DrawerItem
        label="Settings"
        onPress={() => router.push("/settings")}
      />

      <DrawerItem
        label="Sign out"
        onPress={async () => {
          await signOut();
          router.replace("/sign-in" as any);
        }}
      />
    </DrawerContentScrollView>
  );
}

const styles = StyleSheet.create({
  header: {
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 6,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: "800",
    color: "#0B1220",
  },
  headerSubtitle: {
    marginTop: 4,
    fontSize: 12,
    color: "#3A4B6A",
  },
});
