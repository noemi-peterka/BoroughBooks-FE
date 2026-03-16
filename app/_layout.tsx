import { Drawer } from "expo-router/drawer";
import { StatusBar } from "expo-status-bar";
import CustomDrawerContent from "../components/CustomDrawerContent";
import { BooksProvider } from "../context/BooksContext";
import { SessionProvider } from "../context/UserContext";
export default function RootLayout() {
  return (
    <SessionProvider>
      <BooksProvider>
        <StatusBar style="dark" />
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
            name="(tabs)/sign-in"
            options={{
              title: "Sign in",
            }}
          />

          <Drawer.Screen
            name="+not-found"
            options={{
              drawerItemStyle: { display: "none" },
            }}
          />
        </Drawer>
      </BooksProvider>
    </SessionProvider>
  );
}
