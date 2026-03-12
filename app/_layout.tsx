import { Stack, useRouter, useSegments } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useEffect } from "react";
import { AuthProvider, useAuth } from "../context/AuthContext";
import { BooksProvider } from "../context/BooksContext";
import { ActivityIndicator, View } from "react-native";

function AuthGate() {
  const { user, initializing } = useAuth();
  const segments = useSegments() as string[];
  const router = useRouter();

  useEffect(() => {
    if (initializing) return;

    const inAuthRoute = segments[0] === "sign-in";

    if (!user && !inAuthRoute) {
      router.replace("/sign-in" as any);
      return;
    }

    if (user && inAuthRoute) {
      router.replace("/library");
    }
  }, [initializing, router, segments, user]);

  return null;
}

export default function RootLayout() {
  return (
    <AuthProvider>
      <BooksProvider>
        <StatusBar style="dark" />
        <RootNavigator />
      </BooksProvider>
    </AuthProvider>
  );
}

function RootNavigator() {
  const { initializing } = useAuth();

  if (initializing) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator />
      </View>
    );
  }

  return (
    <>
      <AuthGate />
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(auth)" />
        <Stack.Screen name="(app)" />
        <Stack.Screen name="+not-found" />
      </Stack>
    </>
  );
}
