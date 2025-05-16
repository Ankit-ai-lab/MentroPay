// auth.js
import { auth } from "./firebase-init.js";
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
} from "https://www.gstatic.com/firebasejs/11.7.3/firebase-auth.js";

// Login
document.getElementById("loginForm").addEventListener("submit", async (e) => {
  e.preventDefault();
  const email = document.getElementById("loginEmail").value;
  const password = document.getElementById("loginPassword").value;

  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    alert("Login successful!");
    console.log(userCredential.user);
    // window.location.href = "/home.html"; // redirect if needed
  } catch (error) {
    alert("Login Failed: " + error.message);
  }
});

// Signup
document.getElementById("signupForm").addEventListener("submit", async (e) => {
  e.preventDefault();
  const email = document.getElementById("signupEmail").value;
  const password = document.getElementById("signupPassword").value;

  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    alert("Signup successful!");
    console.log(userCredential.user);
    // Optional: redirect or auto-login
  } catch (error) {
    alert("Signup Failed: " + error.message);
  }
});
