import Ionicons from "@expo/vector-icons/Ionicons";
import { DrawerToggleButton } from "@react-navigation/drawer";
import { Tabs } from "expo-router";

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: "#3a24ffff",
      }}
    >
      <Tabs.Screen
        name="library"
        options={{
          title: "Library",
          headerLeft: () => <DrawerToggleButton />,
          tabBarIcon: ({ color, focused }) => (
            <Ionicons
              name={focused ? "library-sharp" : "library-outline"}
              color={color}
              size={24}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="friends"
        options={{
          title: "Friends",
          headerLeft: () => <DrawerToggleButton />,
          tabBarIcon: ({ color, focused }) => (
            <Ionicons
              name={focused ? "people-sharp" : "people-outline"}
              color={color}
              size={24}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="chat"
        options={{
          title: "Chat",
          headerLeft: () => <DrawerToggleButton />,
          tabBarIcon: ({ color, focused }) => (
            <Ionicons
              name={focused ? "chatbubbles-sharp" : "chatbubbles-outline"}
              color={color}
              size={24}
            />
          ),
        }}
      />
    </Tabs>
  );
}
