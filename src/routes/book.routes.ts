import { Router } from "express";

import {
  createBookHandler,
  deleteBookHandler,
  getBookHandler,
  listBooksHandler,
  updateBookHandler,
} from "../modules/books/book.controller";

const bookRouter = Router();

bookRouter.get("/", listBooksHandler);
bookRouter.get("/:id", getBookHandler);
bookRouter.post("/", createBookHandler);
bookRouter.put("/:id", updateBookHandler);
bookRouter.delete("/:id", deleteBookHandler);

export default bookRouter;
