async function fetchMenuData() {
  try {
    const response = await fetch("js/food.json");
    const foodData = await response.json();

    renderCategories(foodData.categories);
    const firstCategory = Object.keys(foodData.categories)[0];
    renderMenuItems(foodData.categories[firstCategory], firstCategory);
    setupCategorySwitching(foodData.categories);
    document.querySelector(".menu-category").classList.add("active");
    renderPaymentSummary();
  } catch (error) {
    console.error("Error while fetching menu data:", error);
  }
}

function formatCardNumber(input) {
  input.value = input.value.replace(/\D/g, "").replace(/(\d{4})(?=\d)/g, "$1 ");
}

function validateCardNumber(cardNumber) {
  const cardNumberPattern = /^\d{4} \d{4} \d{4} \d{4}$/;
  return cardNumberPattern.test(cardNumber);
}

function formatExpirationDate(input) {
  input.value = input.value
    .replace(/\D/g, "")
    .replace(/(\d{2})(?=\d)/, "$1/")
    .slice(0, 5);
}

function validateExpirationDate(expirationDate) {
  const expirationDatePattern = /^(0[1-9]|1[0-2])\/\d{2}$/;
  if (!expirationDatePattern.test(expirationDate)) return false;

  const [month, year] = expirationDate.split("/").map(Number);
  const currentYear = new Date().getFullYear() % 100;
  const currentMonth = new Date().getMonth() + 1;

  return year > currentYear || (year === currentYear && month >= currentMonth);
}

function validateCVV(cvv) {
  const cvvPattern = /^\d{3}$/;
  return cvvPattern.test(cvv);
}

document.addEventListener("DOMContentLoaded", () => {
  const cardNumberInput = document.getElementById("card-number");
  const expirationDateInput = document.getElementById("expiration-date");
  const cvvInput = document.getElementById("cvv");

  cardNumberInput.addEventListener("input", () =>
    formatCardNumber(cardNumberInput)
  );
  expirationDateInput.addEventListener("input", () =>
    formatExpirationDate(expirationDateInput)
  );

  document
    .getElementById("payment-form")
    .addEventListener("submit", function (event) {
      event.preventDefault();
      const cardNumber = cardNumberInput.value.trim();
      const expirationDate = expirationDateInput.value.trim();
      const cvv = cvvInput.value.trim();
      closePaymentModal();
    });
});

function closePaymentModal() {
  document.getElementById("payment-modal").style.display = "none";
  document.getElementById("succsess-modal").style.display = "flex"; // Shows success modal

  setTimeout(() => {
    document.getElementById("succsess-modal").style.display = "none";
    clearCart(); // Clear cart after successful payment
    location.reload(); // Refresh the page after clearing the cart
  }, 3000);
}

function clearCart() {
  localStorage.removeItem("cart");
}

function renderCategories(categories) {
  const categoryContainer = document.querySelector(".menu-categories");
  categoryContainer.innerHTML = "";

  Object.keys(categories).forEach((categoryName, index) => {
    const categoryElement = document.createElement("div");
    categoryElement.classList.add("menu-category");

    if (index === 0) {
      categoryElement.classList.add("active");
    }

    categoryElement.innerHTML = `
        <img src="img/pasta 1.svg" alt="${categoryName}" class="menu-category-img" />
        <div class="menu-category-info">
          <h3 class="menu-category-title">${categoryName}</h3>
          <p class="text-gray">${categories[categoryName].length} items in stock</p>
        </div>
      `;

    categoryContainer.appendChild(categoryElement);
  });
}

function renderMenuItems(items, categoryName) {
  const menuItemsContainer = document.querySelector(".menu-items");
  const categoryTitleElement = document.querySelector(".primary-title");

  categoryTitleElement.textContent = `${categoryName} Menu`;
  menuItemsContainer.innerHTML = "";

  items.forEach((item) => {
    const menuItemElement = document.createElement("div");
    menuItemElement.classList.add("menu-item");

    menuItemElement.innerHTML = `
        <div class="menu-item-header">
          <img src="${item.image}" alt="${item.name}" class="menu-item-img" />
          <div class="menu-item-title">
            <h3>${item.name}</h3>
            <p class="menu-item-desc text-gray">Delicious ${item.name}</p>
          </div>
        </div>
        <div class="menu-item-footer">
          <h3 class="menu-item-price">
            <span class="text-gray">$</span> ${item.price.toFixed(2)}
          </h3>
          <button class="menu-item-button" data-name="${
            item.name
          }" data-price="${item.price}" data-image="${
      item.image
    }">Add to cart</button>
        </div>
      `;

    menuItemsContainer.appendChild(menuItemElement);
  });

  document.querySelectorAll(".menu-item-button").forEach((button) => {
    button.addEventListener("click", () => {
      const name = button.getAttribute("data-name");
      const price = parseFloat(button.getAttribute("data-price"));
      const image = button.getAttribute("data-image");
      addToCart({ name, price, image });
    });
  });
}

