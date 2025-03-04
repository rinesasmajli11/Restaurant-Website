document.addEventListener("DOMContentLoaded", function () {
    const form = document.querySelector(".email-form");
    const nameInput = document.getElementById("name");
    const emailInput = document.getElementById("email");
    const subjectInput = document.getElementById("subject");
    const messageInput = document.querySelector("textarea");
    const formError = document.getElementById("formError");
    const submitButton = form.querySelector("button");

    form.addEventListener("submit", async function (event) {
        event.preventDefault();
        formError.textContent = ""; 
        formError.style.color = "red"; 

        let isValid = true;
        let errorMessage = "";

        // Name validation
        if (nameInput.value.trim() === "") {
            isValid = false;
            errorMessage += "Name cannot be empty. ";
        }

        // Email validation
        const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailPattern.test(emailInput.value.trim())) {
            isValid = false;
            errorMessage += "Invalid email address. ";
        }

        // Subject validation
        if (subjectInput.value.trim() === "") {
            isValid = false;
            errorMessage += "Subject cannot be empty. ";
        }

        // Message validation
        if (messageInput.value.trim().length < 10) {
            isValid = false;
            errorMessage += "Message must be at least 10 characters long.";
        }

        if (!isValid) {
            formError.textContent = errorMessage;
            return;
        }

        // Simulated form submission
        const formData = {
            name: nameInput.value.trim(),
            email: emailInput.value.trim(),
            subject: subjectInput.value.trim(),
            message: messageInput.value.trim(),
        };

        // Disable button & add loading effect
        submitButton.disabled = true;
        submitButton.textContent = "Sending...";
        submitButton.style.opacity = "0.7";

        try {
            // Simulating a POST request (Replace with your API URL)
            await new Promise(resolve => setTimeout(resolve, 1000)); // Simulated delay
            
            // Show success message
            formError.textContent = "Message sent successfully!";
            formError.style.color = "green";

            // Reset form after successful submission
            form.reset();
        } catch (error) {
            formError.textContent = "An error occurred. Please try again later.";
        }

        // Restore button state
        submitButton.disabled = false;
        submitButton.textContent = "Send Message";
        submitButton.style.opacity = "1";
    });
});
