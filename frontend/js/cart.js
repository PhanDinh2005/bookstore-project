// ======= TOAST THÔNG BÁO =======
function showToast(message, type = "success") {
  const toast = document.createElement("div");
  toast.className = `toast ${type}`;
  toast.textContent = message;
  document.body.appendChild(toast);
  setTimeout(() => toast.classList.add("show"), 10);
  setTimeout(() => toast.classList.remove("show"), 2500);
  setTimeout(() => toast.remove(), 3000);
}

// ======= THÊM VÀO GIỎ =======
export function addToCart(book) {
  let cart = JSON.parse(localStorage.getItem("cart")) || [];
  const existing = cart.find((item) => item.title === book.title);
  if (existing) {
    existing.quantity += 1;
  } else {
    cart.push({ ...book, quantity: 1 });
  }
  localStorage.setItem("cart", JSON.stringify(cart));
  showToast(`✅ Đã thêm "${book.title}" vào giỏ hàng!`);
}
window.addToCart = addToCart;

// ======= HIỂN THỊ GIỎ HÀNG =======
export function displayCart() {
  const cart = JSON.parse(localStorage.getItem("cart")) || [];
  const container = document.getElementById("cart-items");
  const totalElement = document.getElementById("cart-total");

  if (!container || !totalElement) return;

  if (!cart.length) {
    container.innerHTML = "<tr><td colspan='7'>🛒 Giỏ hàng trống!</td></tr>";
    totalElement.textContent = "0đ";
    return;
  }

  let total = 0;
  container.innerHTML = cart
    .map((item, i) => {
      total += item.price * item.quantity;
      return `
        <tr>
          <td>${i + 1}</td>
          <td><img src="${item.img}" alt="${item.title}" width="70"></td>
          <td>${item.title}</td>
          <td>${item.price.toLocaleString()}đ</td>
          <td>
            <input type="number" min="1" value="${item.quantity}" onchange="updateQuantity(${i}, this.value)">
          </td>
          <td>${(item.price * item.quantity).toLocaleString()}đ</td>
          <td><button class="delete-btn" onclick="removeItem(${i})">❌</button></td>
        </tr>
      `;
    })
    .join("");

  totalElement.textContent = total.toLocaleString() + "đ";
}
window.displayCart = displayCart;

// ======= CẬP NHẬT SỐ LƯỢNG =======
window.updateQuantity = (index, value) => {
  const cart = JSON.parse(localStorage.getItem("cart")) || [];
  cart[index].quantity = parseInt(value);
  localStorage.setItem("cart", JSON.stringify(cart));
  showToast("✅ Cập nhật số lượng thành công!");
  displayCart();
};

// ======= XOÁ 1 SẢN PHẨM =======
window.removeItem = (index) => {
  const cart = JSON.parse(localStorage.getItem("cart")) || [];
  const item = cart[index].title;
  if (confirm(`🗑️ Xoá "${item}" khỏi giỏ hàng?`)) {
    cart.splice(index, 1);
    localStorage.setItem("cart", JSON.stringify(cart));
    showToast(`🗑️ Đã xoá "${item}"`);
    displayCart();
  }
};

// ======= THANH TOÁN =======
window.checkout = () => {
  const cart = JSON.parse(localStorage.getItem("cart")) || [];
  if (!cart.length) {
    showToast("⚠️ Giỏ hàng trống!", "error");
    return;
  }
  if (confirm("💳 Xác nhận thanh toán toàn bộ giỏ hàng?")) {
    localStorage.removeItem("cart");
    showToast("🎉 Thanh toán thành công!");
    displayCart();
  }
};
