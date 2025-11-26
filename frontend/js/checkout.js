let cartTotal = 0;
const SHIPPING_FEE = 30000;

document.addEventListener("DOMContentLoaded", () => {
  // 1. Kiểm tra đăng nhập
  const token = localStorage.getItem("token");
  if (!token) {
    alert("Vui lòng đăng nhập để thanh toán!");
    window.location.href = "login.html";
    return;
  }

  // 2. Tự điền tên user nếu có
  const user = JSON.parse(localStorage.getItem("user"));
  if (user && user.name) {
    document.getElementById("customer-name").value = user.name;
  }

  // 3. Tải giỏ hàng
  loadCheckoutCart();
});

async function loadCheckoutCart() {
  const token = localStorage.getItem("token");
  try {
    const res = await fetch(`${API_BASE}/cart`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const result = await res.json();

    // Xử lý lấy mảng item
    const items = Array.isArray(result) ? result : result.data || [];

    if (items.length === 0) {
      alert("Giỏ hàng trống! Quay lại mua sắm nhé.");
      window.location.href = "../index.html";
      return;
    }

    renderOrderSummary(items);
  } catch (err) {
    console.error("Lỗi tải đơn hàng:", err);
  }
}

function renderOrderSummary(items) {
  const container = document.getElementById("order-items-list");
  let html = "";
  cartTotal = 0;

  const formatMoney = (amount) =>
    new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);

  items.forEach((item) => {
    const price = item.price || 0;
    const total = price * item.quantity;
    cartTotal += total;

    html += `
            <div class="mini-item">
                <span style="font-weight:bold; color:#555; margin-right:5px;">${
                  item.quantity
                }x</span>
                <span class="mini-item-name">${item.title}</span>
                <span style="font-weight:bold;">${formatMoney(total)}</span>
            </div>
        `;
  });

  container.innerHTML = html;

  // Cập nhật số tiền
  document.getElementById("sub-total").innerText = formatMoney(cartTotal);
  document.getElementById("shipping-fee").innerText = formatMoney(SHIPPING_FEE);
  document.getElementById("final-total").innerText = formatMoney(
    cartTotal + SHIPPING_FEE
  );
}

// XỬ LÝ KHI BẤM "ĐẶT HÀNG"
async function handleCheckout(e) {
  e.preventDefault();

  const name = document.getElementById("customer-name").value;
  const phone = document.getElementById("phone").value;
  const address = document.getElementById("address").value;
  const note = document.getElementById("note").value;

  // Lấy radio button đang chọn
  const paymentMethod = document.querySelector(
    'input[name="payment"]:checked'
  ).value;

  const fullAddress = `${name} (${phone}) - ${address}`;

  const orderData = {
    shipping_address: fullAddress,
    customer_note: note,
    payment_method: paymentMethod,
    shipping_fee: SHIPPING_FEE,
    total_amount: cartTotal + SHIPPING_FEE,
  };

  const token = localStorage.getItem("token");
  const btn = document.querySelector(".btn-checkout");
  btn.innerText = "ĐANG XỬ LÝ...";
  btn.disabled = true;

  try {
    const res = await fetch(`${API_BASE}/orders`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(orderData),
    });

    const data = await res.json();

    if (res.ok || data.success) {
      alert("🎉 ĐẶT HÀNG THÀNH CÔNG! Cảm ơn bạn đã mua sách.");
      // Xóa giỏ hàng ảo trên giao diện (Backend đã tự xóa rồi)
      // Chuyển về trang chủ
      window.location.href = "../index.html";
    } else {
      alert("❌ Lỗi: " + data.message);
      btn.innerText = "ĐẶT HÀNG";
      btn.disabled = false;
    }
  } catch (err) {
    console.error(err);
    alert("Lỗi kết nối Server!");
    btn.innerText = "ĐẶT HÀNG";
    btn.disabled = false;
  }
}