function addToCart(selectedFood) {
  let cart = JSON.parse(localStorage.getItem("cart")) || [];
  const existingItemIndex = cart.findIndex(
    (item) => item.name === selectedFood.name
  );

  if (existingItemIndex !== -1) {
    cart[existingItemIndex].quantity += 1;
  } else {
    cart.push({
      name: selectedFood.name,
      price: selectedFood.price,
      image: selectedFood.image,
      quantity: 1,
    });
  }

  localStorage.setItem("cart", JSON.stringify(cart));
  updateCartBadge();
  renderInvoice();
  renderPaymentSummary();

  Toastify({
    text: `${selectedFood.name} added to the cart!`,
    duration: 3000,
    close: true,
    gravity: "bottom",
    position: "center",
    backgroundColor: "#ff7a00",
    stopOnFocus: true,
  }).showToast();
}

function updateCartBadge() {
  let cart = JSON.parse(localStorage.getItem("cart")) || [];
  document.getElementById("cart-badge").textContent = cart.length;
}

function setupCategorySwitching(categories) {
  const categoryElements = document.querySelectorAll(".menu-category");

  categoryElements.forEach((categoryElement) => {
    categoryElement.addEventListener("click", () => {
      const selectedCategoryName = categoryElement.querySelector(
        ".menu-category-title"
      ).textContent;
      categoryElements.forEach((el) => el.classList.remove("active"));
      categoryElement.classList.add("active");
      renderMenuItems(categories[selectedCategoryName], selectedCategoryName);
    });
  });
}

function renderPaymentSummary() {
  const paymentSummaryContainer = document.querySelector(".payment-summary");
  let cart = JSON.parse(localStorage.getItem("cart")) || [];
  let subTotal = 0;

  cart.forEach((item) => {
    subTotal += item.price * item.quantity;
  });

  const tax = subTotal * 0.05;
  const totalPayment = subTotal + tax;

  paymentSummaryContainer.innerHTML = `
      <h3>Payment Summary</h3>
      <div class="summary-detail">
        <p class="text-gray">Sub Total</p>
        <p>$${subTotal.toFixed(2)}</p>
      </div>
      <div class="summary-detail">
        <p class="text-gray">Tax</p>
        <p>$${tax.toFixed(2)}</p>
      </div>
      <div class="summary-total">
        <p class="text-gray">Total Payment</p>
        <p>$${totalPayment.toFixed(2)}</p>
      </div>
      <button class="pay-button" ${
        cart.length === 0 || totalPayment <= 0 ? "disabled" : ""
      } data-total="${totalPayment.toFixed(2)}">
        Pay $${totalPayment.toFixed(2)}
      </button>
    `;

  const payButton = document.querySelector(".pay-button");
  if (payButton) {
    payButton.addEventListener("click", function () {
      const totalPayment = parseFloat(this.getAttribute("data-total"));
      if (totalPayment > 0) {
        document.getElementById("payment-modal").style.display = "block";
      }
    });
  }
}

function renderInvoice() {
  const invoiceItemsContainer = document.querySelector(".invoice-items");
  invoiceItemsContainer.innerHTML = "<h2>Invoice</h2>";
  let cart = JSON.parse(localStorage.getItem("cart")) || [];
  let subTotal = 0;

  cart.forEach((item, index) => {
    const itemTotalPrice = item.price * item.quantity;
    subTotal += itemTotalPrice;

    const invoiceItemElement = document.createElement("div");
    invoiceItemElement.classList.add("invoice-item");

    invoiceItemElement.innerHTML = `
        <img src="${item.image}" alt="${item.name}" class="invoice-item-img" />
        <div class="invoice-item-details">
          <h3>${item.name}</h3>
          <div class="invoice-item-quantity">
            <button class="quantity-btn decrease" data-index="${index}">-</button>
            <input type="text" class="quantity-input" value="${
              item.quantity
            }" disabled />
            <button class="quantity-btn increase" data-index="${index}">+</button>
          </div>
        </div>
        <div class="invoice-item-price">
          <h3>$${itemTotalPrice.toFixed(2)}</h3>
        </div>
      `;

    invoiceItemsContainer.appendChild(invoiceItemElement);
  });

  document.querySelectorAll(".quantity-btn").forEach((button) => {
    button.addEventListener("click", (event) => {
      const index = event.target.getAttribute("data-index");
      const cart = JSON.parse(localStorage.getItem("cart")) || [];
      if (event.target.classList.contains("increase")) {
        cart[index].quantity += 1;
      } else if (event.target.classList.contains("decrease")) {
        cart[index].quantity -= 1;
        if (cart[index].quantity <= 0) {
          cart.splice(index, 1);
        }
      }
      localStorage.setItem("cart", JSON.stringify(cart));
      renderInvoice();
      renderPaymentSummary();
      updateCartBadge();
    });
  });
}

fetchMenuData();
updateCartBadge();
renderInvoice();
