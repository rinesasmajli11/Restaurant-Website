function subscribeUser(event) {
  event.preventDefault();

  const email = document.getElementById("subscriberEmail").value;
  const isSubscribed = document.getElementById("checkbox").checked;

  if (!email || !email.includes("@")) {
    Toastify({
      text: "Please enter a valid email address",
      duration: 3000,
      backgroundColor: "red",
      color: "white",
      gravity: "top-right",
      position: "top-right",
      close: true,
    }).showToast();
    return;
  }

  const subscriber = {
    email: email,
    subscribed: isSubscribed,
  };
  localStorage.setItem("subscriber", JSON.stringify(subscriber));

  Toastify({
    text: "Subscribed successfully!",
    duration: 3000,
    backgroundColor: "#28a745",
    gravity: "top",
    color: "white",
    position: "center",
  }).showToast();

  // Reset form fields
  document.getElementById("subscriberEmail").value = "";
  document.getElementById("checkbox").checked = false;
}

document
  .getElementById("subscribeForm")
  .addEventListener("submit", subscribeUser);
