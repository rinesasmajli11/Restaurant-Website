let currentIndex = 0;
let currentFoodPrice = 0;
let currentQuantity = 1;
const visibleItemsCount = 3;

// Funksioni për të marrë të dhënat e ushqimit
async function fetchFoodData() {
  try {
    const response = await fetch("js/food.json");
    const foodData = await response.json();

    const initialCategory = "Lunch";
    renderFoodCarousel(foodData.categories[initialCategory]);
    updateHeroImage(foodData.categories[initialCategory][0]);
    setupArrowNavigation(foodData.categories[initialCategory]);
  } catch (error) {
    console.error("Error fetching food data:", error);
  }
}

// Funksioni për të renderuar karuselin e ushqimit
function renderFoodCarousel(foods) {
  const foodItemsContainer = document.querySelector(".food-items");
  foodItemsContainer.innerHTML = "";

  foods.forEach((food, index) => {
    const foodItem = document.createElement("div");
    foodItem.classList.add("food-item");

    if (index === 0) {
      foodItem.classList.add("selected");
    }

    foodItem.innerHTML = `
            <img src="${food.image}" alt="${food.name}">
            <p>${food.name}<br><span class="item-price">$${food.price.toFixed(
      2
    )}</span></p>
        `;

    if (index >= visibleItemsCount) {
      foodItem.style.display = "none";
    }

    foodItemsContainer.appendChild(foodItem);

    foodItem.addEventListener("click", () => {
      selectFoodItem(foodItemsContainer, foodItem, food);
      currentIndex = index;
    });
  });
}

// Funksioni për të përditësuar imazhin kryesor
function updateHeroImage(food) {
  const heroImage = document.querySelector(".hero-main-image");
  const foodTitle = document.querySelector(".food-title p:first-of-type");
  const foodRating = document.querySelector(".food-title p:last-of-type");
  const preparationTime = document.querySelector(".prepare-time");

  heroImage.src = food.image;
  heroImage.alt = food.name;
  foodTitle.textContent = food.name;
  foodRating.innerHTML = `<i class="fa-solid fa-star"></i> ${food.rating}`;
  preparationTime.innerHTML = `<i class="fa-regular fa-clock"></i> ${food.preparationTime}`;
}

// Funksioni për të përditësuar çmimin total
function updateTotalPrice() {
  const totalPriceElement = document.querySelector(".order-info-total .price");
  const total = currentFoodPrice * currentQuantity;
  totalPriceElement.textContent = `$${total.toFixed(2)}`;
}

// Funksioni për të përditësuar sasinë
function updateQuantity(newQuantity) {
  currentQuantity = newQuantity;
  document.querySelector(".quantity").textContent = currentQuantity;
  updateTotalPrice();
}

// Ngjitje e ngjarjeve për butonat e rritjes dhe uljes së sasisë
document.getElementById("increase").addEventListener("click", () => {
  updateQuantity(currentQuantity + 1);
});

document.getElementById("decrease").addEventListener("click", () => {
  if (currentQuantity > 1) {
    updateQuantity(currentQuantity - 1);
  }
});

// Funksioni për të zgjedhur një artikull ushqimi
function selectFoodItem(container, foodItem, selectedFood) {
  container
    .querySelectorAll(".food-item")
    .forEach((item) => item.classList.remove("selected"));

  foodItem.classList.add("selected");
  currentFoodPrice = selectedFood.price;
  currentQuantity = 1;
  updateQuantity(currentQuantity);
  updateHeroImage(selectedFood);
}

// Funksioni për navigimin me shigjeta
function setupArrowNavigation(foods) {
  const leftArrow = document.querySelector(".left-arrow");
  const rightArrow = document.querySelector(".right-arrow");

  leftArrow.addEventListener("click", () => {
    if (currentIndex > 0) {
      currentIndex--;
    } else {
      currentIndex = foods.length - visibleItemsCount;
    }
    updateVisibleItems(foods);
  });

  rightArrow.addEventListener("click", () => {
    if (currentIndex < foods.length - visibleItemsCount) {
      currentIndex++;
    } else {
      currentIndex = 0;
    }
    updateVisibleItems(foods);
  });
}

// Funksioni për të përditësuar artikujt e dukshëm në karusel
function updateVisibleItems(foods) {
  const foodItems = document.querySelectorAll(".food-item");

  foodItems.forEach((item, index) => {
    item.style.display =
      index >= currentIndex && index < currentIndex + visibleItemsCount
        ? "block"
        : "none";
  });
}

// Funksioni për të shtuar artikuj në shportë
function addToCart() {
  const cart = JSON.parse(localStorage.getItem("cart")) || [];

  const selectedFood = {
    name: document.querySelector(".food-title p:first-of-type").textContent,
    price: currentFoodPrice,
    image: document.querySelector(".hero-main-image").src,
    quantity: currentQuantity,
  };

  const existingIndex = cart.findIndex(
    (item) => item.name === selectedFood.name
  );

  if (existingIndex !== -1) {
    cart[existingIndex].quantity += currentQuantity;
  } else {
    cart.push(selectedFood);
  }

  localStorage.setItem("cart", JSON.stringify(cart));

  updateCartBadge();
  updateCartSummary();

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

// Funksioni për të përditësuar badge-n e shportës
function updateCartBadge() {
  const cart = JSON.parse(localStorage.getItem("cart")) || [];
  const totalQuantity = cart.reduce((total, item) => total + item.quantity, 0);
  const badgeElement = document.getElementById("Cart-Badge");

  if (badgeElement) {
    badgeElement.textContent = totalQuantity > 0 ? totalQuantity : 0;
  } else {
    console.error("Cart badge element not found!");
  }
}

// Funksioni për të përditësuar përmbledhjen e shportës
function updateCartSummary() {
  const cart = JSON.parse(localStorage.getItem("cart")) || [];
  const cartSummary = document.querySelector(".cart-summary");
  cartSummary.innerHTML = "";

  let totalPrice = 0;

  cart.forEach((item) => {
    totalPrice += item.price * item.quantity;

    const cartItem = document.createElement("div");
    cartItem.classList.add("cart-item");
    cartItem.innerHTML = `
           <img src="${item.image}" alt="${item.name}" class="cart-item-image">
           <div class="cart-item-details">
               <p>${item.name}</p>
               <p>Qty: ${item.quantity} x $${item.price.toFixed(2)}</p>
           </div>
           <p class="cart-item-total">$${(item.price * item.quantity).toFixed(
             2
           )}</p>
       `;

    cartSummary.appendChild(cartItem);
  });

  const totalPriceElement = document.createElement("div");
  totalPriceElement.classList.add("cart-total");
  totalPriceElement.innerHTML = `<p>Total Price: $${totalPrice.toFixed(2)}</p>`;
  cartSummary.appendChild(totalPriceElement);
}

// Ngjarjet kur DOM është ngarkuar plotësisht
document.addEventListener("DOMContentLoaded", () => {
  fetchFoodData();
  updateCartBadge();
  updateCartSummary();
});

// Ngjarja për butonin "Shto në shportë"
document.querySelector(".add-to-cart").addEventListener("click", addToCart);
