import { db, auth } from "./firebase.js";

import {
  collection,
  addDoc,
  getDocs
} from "https://www.gstatic.com/firebasejs/12.12.1/firebase-firestore.js";

import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  signOut
} from "https://www.gstatic.com/firebasejs/12.12.1/firebase-auth.js";

let currentUser = null;
let isRegisterMode = false;

// ================= LOGIN =================
function login() {
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;

  signInWithEmailAndPassword(auth, email, password)
    .then(() => {
      alert("Login Successful");
      window.location.href = "dashboard.html";
    })
    .catch((error) => {
      alert(error.message);
    });
}

// ================= REGISTER =================
function register() {
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;

  createUserWithEmailAndPassword(auth, email, password)
    .then(() => {
      alert("Account Created Successfully!");
      toggleMode(false);
    })
    .catch((error) => {
      alert(error.message);
    });
}

// ================= TOGGLE LOGIN/SIGNUP =================
function toggleMode(register) {
  isRegisterMode = register;

  const button = document.querySelector("#loginForm button");
  const title = document.querySelector(".app-title");
  const link = document.getElementById("signUpLink");

  if (!button || !title || !link) return;

  if (isRegisterMode) {
    button.textContent = "Sign Up";
    title.textContent = "Create Account";
    link.textContent = "Already have an account? Log in";
  } else {
    button.textContent = "Log In";
    title.textContent = "Attendance App";
    link.textContent = "Create New Account";
  }
}

// ================= CHECK TODAY ATTENDANCE =================
async function checkTodayAttendance() {
  if (!currentUser) return;

  const today = new Date().toDateString();

  let hasCheckedIn = false;
  let hasCheckedOut = false;
  let checkInTime = null;
  let checkOutTime = null;
  const entries = [];

  const querySnapshot = await getDocs(collection(db, "attendance"));

  querySnapshot.forEach((doc) => {
    const data = doc.data();

    if (data.userId !== currentUser.uid) return;

    const recordDate = new Date(data.time).toDateString();

    if (recordDate === today) {
      entries.push(data);

      if (data.type === "check-in") {
        hasCheckedIn = true;
        checkInTime = data.time;
      }

      if (data.type === "check-out") {
        hasCheckedOut = true;
        checkOutTime = data.time;
      }
    }
  });

  updateUI(hasCheckedIn, hasCheckedOut, checkInTime, checkOutTime);
  displayAttendanceLog(entries);
}

// ================= UPDATE UI =================
function updateUI(hasIn, hasOut, inTime, outTime) {
  const checkInBtn = document.getElementById("checkInBtn");
  const checkOutBtn = document.getElementById("checkOutBtn");
  const statusText = document.getElementById("statusText");
  const statusDisplay = document.getElementById("statusDisplay");

  if (!checkInBtn || !checkOutBtn) return;

  if (hasIn && !hasOut) {
    checkInBtn.disabled = true;
    checkOutBtn.disabled = false;
    statusText.textContent = "Checked In ✓";
    statusDisplay.className = "status-badge checked-in";
  } else if (hasIn && hasOut) {
    checkInBtn.disabled = true;
    checkOutBtn.disabled = true;
    statusText.textContent = "Checked Out ✓";
    statusDisplay.className = "status-badge checked-out";
  } else {
    checkInBtn.disabled = false;
    checkOutBtn.disabled = true;
    statusText.textContent = "Not Checked In";
    statusDisplay.className = "status-badge";
  }

  if (inTime) {
    document.getElementById("checkInTime").style.display = "block";
    document.getElementById("checkInTimeValue").textContent = new Date(inTime).toLocaleString();
  }

  if (outTime) {
    document.getElementById("checkOutTime").style.display = "block";
    document.getElementById("checkOutTimeValue").textContent = new Date(outTime).toLocaleString();
  }
}

// ================= DISPLAY LOG =================
function displayAttendanceLog(entries) {
  const attendanceLog = document.getElementById("attendanceLog");

  if (!attendanceLog) return;

  if (entries.length === 0) {
    attendanceLog.innerHTML = '<p class="no-data">No records yet</p>';
    return;
  }

  attendanceLog.innerHTML = entries
    .map((entry) => {
      const type = entry.type === "check-in" ? "✓ Check In" : "✗ Check Out";
      return `
        <div class="log-entry ${entry.type}">
          <span>${type}</span>
          <span>${new Date(entry.time).toLocaleString()}</span>
        </div>
      `;
    })
    .join("");
}

// ================= DOM LOAD =================
window.addEventListener("DOMContentLoaded", () => {
  const loginForm = document.getElementById("loginForm");
  const signUpLink = document.getElementById("signUpLink");

  if (loginForm) {
    loginForm.addEventListener("submit", (e) => {
      e.preventDefault();
      isRegisterMode ? register() : login();
    });
  }

  if (signUpLink) {
    signUpLink.addEventListener("click", (e) => {
      e.preventDefault();
      toggleMode(!isRegisterMode);
    });
  }

  // AUTH STATE
  onAuthStateChanged(auth, (user) => {
    if (user) {
      currentUser = user;

      const emailSpan = document.getElementById("userEmail");
      if (emailSpan) emailSpan.textContent = user.email;

      checkTodayAttendance();
    } else {
      if (window.location.pathname.includes("dashboard.html")) {
        window.location.href = "index.html";
      }
    }
  });

  // CHECK IN
  const checkInBtn = document.getElementById("checkInBtn");
  if (checkInBtn) {
    checkInBtn.addEventListener("click", async () => {
      const now = new Date();

      await addDoc(collection(db, "attendance"), {
        type: "check-in",
        time: now.toISOString(),
        userId: currentUser.uid
      });

      checkTodayAttendance();
    });
  }

  // CHECK OUT
  const checkOutBtn = document.getElementById("checkOutBtn");
  if (checkOutBtn) {
    checkOutBtn.addEventListener("click", async () => {
      const now = new Date();

      await addDoc(collection(db, "attendance"), {
        type: "check-out",
        time: now.toISOString(),
        userId: currentUser.uid
      });

      checkTodayAttendance();
    });
  }

  // LOGOUT
  const logoutBtn = document.getElementById("logoutBtn");
  if (logoutBtn) {
    logoutBtn.addEventListener("click", async () => {
      await signOut(auth);
      window.location.href = "index.html";
    });
  }
});