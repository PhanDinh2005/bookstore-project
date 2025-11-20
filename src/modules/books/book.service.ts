import { BookRepository, seedBooks } from "./book.repository";
import type { Book, CreateBookInput, UpdateBookInput } from "./book.types";

seedBooks();

export const listBooks = (): Book[] => BookRepository.findAll();

export const getBookById = (id: string): Book | undefined =>
  BookRepository.findById(id);

export const createBook = (payload: CreateBookInput): Book =>
  BookRepository.create(payload);

export const updateBook = (
  id: string,
  payload: UpdateBookInput
): Book | undefined => BookRepository.update(id, payload);

export const deleteBook = (id: string): boolean => BookRepository.delete(id);
