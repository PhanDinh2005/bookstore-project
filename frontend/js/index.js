// Đảm bảo biến API_BASE đã có (thường nằm trong api.js, nếu chưa thì khai báo lại ở đây)
// const API_BASE = "http://localhost:5000/api";

document.addEventListener("DOMContentLoaded", () => {
  // Kiểm tra đăng nhập (hàm này nằm bên api.js)
  if (typeof checkLogin === "function") checkLogin();

  // Tải toàn bộ sách lần đầu
  loadBooks();
});

// 1. HÀM TẢI SÁCH (CÓ HỖ TRỢ TÌM KIẾM & LỌC)
async function loadBooks(params = {}) {
  const container = document.getElementById("book-list");
  container.innerHTML =
    '<p style="text-align:center; width:100%">⏳ Đang tìm kiếm...</p>';

  try {
    // Xây dựng đường dẫn URL với tham số
    // Backend "xịn" của bạn dùng route: GET /api/books (getAllBooks xử lý cả filter)
    const url = new URL(`${API_BASE}/books`);

    // Thêm các tham số vào URL (search, min_price, max_price...)
    Object.keys(params).forEach((key) => {
      if (params[key]) url.searchParams.append(key, params[key]);
    });

    console.log("Calling API:", url.toString()); // Log để kiểm tra link

    const res = await fetch(url);
    const data = await res.json();

    if (data.success) {
      renderBooks(data.data);
    } else {
      container.innerHTML = `<p style="text-align:center; color:red">${data.message}</p>`;
    }
  } catch (err) {
    console.error("Lỗi:", err);
    container.innerHTML = `<p style="text-align:center; color:red">Lỗi kết nối Server!</p>`;
  }
}

// 2. HÀM XỬ LÝ KHI BẤM NÚT TÌM KIẾM
function handleSearch() {
  const keyword = document.getElementById("search-input").value;
  const priceFilter = document.getElementById("price-filter").value;

  // Tạo object chứa tham số để gửi lên Server
  const params = {};

  // Nếu có từ khóa thì thêm vào params (Backend nhận biến 'search')
  if (keyword.trim()) {
    params.search = keyword.trim();
  }

  // Xử lý khoảng giá (Ví dụ: "50000-100000")
  if (priceFilter) {
    const [min, max] = priceFilter.split("-");
    params.min_price = min;
    params.max_price = max;
  }

  // Gọi lại hàm load sách với tham số mới
  loadBooks(params);
}

// 3. HÀM VẼ SÁCH RA MÀN HÌNH
// ... (Các phần logic tìm kiếm, loadBooks giữ nguyên như bài trước)

// CHỈ CẦN THAY THẾ HÀM renderBooks BẰNG CÁI NÀY:

function renderBooks(books) {
  const container = document.getElementById("book-list");

  if (!books || books.length === 0) {
    container.innerHTML =
      "<div style='text-align:center; width:100%; padding: 50px;'>❌ Không tìm thấy cuốn sách nào.</div>";
    return;
  }

  const formatMoney = (amount) =>
    new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);

  const html = books
    .map((book) => {
      // Giả lập giá gốc (cao hơn giá bán 20%) để hiển thị giảm giá cho đẹp
      const fakeOriginalPrice = book.price * 1.2;
      const discount = Math.round(
        ((fakeOriginalPrice - book.price) / fakeOriginalPrice) * 100
      );

      return `
        <div class="product-card">
            ${discount > 0 ? `<div class="badge-hot">-${discount}%</div>` : ""}
            
            <a href="pages/detail.html?id=${book.id}">
                <img src="${
                  book.image_url || "https://via.placeholder.com/200"
                }" alt="${
        book.title
      }" onerror="this.src='https://via.placeholder.com/200'">
            </a>
            
            <a href="pages/detail.html?id=${book.id}" title="${book.title}">
                <h3>${book.title}</h3>
            </a>

            <div class="rating-area">
                ${renderStars(book.average_rating || 0)}
                <span class="review-count">(${
                  book.review_count || 0
                } đánh giá)</span>
            </div>

            <div class="price">
                ${formatMoney(book.price)}
                <span class="original-price">${formatMoney(
                  fakeOriginalPrice
                )}</span>
            </div>

            <div class="card-footer">
                <button class="btn-add-cart" onclick="addToCart(${book.id})">
                    <i class="fas fa-cart-plus"></i> Thêm vào giỏ
                </button>
            </div>
        </div>
        `;
    })
    .join("");

  container.innerHTML = html;
}

// ... (Các hàm khác giữ nguyên)
// 4. HÀM VẼ NGÔI SAO (Helper)
function renderStars(rating) {
  let stars = "";
  for (let i = 1; i <= 5; i++) {
    if (i <= rating) stars += '<i class="fas fa-star"></i>'; // Sao đầy
    else if (i - 0.5 <= rating)
      stars += '<i class="fas fa-star-half-alt"></i>'; // Sao nửa
    else stars += '<i class="far fa-star"></i>'; // Sao rỗng
  }
  return stars;
}


// ... (Các hàm khác giữ nguyên)

// 5. HÀM THÊM GIỎ HÀNG (Đã được sửa)
async function addToCart(bookId) {
  const token = localStorage.getItem("token"); // Thay alert() bằng thông báo SweetAlert2
  if (!token) {
    Swal.fire({
      title: "Đăng nhập",
      text: "Bạn cần đăng nhập để mua hàng.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#e30019", // Màu đỏ Fahasa
      cancelButtonColor: "#6c757d",
      confirmButtonText: "Đến trang Đăng nhập",
      cancelButtonText: "Để sau",
    }).then((result) => {
      if (result.isConfirmed) {
        window.location.href = "pages/login.html";
      }
    });
    return;
  }

  try {
    const res = await fetch(`${API_BASE}/cart/add`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ bookId, quantity: 1 }),
    });
    const data = await res.json();

    if (res.ok || data.success) {
      await updateCartCount();
      // ✅ THAY THẾ alert() BẰNG SWAL.FIRE() - POPUP XỊN SÒ
      Swal.fire({
        title: "Thành công!",
        text: "✅ Đã thêm vào giỏ hàng!",
        icon: "success",
        toast: true, // Kích hoạt chế độ Toast (thông báo nhỏ gọn)
        position: "top-end", // Hiển thị ở góc trên bên phải
        showConfirmButton: false,
        timer: 1500, // Tự động đóng sau 1,5 giây
        timerProgressBar: true,
      });
    } else {
      // Thông báo lỗi
      Swal.fire({
        title: "Lỗi",
        text: "Lỗi: " + data.message,
        icon: "error",
        confirmButtonColor: "#e30019",
      });
    }
  } catch (e) {
    // Lỗi kết nối
    Swal.fire({
      title: "Lỗi",
      text: "Lỗi kết nối Server!",
      icon: "error",
      confirmButtonColor: "#e30019",
    });
  }
}
