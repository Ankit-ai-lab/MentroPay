import { db, auth } from "/firebase-config.js";
import {
  collection,
  query,
  where,
  orderBy,
  onSnapshot,
  addDoc,
  serverTimestamp,
  signOut,
} from "https://www.gstatic.com/firebasejs/9.6.1/firebase-firestore.js";

const userId = localStorage.getItem("mentorId");

const sessionTable = document.querySelector("#mentor-session-table tbody");
const totalDisplay = document.getElementById("mentor-total");
const chatWindow = document.getElementById("chat-window");
const chatForm = document.getElementById("chat-form");
const chatInput = document.getElementById("chat-input");
const filterDropdown = document.getElementById("mentor-filter");
const customRange = document.getElementById("mentor-custom-range");
const startDateInput = document.getElementById("mentor-start-date");
const endDateInput = document.getElementById("mentor-end-date");
const logoutBtn = document.getElementById("logout");

logoutBtn.addEventListener("click", () => {
  signOut(auth).then(() => {
    window.location.href = "/index.html";
  });
});

filterDropdown.addEventListener("change", () => {
  customRange.style.display =
    filterDropdown.value === "custom" ? "block" : "none";
});

// Load mentor sessions

function loadSessions(days = 7) {
  sessionTable.innerHTML = "";
  let q = query(
    collection(db, "sessions"),
    where("mentorId", "==", userId),
    orderBy("date", "desc")
  );

  onSnapshot(q, (snapshot) => {
    let total = 0;
    sessionTable.innerHTML = "";
    snapshot.forEach((doc) => {
      const data = doc.data();
      const row = document.createElement("tr");
      const sessionTotal = data.duration * data.rate;
      total += sessionTotal;
      row.innerHTML = `
        <td>${new Date(data.date.toDate()).toLocaleDateString()}</td>
        <td>${data.type}</td>
        <td>${data.duration} hr</td>
        <td>₹${data.rate}</td>
        <td>₹${sessionTotal}</td>
        <td><span class="badge ${data.status.toLowerCase()}">${
        data.status
      }</span></td>
      `;
      sessionTable.appendChild(row);
    });
    totalDisplay.textContent = `Total Payout: ₹${total}`;
  });
}

loadSessions();

// Chat logic
chatForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  if (!chatInput.value.trim()) return;
  await addDoc(collection(db, "chats"), {
    sender: "Mentor",
    userId,
    message: chatInput.value,
    timestamp: serverTimestamp(),
  });
  chatInput.value = "";
});

onSnapshot(
  query(collection(db, "chats"), orderBy("timestamp", "asc")),
  (snapshot) => {
    chatWindow.innerHTML = "";
    snapshot.forEach((doc) => {
      const msg = doc.data();
      if (msg.userId === userId || msg.sender === "Admin") {
        const div = document.createElement("div");
        div.className = `message ${msg.sender.toLowerCase()}`;
        div.innerHTML = `
          <span class="sender">${msg.sender}</span>
          <p>${msg.message}</p>
          <span class="timestamp">${new Date(
            msg.timestamp?.toDate()
          ).toLocaleTimeString()}</span>
        `;
        chatWindow.appendChild(div);
        chatWindow.scrollTop = chatWindow.scrollHeight;
      }
    });
  }
);

// Hamburger menu toggle
const hamburger = document.getElementById("hamburger");
const sidebar = document.getElementById("sidebar-menu");

if (hamburger && sidebar) {
  hamburger.addEventListener("click", () => {
    console.log("Hamburger clicked");
    sidebar.classList.toggle("hidden");
  });
} else {
  console.warn("Hamburger or sidebar not found");
}
