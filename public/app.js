document.addEventListener("DOMContentLoaded", function () {
  const form = document.getElementById("orderForm");

  if (!form) return;

  form.addEventListener("submit", function (event) {
    event.preventDefault();

    const data = new FormData(form);

    const message = `નમસ્તે GAUNAYAN!
નામ: ${data.get("name")}
મોબાઇલ: ${data.get("phone")}
સરનામું: ${data.get("address")}
પિનકોડ: ${data.get("pincode")}
ઉપયોગ: ${data.get("useFor")}
જથ્થો: ${data.get("quantity")}
વધારાની માહિતી: ${data.get("note") || "નથી"}`;

    const url = "https://wa.me/919712998241?text=" +
      encodeURIComponent(message);

    window.open(url, "_blank");
  });
});
