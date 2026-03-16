import { createContext, useContext, type PropsWithChildren } from "react";
import { useStorageState } from "../data/useStorageState";

type User = {
  username: string;
  profile_pic_url: string;
};

type AuthContextType = {
  signIn: (user: User) => void;
  signOut: () => void;
  user: User | null;
  isLoading: boolean;
};

const AuthContext = createContext<AuthContextType>({
  signIn: () => null,
  signOut: () => null,
  user: null,
  isLoading: false,
});

export function useSession() {
  const value = useContext(AuthContext);

  if (!value) {
    throw new Error("useSession must be wrapped in a <SessionProvider />");
  }

  return value;
}

export function SessionProvider({ children }: PropsWithChildren) {
  const [[isLoading, storedUser], setStoredUser] = useStorageState("session");

  let user: User | null = null;

  try {
    user = storedUser ? (JSON.parse(storedUser) as User) : null;
  } catch (error) {
    console.warn("Invalid stored session, clearing it");
    setStoredUser(null);
  }

  return (
    <AuthContext.Provider
      value={{
        signIn: (user: User) => {
          setStoredUser(JSON.stringify(user));
        },
        signOut: () => {
          setStoredUser(null);
        },
        user,
        isLoading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
