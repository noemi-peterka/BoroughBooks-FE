import { Drawer } from "expo-router/drawer";
import CustomDrawerContent from "../../components/CustomDrawerContent";

export default function AppLayout() {
  return (
    <Drawer
      drawerContent={(props) => <CustomDrawerContent {...props} />}
      screenOptions={{
        headerShown: false,
      }}
    >
      <Drawer.Screen
        name="(tabs)"
        options={{
          title: "My library",
        }}
      />

      <Drawer.Screen
        name="add-book"
        options={{
          title: "Add a book",
        }}
      />

      <Drawer.Screen
        name="friend/[id]"
        options={{
          drawerItemStyle: { display: "none" },
          title: "Friend Details",
        }}
      />

      <Drawer.Screen
        name="chat/[id]"
        options={{
          drawerItemStyle: { display: "none" },
          title: "Chat Details",
        }}
      />
    </Drawer>
  );
}

