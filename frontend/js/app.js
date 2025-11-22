const books = [
  { id: 1, title: "Đắc Nhân Tâm", author: "Dale Carnegie", price: 100000 },
  { id: 2, title: "Nhà Giả Kim", author: "Paulo Coelho", price: 95000 },
  { id: 3, title: "Tư Duy Nhanh & Chậm", author: "Daniel Kahneman", price: 120000 }
];

function renderBooks(listId) {
  const container = document.getElementById(listId);
  if (!container) return;
  container.innerHTML = books.map(b => `
    <div class="book">
      <h3>${b.title}</h3>
      <p>${b.author}</p>
      <strong>${b.price.toLocaleString()}đ</strong>
      <button onclick="addToCart(${b.id})" class="btn">Thêm vào giỏ</button>
    </div>`).join("");
}

function addToCart(id) {
  alert("Đã thêm sách ID " + id + " vào giỏ!");
}

window.onload = () => renderBooks("featured-books");
