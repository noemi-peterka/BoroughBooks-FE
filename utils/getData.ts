import axios from "axios";

//To test these functions with TypeScript use: npx tsx utils/getData.ts

//Get friends by Username:

export type Friend = {
  user_relationship_id: number;
  origin_username: string;
  relating_username: string;
  friend_status: string;
  origin_profile_pic_url: string;
  friend_profile_pic_url: string;
};

export async function getFriendsByUsername(
  username: string,
): Promise<Friend[]> {
  try {
    const response = await axios.get<Friend[]>(
      `https://boroughbooks.onrender.com/api/users/${username}/friends`,
    );

    // console.log(response.data.usersFriends);
    //@ts-ignore.   // we just want the array
    return response.data.usersFriends;
  } catch (error) {
    console.error("Error fetching friends:", error);
    return [];
  }
}

// To test uncomment below:
// getFriendsByUsername("coolSurferDude");

// Get book by book id

export type Book = {
  isbn: string;
  title: string;
  authors: string;
  publisher: string;
  published_date: string;
  description: string;
  imagelinks: string;
};

export async function getBookById(isbn: string): Promise<Book[]> {
  try {
    const response = await axios.get<Book[]>(
      `https://boroughbooks.onrender.com/api/books/${isbn}`,
    );
    console.log(response.data);
    return response.data;
  } catch (error) {
    console.error("Error fetching book", error);
    return [];
  }
}

// To test uncomment below and use npx tsx utils/getData.ts:
// getBookById("9781911547860");

//Get users book by book id

export async function usersBookById(
  username: string,
  isbn: string,
): Promise<Book[]> {
  try {
    const response = await axios.get<Book[]>(
      `https://boroughbooks.onrender.com/api/users/${username}/my-library/${isbn}`,
    );
    console.log(response.data);
    return response.data;
  } catch (error) {
    console.error("Error fetching book", error);
    return [];
  }
}

// To test uncomment below and use npx tsx utils/getData.ts:
// getBookById("9781911547860");

// Post book to book table

export async function postBookFunction(
  postedBookBody: Book,
): Promise<{ status: 201 }> {
  try {
    const response = await axios.post<{ status: 201 }>(
      `https://boroughbooks.onrender.com/api/books`,
      postedBookBody,
    );
    return response.data;
  } catch (error) {
    console.error("Error posting book:", error);
    throw error;
  }
}

// Post Book to users_book table

export async function postUsersBookFunction(
  username: string,
  postedBookBody: Book,
): Promise<{ status: 201 }> {
  try {
    const response = await axios.post<{ status: 201 }>(
      `https://boroughbooks.onrender.com/api/users/${username}/my-library`,
      postedBookBody,
    );
    return response.data;
  } catch (error) {
    console.error("Error posting book:", error);
    throw error;
  }
}

// Handle Add Book

export async function handleAddBook(
  username: string,
  bookData: Book,
): Promise<Book | undefined> {
  try {
    const existingBook = await getBookById(bookData.isbn);
    if (existingBook.length < 1) {
      await postBookFunction(bookData);
    }

    const checkUsersBooks = await usersBookById(username, bookData.isbn);
    if (checkUsersBooks.length < 1) {
      await postUsersBookFunction(username, bookData);
    }

    return bookData;
  } catch (error) {
    console.error("Error searching book", error);
    throw error;
  }
}
