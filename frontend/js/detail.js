document.addEventListener("DOMContentLoaded", async () => {
  // Lấy ID từ URL (ví dụ: detail.html?id=5)
  const params = new URLSearchParams(window.location.search);
  const id = params.get("id");

  if (!id) return;

  try {
    const res = await fetch(`${API_BASE}/books/${id}`);
    const data = await res.json();
    const book = data.data;

    document.getElementById("detail-content").innerHTML = `
            <img src="${book.image_url}" class="detail-img">
            <div class="detail-info">
                <h1>${book.title}</h1>
                <p>Tác giả: <strong>${book.author}</strong></p>
                <div class="detail-price">${formatMoney(book.price)}</div>
                <p>${book.description || "Chưa có mô tả."}</p>
                <br>
                <button class="btn btn-primary" style="padding: 15px 30px;" onclick="addToCart(${
                  book.id
                })">
                    THÊM VÀO GIỎ NGAY
                </button>
            </div>
        `;
  } catch (err) {
    document.getElementById("detail-content").innerHTML =
      "Không tìm thấy sách!";
  }
});

// Copy lại hàm addToCart từ index.js hoặc dùng chung nếu biết cách import
async function addToCart(bookId) {
  /* Code giống index.js */
}
// ... (Code cũ giữ nguyên) ...

document.addEventListener("DOMContentLoaded", async () => {
  // ... (Code tải sách cũ) ...

  // 👇 THÊM: Sau khi tải sách xong thì tải Review
  loadReviews(id);
});

// Hàm tải Review
async function loadReviews(bookId) {
  try {
    const res = await fetch(`${API_BASE}/books/${bookId}/reviews`);
    const data = await res.json();
    const list = document.getElementById("reviews-list");

    if (data.data.length === 0) {
      list.innerHTML = "<p>Chưa có đánh giá nào. Hãy là người đầu tiên!</p>";
      return;
    }

    list.innerHTML = data.data
      .map(
        (review) => `
            <div style="border-bottom: 1px solid #eee; padding: 15px 0;">
                <div style="display:flex; justify-content:space-between;">
                    <strong>${review.user_name || "Người dùng ẩn danh"}</strong>
                    <span style="color:#f1c40f;">${"★".repeat(
                      review.rating
                    )}</span>
                </div>
                <p style="margin-top: 5px;">${review.comment}</p>
                <small style="color:#999;">${new Date(
                  review.created_at
                ).toLocaleDateString()}</small>
            </div>
        `
      )
      .join("");
  } catch (err) {
    console.error(err);
  }
}

// Hàm Gửi Review
async function submitReview() {
  if (!getToken()) {
    alert("Bạn cần đăng nhập để đánh giá!");
    return;
  }

  const params = new URLSearchParams(window.location.search);
  const bookId = params.get("id");
  const rating = document.getElementById("rating-input").value;
  const comment = document.getElementById("comment-input").value;

  try {
    const res = await fetch(`${API_BASE}/books/${bookId}/reviews`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${getToken()}`,
      },
      body: JSON.stringify({ rating, comment }),
    });

    const data = await res.json();
    if (data.success || res.ok) {
      alert("Cảm ơn đánh giá của bạn!");
      loadReviews(bookId); // Tải lại danh sách
      document.getElementById("comment-input").value = ""; // Xóa ô nhập
    } else {
      alert(data.message);
    }
  } catch (err) {
    alert("Lỗi kết nối server");
  }
}
