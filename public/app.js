
document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("orderForm");

  if (!form) return;

  form.addEventListener("submit", async (event) => {
    event.preventDefault();

    const button = form.querySelector('[type="submit"]');

    if (button) {
      button.disabled = true;
      button.textContent = "Please wait...";
    }

    const formData = new FormData(form);

    const order = {
      name: formData.get("name"),
      phone: formData.get("phone"),
      address: formData.get("address"),
      pincode: formData.get("pincode"),
      useFor: formData.get("useFor"),
      quantity: formData.get("quantity"),
      note: formData.get("note")
    };

    try {
      const response = await fetch("/api/orders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(order)
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.message || "Order failed");
      }

      const message =
        "Namaste GAUNAYAN! My order details:\n" +
        "Name: " + order.name + "\n" +
        "Phone: " + order.phone + "\n" +
        "Address: " + order.address + "\n" +
        "Pincode: " + order.pincode + "\n" +
        "Purpose: " + order.useFor + "\n" +
        "Quantity: " + order.quantity + "\n" +
        "Note: " + order.note;

      alert("Order saved successfully! WhatsApp is opening.");

      window.location.href =
        "https://wa.me/919712998241?text=" +
        encodeURIComponent(message);

    } catch (error) {
      alert("Order save nahi hua. Please try again.");
      console.error(error);

      if (button) {
        button.disabled = false;
        button.textContent = "Submit Order";
      }
    }
  });
});
