<script type="module">
  // Import the functions you need from the SDKs you need
  import { initializeApp } from "https://www.gstatic.com/firebasejs/11.7.3/firebase-app.js";
  import { getAnalytics } from "https://www.gstatic.com/firebasejs/11.7.3/firebase-analytics.js";
  // TODO: Add SDKs for Firebase products that you want to use
  // https://firebase.google.com/docs/web/setup#available-libraries

  // Your web app's Firebase configuration
  // For Firebase JS SDK v7.20.0 and later, measurementId is optional
  const firebaseConfig = {
    apiKey: "AIzaSyBv6G9ozFaLwOM2uOBEe4P8e8mOn2DJjmQ",
    authDomain: "mentropay-38347.firebaseapp.com",
    databaseURL: "https://mentropay-38347-default-rtdb.firebaseio.com",
    projectId: "mentropay-38347",
    storageBucket: "mentropay-38347.firebasestorage.app",
    messagingSenderId: "1047505078291",
    appId: "1:1047505078291:web:34d46ffbaab9f84d4597e6",
    measurementId: "G-QGJ2TN84VH"
  };

  // Initialize Firebase
  const app = initializeApp(firebaseConfig);
  const analytics = getAnalytics(app);
</script>