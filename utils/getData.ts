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

export type FetchedBookByIsbn = {
  isbn: "9781608464456";
  title: string;
  authors: string;
  publisher: string;
  published_date: string;
  description: string;
  imagelinks: string;
};

// Get book by book id

export async function getBookById(isbn: string): Promise<FetchedBookByIsbn[]> {
  try {
    const response = await axios.get<FetchedBookByIsbn[]>(
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

export type PostedBookBody = {
  isbn: string;
  title: string;
  authors: string;
  publisher: string;
  published_date: string;
  description: string;
  imagelinks: string;
};

export async function postBookFunction(
  postedBookBody: PostedBookBody,
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
