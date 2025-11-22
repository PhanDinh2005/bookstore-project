// ======================
// Xử lý đăng ký / đăng nhập
// ======================

// Hàm lưu tài khoản vào localStorage
function saveUser(username, password) {
  let users = JSON.parse(localStorage.getItem("users")) || [];
  const existingUser = users.find(u => u.username === username);
  if (existingUser) {
    alert("Tên đăng nhập đã tồn tại!");
    return false;
  }
  users.push({ username, password });
  localStorage.setItem("users", JSON.stringify(users));
  return true;
}

// Hàm đăng nhập
function login(username, password) {
  const users = JSON.parse(localStorage.getItem("users")) || [];
  const user = users.find(u => u.username === username && u.password === password);
  if (user) {
    localStorage.setItem("loggedInUser", username);
    window.location.href = "products.html";
  } else {
    alert("Sai tên đăng nhập hoặc mật khẩu!");
  }
}

// Hàm kiểm tra đã đăng nhập chưa
function checkLogin() {
  const user = localStorage.getItem("loggedInUser");
  if (!user) {
    window.location.href = "login.html";
  }
}

// Hàm đăng xuất
function logout() {
  localStorage.removeItem("loggedInUser");
  window.location.href = "login.html";
}

// =============
// Sự kiện form
// =============
document.addEventListener("DOMContentLoaded", () => {
  // Đăng ký
  const regForm = document.getElementById("registerForm");
  if (regForm) {
    regForm.addEventListener("submit", e => {
      e.preventDefault();
      const username = document.getElementById("regUsername").value.trim();
      const pass = document.getElementById("regPassword").value.trim();
      const confirm = document.getElementById("regConfirm").value.trim();
      if (pass !== confirm) {
        alert("Mật khẩu không trùng khớp!");
        return;
      }
      if (saveUser(username, pass)) {
        alert("Đăng ký thành công! Mời bạn đăng nhập.");
        window.location.href = "login.html";
      }
    });
  }

  // Đăng nhập
  const loginForm = document.getElementById("loginForm");
  if (loginForm) {
    loginForm.addEventListener("submit", e => {
      e.preventDefault();
      const username = document.getElementById("loginUsername").value.trim();
      const password = document.getElementById("loginPassword").value.trim();
      login(username, password);
    });
  }
});
