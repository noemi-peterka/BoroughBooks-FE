import { router } from "expo-router";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { useAuth } from "../../../context/AuthContext";

export default function SettingsScreen() {
  const { user, signOut } = useAuth();

  return (
    <View style={styles.screen}>
      <Text style={styles.title}>Settings</Text>

      <View style={styles.card}>
        <Text style={styles.label}>Signed in as</Text>
        <Text style={styles.value}>
          {user?.name ?? user?.email ?? "Unknown user"}
        </Text>
        <Text style={styles.meta}>
          {user ? `Provider: ${user.provider}` : "Not signed in"}
        </Text>
      </View>

      <Pressable
        style={({ pressed }) => [styles.button, pressed && styles.pressed]}
        onPress={async () => {
          await signOut();
          router.replace("/sign-in" as any);
        }}
      >
        <Text style={styles.buttonText}>Sign out</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    padding: 18,
    backgroundColor: "#fff",
  },
  title: {
    fontSize: 20,
    fontWeight: "800",
    color: "#0B1220",
    marginBottom: 12,
  },
  card: {
    borderWidth: 1,
    borderColor: "#E7EEF9",
    borderRadius: 14,
    padding: 14,
    backgroundColor: "#F8FBFF",
  },
  label: {
    fontSize: 12,
    color: "#3A4B6A",
  },
  value: {
    marginTop: 6,
    fontSize: 16,
    fontWeight: "700",
    color: "#0B1220",
  },
  meta: {
    marginTop: 6,
    fontSize: 12,
    color: "#586A8A",
  },
  button: {
    marginTop: 14,
    backgroundColor: "#111318",
    borderRadius: 14,
    paddingVertical: 12,
    alignItems: "center",
  },
  buttonText: {
    color: "#fff",
    fontWeight: "800",
  },
  pressed: {
    opacity: 0.9,
    transform: [{ scale: 0.99 }],
  },
});
