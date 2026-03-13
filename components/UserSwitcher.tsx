import { useState } from "react";
import {
  Image,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useBooks } from "../context/BooksContext";

export default function UserSwitcher() {
  const { users, currentUser, setCurrentUserId } = useBooks();
  const [visible, setVisible] = useState(false);

  if (!currentUser) return null;

  const handleSelectUser = (userId: string) => {
    setCurrentUserId(userId);
    setVisible(false);
  };

  return (
    <>
      <TouchableOpacity
        onPress={() => setVisible(true)}
        style={styles.trigger}
        activeOpacity={0.8}
      >
        <Image source={{ uri: currentUser.avatar }} style={styles.avatar} />
      </TouchableOpacity>

      <Modal
        visible={visible}
        transparent
        animationType="fade"
        onRequestClose={() => setVisible(false)}
      >
        <Pressable style={styles.overlay} onPress={() => setVisible(false)}>
          <View style={styles.menu}>
            {users.map((user) => {
              const isActive = user.id === currentUser.id;

              return (
                <TouchableOpacity
                  key={user.id}
                  style={[styles.userRow, isActive && styles.userRowActive]}
                  onPress={() => handleSelectUser(user.id)}
                >
                  <Image source={{ uri: user.avatar }} style={styles.menuAvatar} />
                  <Text style={styles.userName}>{user.name}</Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </Pressable>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  trigger: {
    width: 36,
    height: 36,
    borderRadius: 18,
    overflow: "hidden",
  },
  avatar: {
    width: "100%",
    height: "100%",
    borderRadius: 18,
  },
  overlay: {
    flex: 1,
    backgroundColor: "transparent",
  },
  menu: {
    position: "absolute",
    top: 90,
    right: 16,
    width: 180,
    backgroundColor: "#fff",
    borderRadius: 12,
    paddingVertical: 8,
    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 6,
  },
  userRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  userRowActive: {
    backgroundColor: "#F5F3FF",
  },
  menuAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    marginRight: 10,
  },
  userName: {
    fontSize: 15,
    color: "#111",
    fontWeight: "500",
  },
});