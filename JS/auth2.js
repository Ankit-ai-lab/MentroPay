// Optional - protect admin.html
import { auth } from "./firebase-init.js";
auth.onAuthStateChanged((user) => {
  if (!user) {
    window.location.href = "/login.html";
  }
});
