import { auth, db } from "./firebase-init.js";
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
} from "https://www.gstatic.com/firebasejs/11.7.3/firebase-auth.js";
import {
  ref,
  get,
  set,
} from "https://www.gstatic.com/firebasejs/11.7.3/firebase-database.js";

// Signup Form Handler
document.getElementById("signupForm")?.addEventListener("submit", async (e) => {
  e.preventDefault();

  const email = document.getElementById("signupEmail").value;
  const password = document.getElementById("signupPassword").value;
  const confirmPassword = document.getElementById("signupConfirm").value;
  const fullName = document.getElementById("signupName").value;
  const role = document.getElementById("signupRole").value;

  // Validate passwords match
  if (password !== confirmPassword) {
    alert("Passwords do not match!");
    return;
  }

  try {
    // Create user in Firebase Auth
    const userCredential = await createUserWithEmailAndPassword(
      auth,
      email,
      password
    );
    const uid = userCredential.user.uid;

    // Store additional user data in Realtime Database
    await set(ref(db, `${role}/${uid}`), {
      fullName: fullName,
      email: email,
      role: role,
      createdAt: new Date().toISOString(),
    });

    alert("Signup successful!");

    // Redirect based on role
    if (role === "admin") {
      window.location.href = "/MentroPay/src/Admin.html";
    } else {
      window.location.href = "/MentroPay/src/Mentor.html";
    }
  } catch (error) {
    alert("Signup Failed: " + error.message);
  }
});

// Login Form Handler
document.getElementById("loginForm")?.addEventListener("submit", async (e) => {
  e.preventDefault();
  const email = document.getElementById("loginEmail").value;
  const password = document.getElementById("loginPassword").value;
  const selectedRole = document.getElementById("loginRole").value; // Get selected role

  try {
    const userCredential = await signInWithEmailAndPassword(
      auth,
      email,
      password
    );
    const uid = userCredential.user.uid;

    // Check if user exists in the selected role
    const userRoleRef = ref(db, `${selectedRole}/${uid}`);
    const snapshot = await get(userRoleRef);

    if (snapshot.exists()) {
      // User exists in the selected role
      if (selectedRole === "admin") {
        alert("Admin login successful!");
        window.location.href = "/MentroPay/src/Admin.html";
      } else {
        alert("Mentor login successful!");
        window.location.href = "/MentroPay/src/Mentor.html";
      }
    } else {
      alert(
        "You don't have access as " +
          selectedRole +
          ". Please select the correct role."
      );
      auth.signOut(); // Sign out if wrong role selected
    }
  } catch (error) {
    alert("Login Failed: " + error.message);
  }
});
