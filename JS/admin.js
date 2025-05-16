// Firebase setup (replace with your actual config)
// Firebase Initialization

import { initializeApp } from "https://www.gstatic.com/firebasejs/11.7.3/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/11.7.3/firebase-analytics.js";

const firebaseConfig = {
  apiKey: "AIzaSyBv6G9ozFaLwOM2uOBEe4P8e8mOn2DJjmQ",
  authDomain: "mentropay-38347.firebaseapp.com",
  projectId: "mentropay-38347",
  storageBucket: "mentropay-38347.firebasestorage.app",
  messagingSenderId: "1047505078291",
  appId: "1:1047505078291:web:34d46ffbaab9f84d4597e6",
  measurementId: "G-QGJ2TN84VH",
};

firebase.initializeApp(firebaseConfig);
const db = firebase.database();
const sessionRef = db.ref("sessions");
const chatRef = db.ref("chats");

// Add Session Data
const sessionForm = document.getElementById("session-form");
sessionForm.addEventListener("submit", (e) => {
  e.preventDefault();
  const mentorName = document.getElementById("mentor-name").value;
  const sessionType = document.getElementById("session-type").value;
  const duration = parseFloat(document.getElementById("duration").value);
  const rate = parseFloat(document.getElementById("rate").value);
  const payout = duration * rate;

  const newSession = {
    mentorName,
    sessionType,
    duration,
    rate,
    payout,
    status: "Pending",
    timestamp: Date.now(),
  };
  sessionRef.push(newSession);
  sessionForm.reset();
});

// Render Sessions in Table
sessionRef.on("child_added", (snapshot) => {
  const data = snapshot.val();
  const tbody = document.querySelector("#session-table tbody");
  const row = document.createElement("tr");
  row.innerHTML = `
    <td>${data.mentorName}</td>
    <td>${data.sessionType}</td>
    <td>${data.duration} hrs</td>
    <td>₹${data.rate}/hr</td>
    <td>₹${data.payout.toFixed(2)}</td>
    <td><span class="badge ${getStatusBadge(data.status)}">${
    data.status
  }</span></td>
  `;
  tbody.appendChild(row);
  calculateTotalPayout();
});

function getStatusBadge(status) {
  switch (status.toLowerCase()) {
    case "paid":
      return "paid";
    case "pending":
      return "pending";
    case "under review":
      return "review";
    default:
      return "unknown";
  }
}

function calculateTotalPayout() {
  let total = 0;
  const rows = document.querySelectorAll("#session-table tbody tr");
  rows.forEach((row) => {
    const totalCell = row.querySelector("td:nth-child(5)");
    if (totalCell) {
      const amount = parseFloat(totalCell.textContent.replace("₹", "").trim());
      if (!isNaN(amount)) total += amount;
    }
  });
  document.querySelector(
    ".total-display"
  ).textContent = `Total Payout: ₹${total.toFixed(2)}`;
}

// Chat Functionality
const chatTextarea = document.getElementById("chat-textarea");
const sendBtn = document.getElementById("send-btn");
const chatWindow = document.getElementById("chat-window");

sendBtn.addEventListener("click", () => {
  const msg = chatTextarea.value.trim();
  if (msg !== "") {
    const chatData = {
      sender: "Admin",
      message: msg,
      timestamp: Date.now(),
    };
    chatRef.push(chatData);
    chatTextarea.value = "";
  }
});

chatRef.on("child_added", (snapshot) => {
  const data = snapshot.val();
  displayMessage(data);
});

function displayMessage({ sender, message, timestamp }) {
  const div = document.createElement("div");
  div.classList.add("message");
  div.classList.add(sender.toLowerCase());
  div.innerHTML = `
    <span class="sender">${sender}</span>: ${message}
    <span class="timestamp">${new Date(timestamp).toLocaleString()}</span>
  `;
  chatWindow.appendChild(div);
  chatWindow.scrollTop = chatWindow.scrollHeight;
}
