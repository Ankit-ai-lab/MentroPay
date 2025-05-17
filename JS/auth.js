import { auth, db } from "./firebase-init.js";
import {
  signInWithEmailAndPassword
} from "https://www.gstatic.com/firebasejs/11.7.3/firebase-auth.js";
import { ref, get } from "https://www.gstatic.com/firebasejs/11.7.3/firebase-database.js";

document.getElementById("loginForm")?.addEventListener("submit", async (e) => {
  e.preventDefault();
  const email = document.getElementById("loginEmail").value;
  const password = document.getElementById("loginPassword").value;

  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const uid = userCredential.user.uid;

    // ✅ Securely find user role from Firebase DB
    let roleFound = null;
    const rolesToCheck = ["mentor", "admin"]; // use lowercase consistently

    for (let role of rolesToCheck) {
      const snapshot = await get(ref(db, `${role}/${uid}`));
      if (snapshot.exists()) {
        roleFound = role;
        break;
      }
    }

    if (roleFound === "admin") {
      alert("Admin login successful!");
      window.location.href = "/src/Admin.html";
    } else if (roleFound === "mentor") {
      alert("Mentor login successful!");
      window.location.href = "/src/Mentor.html";
    } else {
      alert("Role not assigned. Contact support.");
    }
  } catch (error) {
    alert("Login Failed: " + error.message);
  }
});
