import { initializeApp } from "https://www.gstatic.com/firebasejs/12.12.1/firebase-app.js";

import { 
  getAuth 
} from "https://www.gstatic.com/firebasejs/12.12.1/firebase-auth.js";

import { 
  getFirestore 
} from "https://www.gstatic.com/firebasejs/12.12.1/firebase-firestore.js";

//  Firebase Configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "",
  authDomain: " ",
  databaseURL: " ",
  projectId: " ",
  storageBucket: " ",
  messagingSenderId: " ",
  appId: " ",
  measurementId: " "
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Firebase Services
const auth = getAuth(app);
const db = getFirestore(app);

//  Export Services
export { auth, db };