import { Drawer } from "expo-router/drawer";
import { BooksProvider } from "../context/BooksContext";

export default function RootLayout() {
  return (
    <BooksProvider>
      <Drawer screenOptions={{ headerShown: false }}>
        <Drawer.Screen
          name="(tabs)"
          options={{
            title: "Home",
          }}
        />
        <Drawer.Screen
          name="add-book"
          options={{
            title: "Add book",
          }}
        />
        <Drawer.Screen
          name="friend/[id]"
          options={{
            drawerItemStyle: { display: "none" },
            title: "Friend Details",
          }}
        />

        {/* Hide not-found route from drawer */}
        <Drawer.Screen
          name="+not-found"
          options={{
            drawerItemStyle: { display: "none" },
          }}
        />
      </Drawer>
    </BooksProvider>
  );
}
