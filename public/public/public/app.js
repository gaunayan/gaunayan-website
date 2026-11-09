
document.addEventListener("DOMContentLoaded", function () {
  const form = document.getElementById("orderForm");

  if (!form) return;

  form.addEventListener("submit", function (event) {
    event.preventDefault();

    const name = document.getElementById("name").value.trim();
    const mobile = document.getElementById("mobile").value.trim();
    const address = document.getElementById("address").value.trim();
    const pincode = document.getElementById("pincode").value.trim();
    const useFor = document.getElementById("useFor").value;
    const quantity = document.getElementById("quantity").value.trim();
    const note = document.getElementById("note").value.trim();
    const consent = document.getElementById("consent");

    if (!consent.checked) {
      alert("Please agree to the privacy policy.");
      return;
    }

    const message =
      "નમસ્તે GAUNAYAN! મને Cow Dung Cake નો ઓર્ડર આપવો છે.\n\n" +
      "નામ: " + name + "\n" +
      "મોબાઇલ: " + mobile + "\n" +
      "સરનામું: " + address + "\n" +
      "પિનકોડ: " + pincode + "\n" +
      "ઉપયોગ: " + useFor + "\n" +
      "જથ્થો: " + quantity + "\n" +
      "વધુ માહિતી: " + (note || "નથી");

    const whatsappNumber = "919712998241";
    const whatsappURL =
      "https://wa.me/" + whatsappNumber +
      "?text=" + encodeURIComponent(message);

    window.open(whatsappURL, "_blank");
  });
});
