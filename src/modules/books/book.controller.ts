import type { Request, Response } from "express";

import {
  createBook,
  deleteBook,
  getBookById,
  listBooks,
  updateBook,
} from "./book.service";
import type { CreateBookInput, UpdateBookInput } from "./book.types";

type ValidationResult<T> =
  | { valid: true; value: T }
  | { valid: false; errors: string[] };

const parseNumber = (value: unknown) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : undefined;
};

const validateCreatePayload = (
  body: unknown,
): ValidationResult<CreateBookInput> => {
  if (typeof body !== "object" || body === null) {
    return { valid: false, errors: ["payload must be an object"] };
  }

  const candidate = body as Record<string, unknown>;
  const errors: string[] = [];

  const title = typeof candidate.title === "string" ? candidate.title : undefined;
  if (!title) errors.push("title is required");

  const author = typeof candidate.author === "string" ? candidate.author : undefined;
  if (!author) errors.push("author is required");

  const price = parseNumber(candidate.price);
  if (price === undefined || price < 0) {
    errors.push("price must be a non-negative number");
  }

  const stock = parseNumber(candidate.stock);
  if (!Number.isInteger(stock) || (stock ?? 0) < 0) {
    errors.push("stock must be a non-negative integer");
  }

  if (errors.length > 0 || title === undefined || author === undefined || price === undefined || stock === undefined) {
    return { valid: false, errors };
  }

  const value: CreateBookInput = {
    title,
    author,
    price,
    stock,
  };

  if ("isbn" in candidate) {
    if (typeof candidate.isbn === "string") {
      value.isbn = candidate.isbn;
    } else if (candidate.isbn === null) {
      value.isbn = null;
    }
  }

  if ("description" in candidate) {
    if (typeof candidate.description === "string") {
      value.description = candidate.description;
    } else if (candidate.description === null) {
      value.description = null;
    }
  }

  if ("publishedAt" in candidate) {
    if (typeof candidate.publishedAt === "string") {
      value.publishedAt = candidate.publishedAt;
    } else if (candidate.publishedAt === null) {
      value.publishedAt = null;
    }
  }

  return { valid: true, value };
};

const validateUpdatePayload = (
  body: unknown,
): ValidationResult<UpdateBookInput> => {
  if (typeof body !== "object" || body === null) {
    return { valid: false, errors: ["payload must be an object"] };
  }

  const candidate = body as Record<string, unknown>;
  const errors: string[] = [];
  const value: UpdateBookInput = {};

  if ("title" in candidate) {
    if (typeof candidate.title !== "string" || candidate.title.trim() === "") {
      errors.push("title must be a non-empty string");
    } else {
      value.title = candidate.title;
    }
  }

  if ("author" in candidate) {
    if (typeof candidate.author !== "string" || candidate.author.trim() === "") {
      errors.push("author must be a non-empty string");
    } else {
      value.author = candidate.author;
    }
  }

  if ("price" in candidate) {
    const price = parseNumber(candidate.price);
    if (price === undefined || price < 0) {
      errors.push("price must be a non-negative number");
    } else {
      value.price = price;
    }
  }

  if ("stock" in candidate) {
    const stock = parseNumber(candidate.stock);
    if (!Number.isInteger(stock) || (stock ?? 0) < 0) {
      errors.push("stock must be a non-negative integer");
    } else if (stock !== undefined) {
      value.stock = stock;
    }
  }

  if ("isbn" in candidate) {
    if (
      candidate.isbn !== undefined &&
      candidate.isbn !== null &&
      typeof candidate.isbn !== "string"
    ) {
      errors.push("isbn must be a string or null");
    } else if (
      typeof candidate.isbn === "string" ||
      candidate.isbn === null
    ) {
      value.isbn = candidate.isbn;
    }
  }

  if ("description" in candidate) {
    if (
      candidate.description !== undefined &&
      candidate.description !== null &&
      typeof candidate.description !== "string"
    ) {
      errors.push("description must be a string or null");
    } else if (
      typeof candidate.description === "string" ||
      candidate.description === null
    ) {
      value.description = candidate.description;
    }
  }

  if ("publishedAt" in candidate) {
    if (
      candidate.publishedAt !== undefined &&
      candidate.publishedAt !== null &&
      typeof candidate.publishedAt !== "string"
    ) {
      errors.push("publishedAt must be an ISO string or null");
    } else if (
      typeof candidate.publishedAt === "string" ||
      candidate.publishedAt === null
    ) {
      value.publishedAt = candidate.publishedAt;
    }
  }

  if (errors.length > 0) {
    return { valid: false, errors };
  }

  if (Object.keys(value).length === 0) {
    return {
      valid: false,
      errors: ["at least one field must be provided for update"],
    };
  }

  return { valid: true, value };
};

export const listBooksHandler = (_req: Request, res: Response) => {
  const books = listBooks();
  res.json({ data: books });
};

export const getBookHandler = (req: Request, res: Response) => {
  const { id } = req.params;
  if (!id) {
    return res.status(400).json({ message: "Book id is required" });
  }

  const book = getBookById(id);
  if (!book) {
    return res.status(404).json({ message: "Book not found" });
  }
  res.json({ data: book });
};

export const createBookHandler = (req: Request, res: Response) => {
  const result = validateCreatePayload(req.body);
  if (!result.valid) {
    return res
      .status(400)
      .json({ message: "Invalid payload", errors: result.errors });
  }

  const book = createBook(result.value);
  res.status(201).json({ data: book });
};

export const updateBookHandler = (req: Request, res: Response) => {
  const { id } = req.params;
  if (!id) {
    return res.status(400).json({ message: "Book id is required" });
  }

  const book = getBookById(id);
  if (!book) {
    return res.status(404).json({ message: "Book not found" });
  }

  const result = validateUpdatePayload(req.body);
  if (!result.valid) {
    return res
      .status(400)
      .json({ message: "Invalid payload", errors: result.errors });
  }

  const updated = updateBook(book.id, result.value);
  res.json({ data: updated });
};

export const deleteBookHandler = (req: Request, res: Response) => {
  const { id } = req.params;
  if (!id) {
    return res.status(400).json({ message: "Book id is required" });
  }

  const deleted = deleteBook(id);
  if (!deleted) {
    return res.status(404).json({ message: "Book not found" });
  }

  res.status(204).send();
};

