import { DrawerContentScrollView, DrawerItem } from "@react-navigation/drawer";
import { router } from "expo-router";

export default function CustomDrawerContent(props: any) {
  return (
    <DrawerContentScrollView {...props}>
      <DrawerItem
        label="Library"
        onPress={() => router.push("/(tabs)/library")}
      />

      <DrawerItem
        label="My Books"
        onPress={() => router.push("/(tabs)/my-books")}
      />

      <DrawerItem label="Add a book" onPress={() => router.push("/add-book")} />

      <DrawerItem
        label="Borrowed"
        onPress={() => router.push("/(tabs)/borrowed")}
      />

      <DrawerItem label="Lent" onPress={() => router.push("/(tabs)/lent")} />

      {/* <DrawerItem
        label="Wishlist"
        onPress={() => router.push("/(tabs)/wishlist")}
      /> */}

      <DrawerItem
        label="Profile"
        onPress={() => router.push("/(tabs)/sign-in")}
      />
    </DrawerContentScrollView>
  );
}
