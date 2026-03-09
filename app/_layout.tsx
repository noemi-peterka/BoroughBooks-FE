import { Drawer } from "expo-router/drawer";

export default function RootLayout() {
  return (
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
    </Drawer>
  );
}
