import * as SecureStore from "expo-secure-store";
import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

export type OAuthProvider = "google" | "facebook" | "apple";

export type AuthUser = {
  provider: OAuthProvider;
  id: string;
  name: string | null;
  email: string | null;
  photoUrl: string | null;
};

export type AuthSession = {
  user: AuthUser;
  accessToken: string | null;
  idToken: string | null;
  expiresAt: number | null; // unix seconds
};

type AuthContextType = {
  user: AuthUser | null;
  session: AuthSession | null;
  initializing: boolean;
  signIn: (session: AuthSession) => Promise<void>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const SESSION_KEY = "boroughbooks.auth.session.v1";

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<AuthSession | null>(null);
  const [initializing, setInitializing] = useState(true);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      try {
        const raw = await SecureStore.getItemAsync(SESSION_KEY);
        if (cancelled) return;
        if (!raw) return;
        const parsed = JSON.parse(raw) as AuthSession;
        if (!parsed?.user?.id) return;
        setSession(parsed);
      } catch {
        // treat as signed-out
      } finally {
        if (!cancelled) setInitializing(false);
      }
    };

    load();
    return () => {
      cancelled = true;
    };
  }, []);

  const value = useMemo<AuthContextType>(() => {
    return {
      user: session?.user ?? null,
      session,
      initializing,
      signIn: async (next) => {
        setSession(next);
        await SecureStore.setItemAsync(SESSION_KEY, JSON.stringify(next));
      },
      signOut: async () => {
        setSession(null);
        try {
          await SecureStore.deleteItemAsync(SESSION_KEY);
        } catch {
          // best-effort
        }
      },
    };
  }, [initializing, session]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}

