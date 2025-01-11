document.addEventListener("DOMContentLoaded", () => {
  const loginContainer = document.getElementById("login-container");
  const signupContainer = document.getElementById("signup-container");
  const plannerContainer = document.getElementById("planner-container");
  const loginForm = document.getElementById("login-form");
  const signupForm = document.getElementById("signup-form");
  const reservationForm = document.getElementById("reservation-form");
  const createAccountLink = document.getElementById("create-account-link");
  const loginLink = document.getElementById("login-link");
  const roomSelect = document.getElementById("room-select");
  const startTimeInput = document.getElementById("start-time");
  const endTimeInput = document.getElementById("end-time");
  const reservationsList = document.getElementById("reservation-items");

  // Define room options
  const rooms = [
    "A300", "A301", "A302", "A303", "A304",
    "A305", "A306", "A307", "A308", "A309",
    "A310", "A311", "A312", "A313", "A314",
    "A315", "A316", "A317", "A318", "A319", "A320"
  ];

  // Populate the room dropdown
  rooms.forEach((room) => {
    const option = document.createElement("option");
    option.value = room;
    option.textContent = room;
    roomSelect.appendChild(option);
  });

  // Function to validate UBB email addresses
  function validateUBBEmail(email) {
    const validDomains = ["@ubbcluj.ro", "@stud.ubbcluj.ro"];
    return validDomains.some((domain) => email.toLowerCase().endsWith(domain));
  }

  // Signup form submission
  signupForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const email = document.getElementById("signup-email").value;
    const password = document.getElementById("signup-password").value;
    const confirmPassword = document.getElementById("signup-confirm-password").value;

    if (!validateUBBEmail(email)) {
      alert("Please use a valid UBB email address (@ubbcluj.ro or @stud.ubbcluj.ro)");
      return;
    }

    if (password !== confirmPassword) {
      alert("Passwords do not match!");
      return;
    }

    try {
      const response = await fetch("http://localhost:5000/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();
      if (response.ok) {
        alert(data.message);
        signupContainer.style.display = "none";
        loginContainer.style.display = "block";
      } else {
        alert(data.message);
      }
    } catch (err) {
      console.error("Signup error:", err);
      alert("An error occurred during signup.");
    }
  });

  // Login form submission
  loginForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;

    if (!validateUBBEmail(email)) {
      alert("Please use a valid UBB email address (@ubbcluj.ro or @stud.ubbcluj.ro)");
      return;
    }

    try {
      const response = await fetch("http://localhost:5000/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();
      if (response.ok) {
        alert(data.message);
        localStorage.setItem("userId", data.userId); // Store user ID for authenticated actions
        loginContainer.style.display = "none";
        plannerContainer.style.display = "block";
        displayReservations(); // Load reservations after login
      } else {
        alert("Login failed. Please check your credentials.");
      }
    } catch (err) {
      console.error("Login error:", err);
      alert("An error occurred during login.");
    }
  });

  // Reservation form submission
  reservationForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const selectedRoom = roomSelect.value;
    const startTime = startTimeInput.value;
    const endTime = endTimeInput.value;
    const userId = localStorage.getItem("userId");

    if (!userId) {
      alert("You must be logged in to make a reservation.");
      return;
    }

    if (!selectedRoom) {
      alert("Please select a room.");
      return;
    }

    if (new Date(`1970-01-01T${endTime}`) <= new Date(`1970-01-01T${startTime}`)) {
      alert("End time must be after start time.");
      return;
    }

    try {
      const response = await fetch("http://localhost:5000/api/reservations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ room: selectedRoom, startTime, endTime, userId }),
      });

      const data = await response.json();
      if (response.ok) {
        alert("Reservation added successfully!");
        displayReservations(); // Reload reservations
        startTimeInput.value = "";
        endTimeInput.value = "";
      } else {
        alert(data.message);
      }
    } catch (err) {
      console.error("Reservation error:", err);
      alert("An error occurred while adding the reservation.");
    }
  });

  async function displayReservations() {
    const userId = localStorage.getItem("userId");
    const selectedRoom = roomSelect.value;
    reservationsList.innerHTML = "";

    if (!userId) {
      alert("You must be logged in to view reservations.");
      return;
    }

    if (!selectedRoom) {
      reservationsList.innerHTML = "<p>Please select a room to view reservations.</p>";
      return;
    }

    try {
      const response = await fetch(
        `http://localhost:5000/api/reservations?room=${selectedRoom}&userId=${userId}`
      );

      const reservations = await response.json();

      if (reservations.length === 0) {
        reservationsList.innerHTML = "<p>No reservations for this room.</p>";
        return;
      }

      reservations.forEach((reservation, index) => {
        const listItem = document.createElement("li");
        listItem.className = "reservation-item";
        listItem.innerHTML = `
          ${reservation.startTime} - ${reservation.endTime}
          <button class="delete-btn" data-id="${reservation._id}">X</button>
        `;
        reservationsList.appendChild(listItem);
      });

      document.querySelectorAll(".delete-btn").forEach((btn) =>
        btn.addEventListener("click", deleteReservation)
      );
    } catch (err) {
      console.error("Fetch reservations error:", err);
      reservationsList.innerHTML = "<p>Error loading reservations.</p>";
    }
  }

  async function deleteReservation(e) {
    const userId = localStorage.getItem("userId");
    const reservationId = e.target.getAttribute("data-id");

    if (!userId) {
      alert("You must be logged in to delete a reservation.");
      return;
    }

    try {
      const response = await fetch(
        `http://localhost:5000/api/reservations/${reservationId}`,
        { method: "DELETE" }
      );

      if (response.ok) {
        alert("Reservation deleted successfully.");
        displayReservations();
      } else {
        alert("Failed to delete reservation.");
      }
    } catch (err) {
      console.error("Delete reservation error:", err);
      alert("An error occurred while deleting the reservation.");
    }
  }

  // Display reservations when the page loads
  displayReservations();
});
