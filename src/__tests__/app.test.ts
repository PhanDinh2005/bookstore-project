import request from "supertest";

import app from "../app";
import {
  resetBooks,
  seedBooks,
} from "../modules/books/book.repository";
import type { Book } from "../modules/books/book.types";

describe("Bookstore API", () => {
  beforeEach(() => {
    resetBooks();
    seedBooks();
  });

  describe("Health", () => {
    it("returns ok status", async () => {
      const response = await request(app).get("/api/health");

      expect(response.status).toBe(200);
      expect(response.body).toEqual({ status: "ok" });
    });
  });

  describe("Books", () => {
    it("lists seeded books", async () => {
      const response = await request(app).get("/api/books");

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body.data).toHaveLength(2);
    });

    it("creates a new book", async () => {
      const payload = {
        title: "Refactoring",
        author: "Martin Fowler",
        price: 45.5,
        stock: 5,
        isbn: "9780201485677",
        description: "Improving the design of existing code.",
      };

      const createResponse = await request(app)
        .post("/api/books")
        .send(payload);

      expect(createResponse.status).toBe(201);
      expect(createResponse.body.data).toMatchObject({
        ...payload,
        isbn: payload.isbn,
        description: payload.description,
      });
      expect(createResponse.body.data.id).toBeDefined();

      const listResponse = await request(app).get("/api/books");
      expect(listResponse.body.data).toHaveLength(3);
    });

    it("updates an existing book", async () => {
      const listResponse = await request(app).get("/api/books");
      const [firstBook] = listResponse.body.data as Book[];

      const updateResponse = await request(app)
        .put(`/api/books/${firstBook.id}`)
        .send({ price: firstBook.price + 10, stock: firstBook.stock + 1 });

      expect(updateResponse.status).toBe(200);
      expect(updateResponse.body.data.price).toBe(firstBook.price + 10);
      expect(updateResponse.body.data.stock).toBe(firstBook.stock + 1);
    });

    it("deletes a book", async () => {
      const listResponse = await request(app).get("/api/books");
      const [firstBook] = listResponse.body.data as Book[];

      const deleteResponse = await request(app).delete(
        `/api/books/${firstBook.id}`,
      );

      expect(deleteResponse.status).toBe(204);

      const getResponse = await request(app).get(
        `/api/books/${firstBook.id}`,
      );
      expect(getResponse.status).toBe(404);
    });
  });
});

