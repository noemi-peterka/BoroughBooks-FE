import axios from "axios";

export async function deleteBookFromUserLibrary(
  username: string,
  isbn: string,
): Promise<void | Object> {
  try {
    const response = await axios.delete<void | Object>(
      `https://boroughbooks.onrender.com/api/users/${username}/my-library/${isbn}`,
    );
    return;
  } catch (err) {
    return { err };
  }
}
