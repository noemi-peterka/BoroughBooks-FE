import axios from "axios";

export async function deleteBookFromUserProfile(
  username: string,
  isbn: string,
  collection: string,
): Promise<void | Object> {
  try {
    const destination = collection === "library" ? "my-library" : "wish-list";
    const response = await axios.delete<void | Object>(
      `https://boroughbooks.onrender.com/api/users/${username}/${destination}/${isbn}`,
    );
    return;
  } catch (err) {
    return { err };
  }
}
