(function(){
  "use strict";

  var contactForm = document.getElementById("contactForm");

  function validateField(id, errId, test){
    var val = document.getElementById(id).value.trim();
    var ok = test(val);
    document.getElementById(errId).style.display = ok ? "none" : "block";
    return ok;
  }

  contactForm.addEventListener("submit", function(ev){
    ev.preventDefault();
    var okName = validateField("cfName","errName", function(v){ return v.length > 1; });
    var okEmail = validateField("cfEmail","errEmail", function(v){ return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v); });
    var okSubject = validateField("cfSubject","errSubject", function(v){ return v.length > 2; });
    var okMessage = validateField("cfMessage","errMessage", function(v){ return v.length > 5; });
    if (okName && okEmail && okSubject && okMessage){
      var sendButton = contactForm.querySelector("button[type=submit]");
      var formData = new FormData(contactForm);
      sendButton.disabled = true;
      sendButton.textContent = "Sending...";
      fetch("https://formsubmit.co/ajax/doemyura@gmail.com", {
        method: "POST",
        body: formData,
        headers: {Accept: "application/json"}
      })
        .then(function(response){
          if (!response.ok) throw new Error("Message could not be sent");
          showToast("Your message has been sent successfully!");
          contactForm.reset();
        })
        .catch(function(){
          showToast("Unable to send your message. Please try again.");
        })
        .finally(function(){
          sendButton.disabled = false;
          sendButton.textContent = "Send Message";
        });
    }
  });

})();
