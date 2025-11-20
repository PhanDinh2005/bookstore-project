## Base URL

- Development: `http://localhost:3000`

## Health Check

- `GET /api/health`
  - **200 OK** — `{ "status": "ok" }`

## Catalog

### List Books

- `GET /api/books`
  - **200 OK** — `{ "data": Book[] }`

### Retrieve Book

- `GET /api/books/:id`
  - **200 OK** — `{ "data": Book }`
  - **404 Not Found** — `{ "message": "Book not found" }`

### Create Book

- `POST /api/books`
  - **Body**
    ```json
    {
      "title": "string",
      "author": "string",
      "price": 12.5,
      "stock": 4,
      "isbn": "optional string",
      "description": "optional string",
      "publishedAt": "optional ISO string"
    }
    ```
  - **201 Created** — `{ "data": Book }`
  - **400 Bad Request** — `{ "message": "Invalid payload", "errors": string[] }`

### Update Book

- `PUT /api/books/:id`
  - **Body** — Any subset of create fields.
  - **200 OK** — `{ "data": Book }`
  - **400 Bad Request** — `{ "message": "Invalid payload", "errors": string[] }`
  - **404 Not Found** — `{ "message": "Book not found" }`

### Delete Book

- `DELETE /api/books/:id`
  - **204 No Content**
  - **404 Not Found** — `{ "message": "Book not found" }`

### Book Schema

```json
{
  "id": "uuid",
  "title": "string",
  "author": "string",
  "price": 0,
  "stock": 0,
  "isbn": "string | null",
  "description": "string | null",
  "publishedAt": "string | null",
  "createdAt": "ISO string",
  "updatedAt": "ISO string"
}
```
