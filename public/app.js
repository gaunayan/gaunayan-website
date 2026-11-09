document.addEventListener("DOMContentLoaded", function () {
  const form = document.getElementById("orderForm");
  if (!form) return;

  form.addEventListener("submit", function (event) {
    event.preventDefault();

    const name = document.getElementById("name").value.trim();
    const mobile = document.getElementById("mobile").value.trim();
    const address = document.getElementById("address").value.trim();
    const quantity = document.getElementById("quantity").value.trim();

    const message = `નમસ્તે GAUNAYAN!
નામ: ${name}
મોબાઇલ: ${mobile}
સરનામું: ${address}
જથ્થો: ${quantity}`;

    window.open(
      "https://wa.me/919712998241?text=" + encodeURIComponent(message),
      "_blank"
    );
  });
});
