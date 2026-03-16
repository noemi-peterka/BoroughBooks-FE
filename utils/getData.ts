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
getFriendsByUsername("coolSurferDude");
