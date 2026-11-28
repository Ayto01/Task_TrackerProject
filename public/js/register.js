import { registerAccount } from "./api.js";

const form = document.getElementById("register-form");
const submitButton = form.querySelector('button[type="submit"]');
const status = document.getElementById("register-status");
const signInLink = document.getElementById("sign-in-link");

form.addEventListener("submit", async (event) => {
    event.preventDefault();

    const email = document.getElementById("register-email").value.trim();
    const password = document.getElementById("register-password").value;

    submitButton.disabled = true;
    status.textContent = "Creating account...";

    try {
        await registerAccount(email, password);

        form.reset();
        form.hidden = true;
        status.textContent = "Account created. Sign in to continue.";
        signInLink.textContent = "Sign in";
        signInLink.focus();
    } catch (error) {
        status.textContent = error.message;
    } finally {
        submitButton.disabled = false;
    }
});