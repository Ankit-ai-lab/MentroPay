// firebase-init.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.7.3/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/11.7.3/firebase-auth.js";
import { getDatabase } from "https://www.gstatic.com/firebasejs/11.7.3/firebase-database.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/11.7.3/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyBv6G9ozFaLwOM2uOBEe4P8e8mOn2DJjmQ",
  authDomain: "mentropay-38347.firebaseapp.com",
  projectId: "mentropay-38347",
  databaseURL: "https://mentropay-38347-default-rtdb.firebaseio.com",
  storageBucket: "mentropay-38347.appspot.com",
  messagingSenderId: "1047505078291",
  appId: "1:1047505078291:web:34d46ffbaab9f84d4597e6"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getDatabase(app);
const firestore = getFirestore(app);

// Enable persistence for offline support
auth.setPersistence('local');

export { auth, db, firestore };
