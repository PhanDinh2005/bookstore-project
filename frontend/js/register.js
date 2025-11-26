const API_BASE = "http://localhost:5000/api";

async function handleRegister(event) {
  event.preventDefault(); // Chặn load lại trang

  // 1. Lấy dữ liệu
  const username = document.getElementById("username").value;
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;
  const confirmPassword = document.getElementById("confirm-password").value;
  const errorMsg = document.getElementById("error-message");

  // Reset lỗi
  errorMsg.style.display = "none";
  errorMsg.innerText = "";

  // 2. Kiểm tra mật khẩu khớp nhau
  if (password !== confirmPassword) {
    errorMsg.innerText = "Mật khẩu xác nhận không khớp!";
    errorMsg.style.display = "block";
    return;
  }

  try {
        // 3. Gửi yêu cầu Đăng ký lên Server
        const res = await fetch(`${API_BASE}/auth/register`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            // 👇 SỬA DÒNG NÀY: Đổi 'username' thành 'name: username'
            // Nghĩa là: Lấy giá trị nhập ở ô username, nhưng gửi đi với tên là "name" cho Backend vui lòng
            body: JSON.stringify({ 
                name: username,  // <--- QUAN TRỌNG
                email, 
                password 
            })
        });

        const data = await res.json();

    // 4. Xử lý kết quả
    if (res.ok || data.success) {
      alert("🎉 Đăng ký thành công! Hãy đăng nhập ngay.");
      // Chuyển hướng sang trang đăng nhập
      window.location.href = "login.html";
    } else {
      // Hiện lỗi từ Backend (ví dụ: Email đã tồn tại)
      errorMsg.innerText = data.message || "Đăng ký thất bại!";
      errorMsg.style.display = "block";
    }
  } catch (err) {
    console.error(err);
    errorMsg.innerText = "Lỗi kết nối Server!";
    errorMsg.style.display = "block";
  }
}
