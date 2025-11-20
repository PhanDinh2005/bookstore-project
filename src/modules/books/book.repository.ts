import { randomUUID } from "crypto";

import type {
  Book,
  CreateBookInput,
  UpdateBookInput,
} from "./book.types";

const data: Book[] = [];

const now = () => new Date().toISOString();

export const seedBooks = () => {
  if (data.length > 0) {
    return;
  }

  const seededAt = now();
  data.push(
    {
      id: randomUUID(),
      title: "Clean Code",
      author: "Robert C. Martin",
      price: 29.99,
      stock: 12,
      isbn: "9780132350884",
      description: "A handbook of agile software craftsmanship.",
      publishedAt: null,
      createdAt: seededAt,
      updatedAt: seededAt,
    },
    {
      id: randomUUID(),
      title: "The Pragmatic Programmer",
      author: "Andrew Hunt & David Thomas",
      price: 31.5,
      stock: 8,
      isbn: "9780135957059",
      description: "Journey to mastery for modern software engineers.",
      publishedAt: null,
      createdAt: seededAt,
      updatedAt: seededAt,
    },
  );
};

export const resetBooks = () => {
  data.length = 0;
};

export const BookRepository = {
  findAll(): Book[] {
    return [...data];
  },

  findById(id: string): Book | undefined {
    return data.find((book) => book.id === id);
  },

  create(payload: CreateBookInput): Book {
    const timestamp = now();
    const {
      isbn = null,
      description = null,
      publishedAt = null,
      ...rest
    } = payload;
    const book: Book = {
      id: randomUUID(),
      ...rest,
      isbn,
      description,
      publishedAt,
      createdAt: timestamp,
      updatedAt: timestamp,
    };

    data.push(book);
    return book;
  },

  update(id: string, payload: UpdateBookInput): Book | undefined {
    const index = data.findIndex((book) => book.id === id);
    if (index === -1) {
      return undefined;
    }

    const current = data[index]!;
    const updated: Book = {
      id: current.id,
      title: payload.title ?? current.title,
      author: payload.author ?? current.author,
      price: payload.price ?? current.price,
      stock: payload.stock ?? current.stock,
      isbn:
        payload.isbn === undefined ? current.isbn : payload.isbn ?? null,
      description:
        payload.description === undefined
          ? current.description
          : payload.description ?? null,
      publishedAt:
        payload.publishedAt === undefined
          ? current.publishedAt
          : payload.publishedAt ?? null,
      createdAt: current.createdAt,
      updatedAt: now(),
    };

    data[index] = updated;
    return updated;
  },

  delete(id: string): boolean {
    const index = data.findIndex((book) => book.id === id);
    if (index === -1) {
      return false;
    }

    data.splice(index, 1);
    return true;
  },
};

export default BookRepository;

