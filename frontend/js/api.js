const API_BASE_URL = "http://localhost:5000/api";

class BookstoreAPI {
  // Books API
  static async getBooks(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    const response = await fetch(`${API_BASE_URL}/books?${queryString}`);
    return await response.json();
  }

  static async getBookById(id) {
    const response = await fetch(`${API_BASE_URL}/books/${id}`);
    return await response.json();
  }

  static async searchBooks(query) {
    const response = await fetch(
      `${API_BASE_URL}/books/search?q=${encodeURIComponent(query)}`
    );
    return await response.json();
  }

  // Categories API
  static async getCategories() {
    const response = await fetch(`${API_BASE_URL}/categories`);
    return await response.json();
  }

  static async getCategoryById(id) {
    const response = await fetch(`${API_BASE_URL}/categories/${id}`);
    return await response.json();
  }

  static async getBooksByCategory(categoryId) {
    const response = await fetch(
      `${API_BASE_URL}/categories/${categoryId}/books`
    );
    return await response.json();
  }
}

// Cart functionality
class Cart {
  static getCart() {
    return JSON.parse(localStorage.getItem("cart")) || [];
  }

  static addToCart(book) {
    const cart = this.getCart();
    const existingItem = cart.find((item) => item.id === book.id);

    if (existingItem) {
      existingItem.quantity += 1;
    } else {
      cart.push({
        ...book,
        quantity: 1,
      });
    }

    localStorage.setItem("cart", JSON.stringify(cart));
    this.updateCartCount();
    return cart;
  }

  static removeFromCart(bookId) {
    const cart = this.getCart().filter((item) => item.id !== bookId);
    localStorage.setItem("cart", JSON.stringify(cart));
    this.updateCartCount();
    return cart;
  }

  static updateCartCount() {
    const cart = this.getCart();
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    document.getElementById("cart-count").textContent = totalItems;
  }

  static getTotalPrice() {
    const cart = this.getCart();
    return cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  }
}
