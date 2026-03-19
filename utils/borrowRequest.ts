export const BORROW_REQUEST_PREFIX = "[[BORROW_REQUEST]]";
export const BORROW_APPROVED_PREFIX = "[[BORROW_APPROVED]]";
export const BORROW_DECLINED_PREFIX = "[[BORROW_DECLINED]]";

type BorrowMessageBook = {
  isbn: string;
  title: string;
  imagelinks?: string;
};

export function buildBorrowRequestMessage(book: BorrowMessageBook) {
  return `${BORROW_REQUEST_PREFIX}${JSON.stringify({
    isbn: book.isbn,
    title: book.title,
    imagelinks: book.imagelinks || "",
  })}`;
}

export function buildBorrowApprovedMessage(book: BorrowMessageBook) {
  return `${BORROW_APPROVED_PREFIX}${JSON.stringify({
    isbn: book.isbn,
    title: book.title,
    imagelinks: book.imagelinks || "",
  })}`;
}

export function buildBorrowDeclinedMessage(book: BorrowMessageBook) {
  return `${BORROW_DECLINED_PREFIX}${JSON.stringify({
    isbn: book.isbn,
    title: book.title,
    imagelinks: book.imagelinks || "",
  })}`;
}

function parseMessageWithPrefix(prefix: string, content: string) {
  if (!content.startsWith(prefix)) return null;

  try {
    const raw = content.replace(prefix, "");
    const parsed = JSON.parse(raw);

    if (!parsed?.isbn || !parsed?.title) return null;

    return {
      isbn: parsed.isbn as string,
      title: parsed.title as string,
      imagelinks: (parsed.imagelinks as string) || "",
    };
  } catch {
    return null;
  }
}

export function parseBorrowRequestMessage(content: string) {
  return parseMessageWithPrefix(BORROW_REQUEST_PREFIX, content);
}

export function parseBorrowApprovedMessage(content: string) {
  return parseMessageWithPrefix(BORROW_APPROVED_PREFIX, content);
}

export function parseBorrowDeclinedMessage(content: string) {
  return parseMessageWithPrefix(BORROW_DECLINED_PREFIX, content);
}
