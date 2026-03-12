import * as WebBrowser from "expo-web-browser";
import { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import * as Google from "expo-auth-session/providers/google";
import * as Facebook from "expo-auth-session/providers/facebook";
import { makeRedirectUri, type AuthSessionResult } from "expo-auth-session";
import * as AppleAuthentication from "expo-apple-authentication";
import { useAuth } from "../../context/AuthContext";

WebBrowser.maybeCompleteAuthSession();

type GoogleUserInfo = {
  sub: string;
  name?: string;
  email?: string;
  picture?: string;
};

type FacebookProfile = {
  id: string;
  name?: string;
  email?: string;
  picture?: {
    data?: {
      url?: string;
    };
  };
};

async function fetchGoogleUserInfo(
  accessToken: string
): Promise<GoogleUserInfo> {
  const res = await fetch("https://www.googleapis.com/oauth2/v3/userinfo", {
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  if (!res.ok) throw new Error(`Google userinfo failed: ${res.status}`);
  return (await res.json()) as GoogleUserInfo;
}

async function fetchFacebookProfile(
  accessToken: string
): Promise<FacebookProfile> {
  const res = await fetch(
    "https://graph.facebook.com/me?fields=id,name,email,picture.type(large)",
    { headers: { Authorization: `Bearer ${accessToken}` } }
  );

  if (!res.ok) throw new Error(`Facebook profile failed: ${res.status}`);
  return (await res.json()) as FacebookProfile;
}

function missingEnv(keys: string[]) {
  const missing = keys.filter((k) => !process.env[k]);
  return missing.length ? missing : null;
}

export default function SignInScreen() {
  const { signIn } = useAuth();
  const [busyProvider, setBusyProvider] = useState<
    "google" | "facebook" | "apple" | null
  >(null);

  const redirectUri = useMemo(() => {
    return makeRedirectUri({
      scheme: "boroughbooksfe",
      path: "auth",
    });
  }, []);

  const googleWebClientId = process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID;
  const googleIosClientId = process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID;
  const googleAndroidClientId =
    process.env.EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID;

  const facebookAppId = process.env.EXPO_PUBLIC_FACEBOOK_APP_ID;

  const googleEnabled =
    (Platform.OS === "ios" && !!googleIosClientId) ||
    (Platform.OS === "android" && !!googleAndroidClientId) ||
    (Platform.OS === "web" && !!googleWebClientId);

  const facebookEnabled = !!facebookAppId;

  const googleEnvMissing = useMemo(
    () =>
      missingEnv([
        "EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID",
        "EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID",
        "EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID",
      ]),
    []
  );

  const facebookEnvMissing = useMemo(
    () => missingEnv(["EXPO_PUBLIC_FACEBOOK_APP_ID"]),
    []
  );

  const [googleRequest, googleResponse, googlePromptAsync] =
  Google.useAuthRequest({
    webClientId: googleWebClientId || "placeholder-web-client-id",
    iosClientId: googleIosClientId || "placeholder-ios-client-id",
    androidClientId:
      googleAndroidClientId || "placeholder-android-client-id",
    scopes: ["openid", "profile", "email"],
  });

  const [facebookRequest, facebookResponse, facebookPromptAsync] =
    Facebook.useAuthRequest(
      facebookEnabled
        ? {
            clientId: facebookAppId!,
            scopes: ["public_profile", "email"],
            redirectUri,
          }
        : {
            clientId: "disabled",
            redirectUri,
          }
    );

  useEffect(() => {
    const run = async (response: AuthSessionResult | null | undefined) => {
      if (!response || response.type !== "success") return;

      const accessToken =
        response.authentication?.accessToken ??
        (response.params as { access_token?: string })?.access_token;

      const idToken = response.authentication?.idToken ?? null;
      const expiresIn = response.authentication?.expiresIn;

      if (!accessToken) {
        Alert.alert("Sign in failed", "Missing access token from Google.");
        return;
      }

      try {
        setBusyProvider("google");
        const profile = await fetchGoogleUserInfo(accessToken);

        await signIn({
          user: {
            provider: "google",
            id: profile.sub,
            name: profile.name ?? null,
            email: profile.email ?? null,
            photoUrl: profile.picture ?? null,
          },
          accessToken,
          idToken,
          expiresAt:
            typeof expiresIn === "number"
              ? Math.floor(Date.now() / 1000) + expiresIn
              : null,
        });
      } catch (err: unknown) {
        const message =
          err instanceof Error ? err.message : "Google sign-in failed.";
        Alert.alert("Sign in failed", message);
      } finally {
        setBusyProvider(null);
      }
    };

    run(googleResponse);
  }, [googleResponse, signIn]);

  useEffect(() => {
    const run = async (response: AuthSessionResult | null | undefined) => {
      if (!response || response.type !== "success") return;

      const accessToken =
        response.authentication?.accessToken ??
        (response.params as { access_token?: string })?.access_token;

      const expiresIn = response.authentication?.expiresIn;

      if (!accessToken) {
        Alert.alert("Sign in failed", "Missing access token from Facebook.");
        return;
      }

      try {
        setBusyProvider("facebook");
        const profile = await fetchFacebookProfile(accessToken);

        await signIn({
          user: {
            provider: "facebook",
            id: profile.id,
            name: profile.name ?? null,
            email: profile.email ?? null,
            photoUrl: profile.picture?.data?.url ?? null,
          },
          accessToken,
          idToken: null,
          expiresAt:
            typeof expiresIn === "number"
              ? Math.floor(Date.now() / 1000) + expiresIn
              : null,
        });
      } catch (err: unknown) {
        const message =
          err instanceof Error ? err.message : "Facebook sign-in failed.";
        Alert.alert("Sign in failed", message);
      } finally {
        setBusyProvider(null);
      }
    };

    run(facebookResponse);
  }, [facebookResponse, signIn]);

  const handleGoogle = async () => {
    if (!googleEnabled) {
      Alert.alert(
        "Google sign-in is not configured",
        Platform.OS === "ios"
          ? "Add EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID to your .env file."
          : Platform.OS === "android"
          ? "Add EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID to your .env file."
          : "Add EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID to your .env file."
      );
      return;
    }

    if (googleEnvMissing) {
      Alert.alert(
        "Missing config",
        `Set ${googleEnvMissing.join(", ")} in your environment.`
      );
      return;
    }

    try {
      await googlePromptAsync();
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Google sign-in cancelled.";
      Alert.alert("Sign in failed", message);
    }
  };

  const handleFacebook = async () => {
    if (!facebookEnabled) {
      Alert.alert(
        "Facebook sign-in is not configured",
        "Add EXPO_PUBLIC_FACEBOOK_APP_ID to your .env file."
      );
      return;
    }

    if (facebookEnvMissing) {
      Alert.alert(
        "Missing config",
        `Set ${facebookEnvMissing.join(", ")} in your environment.`
      );
      return;
    }

    try {
      await facebookPromptAsync();
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Facebook sign-in cancelled.";
      Alert.alert("Sign in failed", message);
    }
  };

  const handleApple = async () => {
    try {
      setBusyProvider("apple");
      const credential = await AppleAuthentication.signInAsync({
        requestedScopes: [
          AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
          AppleAuthentication.AppleAuthenticationScope.EMAIL,
        ],
      });

      const name =
        credential.fullName?.givenName || credential.fullName?.familyName
          ? `${credential.fullName?.givenName ?? ""} ${
              credential.fullName?.familyName ?? ""
            }`.trim()
          : null;

      await signIn({
        user: {
          provider: "apple",
          id: credential.user,
          name,
          email: credential.email ?? null,
          photoUrl: null,
        },
        accessToken: null,
        idToken: credential.identityToken ?? null,
        expiresAt: null,
      });
    } catch (err: unknown) {
      if (
        typeof err === "object" &&
        err !== null &&
        "code" in err &&
        err.code === "ERR_REQUEST_CANCELED"
      ) {
        return;
      }

      const message =
        err instanceof Error ? err.message : "Apple sign-in failed.";
      Alert.alert("Sign in failed", message);
    } finally {
      setBusyProvider(null);
    }
  };

  return (
    <View style={styles.screen}>
      <View style={styles.card}>
        <Text style={styles.title}>Borough Books</Text>
        <Text style={styles.subtitle}>Sign in to continue</Text>

        <Pressable
          disabled={!googleEnabled || !googleRequest || busyProvider !== null}
          onPress={handleGoogle}
          style={({ pressed }) => [
            styles.button,
            styles.google,
            pressed && styles.pressed,
            (!googleEnabled || !googleRequest || busyProvider !== null) &&
              styles.disabled,
          ]}
        >
          <Text style={styles.buttonText}>Continue with Google</Text>
          {busyProvider === "google" ? (
            <ActivityIndicator color="#0B1220" />
          ) : null}
        </Pressable>

        <Pressable
          disabled={!facebookEnabled || !facebookRequest || busyProvider !== null}
          onPress={handleFacebook}
          style={({ pressed }) => [
            styles.button,
            styles.facebook,
            pressed && styles.pressed,
            (!facebookEnabled || !facebookRequest || busyProvider !== null) &&
              styles.disabled,
          ]}
        >
          <Text style={[styles.buttonText, styles.buttonTextLight]}>
            Continue with Facebook
          </Text>
          {busyProvider === "facebook" ? (
            <ActivityIndicator color="#fff" />
          ) : null}
        </Pressable>

        {Platform.OS === "ios" ? (
          <Pressable
            disabled={busyProvider !== null}
            onPress={handleApple}
            style={({ pressed }) => [
              styles.button,
              styles.apple,
              pressed && styles.pressed,
              busyProvider !== null && styles.disabled,
            ]}
          >
            <Text style={[styles.buttonText, styles.buttonTextLight]}>
              Continue with Apple
            </Text>
            {busyProvider === "apple" ? (
              <ActivityIndicator color="#fff" />
            ) : null}
          </Pressable>
        ) : null}

        <Text style={styles.note}>
          Dev note: configure OAuth client IDs via EXPO_PUBLIC_* env vars.
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#E6F4FE",
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
  },
  card: {
    width: "100%",
    maxWidth: 420,
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    padding: 18,
    shadowColor: "#0B1220",
    shadowOpacity: 0.15,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 12 },
    elevation: 4,
  },
  title: {
    fontSize: 28,
    fontWeight: "800",
    color: "#0B1220",
  },
  subtitle: {
    marginTop: 6,
    marginBottom: 14,
    fontSize: 14,
    color: "#3A4B6A",
  },
  button: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderRadius: 14,
    paddingVertical: 14,
    paddingHorizontal: 14,
    marginTop: 10,
  },
  pressed: {
    transform: [{ scale: 0.99 }],
    opacity: 0.95,
  },
  disabled: {
    opacity: 0.6,
  },
  google: {
    backgroundColor: "#F7FAFF",
    borderWidth: 1,
    borderColor: "#D7E3FF",
  },
  facebook: {
    backgroundColor: "#1877F2",
  },
  apple: {
    backgroundColor: "#111318",
  },
  buttonText: {
    fontSize: 15,
    fontWeight: "700",
    color: "#0B1220",
  },
  buttonTextLight: {
    color: "#FFFFFF",
  },
  note: {
    marginTop: 14,
    fontSize: 12,
    color: "#586A8A",
  },
});