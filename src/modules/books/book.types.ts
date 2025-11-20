export interface Book {
  id: string;
  title: string;
  author: string;
  price: number;
  stock: number;
  isbn: string | null;
  description: string | null;
  publishedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateBookInput {
  title: string;
  author: string;
  price: number;
  stock: number;
  isbn?: string | null;
  description?: string | null;
  publishedAt?: string | null;
}

export interface UpdateBookInput {
  title?: string;
  author?: string;
  price?: number;
  stock?: number;
  isbn?: string | null;
  description?: string | null;
  publishedAt?: string | null;
}

