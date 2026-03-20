import axios from "axios";
const API_BASE_URL = "https://boroughbooks.onrender.com/api";

type CreateLoanResponse = {
  loan: {
    loan_id: number;
    users_book_id: number;
    borrower_id: string;
    due_date: string;
    return_date: string | null;
  };
};

export async function createLoan(
  ownerUsername: string,
  isbn: string,
  borrowerId: string,
) {
  const bookRes = await axios.get(
    `${API_BASE_URL}/users/${encodeURIComponent(ownerUsername)}/my-library/${isbn}`,
  );
  const ownerBookId = bookRes.data.usersBookByIsbn[0].users_book_id;
  const response = await fetch(
    `${API_BASE_URL}/users/${encodeURIComponent(ownerUsername)}/loaned`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        users_book_id: ownerBookId,
        borrower_id: borrowerId,
      }),
    },
  );

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Failed to create loan: ${text}`);
  }

  const data: CreateLoanResponse = await response.json();
  return data;
}
