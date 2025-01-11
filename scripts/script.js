document.addEventListener("DOMContentLoaded", () => {
  const loginContainer = document.getElementById("login-container");
  const signupContainer = document.getElementById("signup-container");
  const plannerContainer = document.getElementById("planner-container");
  const loginForm = document.getElementById("login-form");
  const signupForm = document.getElementById("signup-form");
  const createAccountLink = document.getElementById("create-account-link");
  const loginLink = document.getElementById("login-link");
  const reservationForm = document.getElementById("reservation-form");
  const roomSelect = document.getElementById("room-select");
  const startTimeInput = document.getElementById("start-time");
  const endTimeInput = document.getElementById("end-time");
  const reservationsList = document.getElementById("reservation-items");

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

  // Validate UBB email
  function validateUBBEmail(email) {
    const validDomains = ["@ubbcluj.ro", "@stud.ubbcluj.ro"];
    return validDomains.some((domain) => email.toLowerCase().endsWith(domain));
  }

  function validateTimeInterval(time) {
    const [hours, minutes] = time.split(":").map(Number);
    return minutes % 15 === 0; // Ensures the minutes are in multiples of 15
  }

  createAccountLink.addEventListener("click", (e) => {
    e.preventDefault();
    loginContainer.style.display = "none";
    signupContainer.style.display = "block";
  });

  loginLink.addEventListener("click", (e) => {
    e.preventDefault();
    signupContainer.style.display = "none";
    loginContainer.style.display = "block";
  });

  loginForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;

    if (!validateUBBEmail(email)) {
      alert("Please use a valid UBB email address (@ubbcluj.ro or @stud.ubbcluj.ro)");
      return;
    }

    console.log("Login attempted with:", { email, password });

    loginContainer.style.display = "none";
    plannerContainer.style.display = "block";
    displayReservations(); // Show reservations after login
  });

  signupForm.addEventListener("submit", (e) => {
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

    console.log("Account creation attempted with:", { email, password });

    signupContainer.style.display = "none";
    plannerContainer.style.display = "block";
    displayReservations(); // Show reservations after signup
  });

  roomSelect.addEventListener("change", displayReservations);

  reservationForm.addEventListener("submit", (e) => {
    e.preventDefault();

    const selectedRoom = roomSelect.value;
    const startTime = startTimeInput.value;
    const endTime = endTimeInput.value;

    if (!selectedRoom) {
      alert("Please select a room.");
      return;
    }

    if (!validateTimeInterval(startTime) || !validateTimeInterval(endTime)) {
      alert("Start and end times must be in multiples of 15 minutes (e.g., 12:00, 12:15).");
      return;
    }

    if (new Date(`1970-01-01T${endTime}`) <= new Date(`1970-01-01T${startTime}`)) {
      alert("End time must be after start time.");
      return;
    }

    let reservations = JSON.parse(localStorage.getItem(`reservations_${selectedRoom}`)) || [];

    if (
      reservations.some(
        (reservation) =>
          !(
            new Date(`1970-01-01T${endTime}`) <= new Date(`1970-01-01T${reservation.start}`) ||
            new Date(`1970-01-01T${startTime}`) >= new Date(`1970-01-01T${reservation.end}`)
          )
      )
    ) {
      alert("This reservation conflicts with an existing reservation.");
      return;
    }

    const newReservation = { start: startTime, end: endTime };
    reservations.push(newReservation);
    reservations.sort((a, b) => new Date(`1970-01-01T${a.start}`) - new Date(`1970-01-01T${b.start}`));

    localStorage.setItem(`reservations_${selectedRoom}`, JSON.stringify(reservations));
    displayReservations();

    startTimeInput.value = "";
    endTimeInput.value = "";
  });

  function displayReservations() {
    const selectedRoom = roomSelect.value;
    reservationsList.innerHTML = "";

    if (!selectedRoom) {
      reservationsList.innerHTML = "<p>Please select a room to view reservations.</p>";
      return;
    }

    const reservations = JSON.parse(localStorage.getItem(`reservations_${selectedRoom}`)) || [];

    if (reservations.length === 0) {
      reservationsList.innerHTML = "<p>No reservations for this room.</p>";
      return;
    }

    reservations.forEach((reservation, index) => {
      const listItem = document.createElement("li");
      listItem.className = "reservation-item";
      listItem.innerHTML = `
        ${reservation.start} - ${reservation.end}
        <button class="delete-btn" data-index="${index}" data-room="${selectedRoom}">X</button>
      `;
      reservationsList.appendChild(listItem);
    });

    document.querySelectorAll(".delete-btn").forEach((btn) =>
      btn.addEventListener("click", deleteReservation)
    );
  }

  function deleteReservation(e) {
    const selectedRoom = e.target.getAttribute("data-room");
    const index = parseInt(e.target.getAttribute("data-index"), 10);

    let reservations = JSON.parse(localStorage.getItem(`reservations_${selectedRoom}`)) || [];
    reservations.splice(index, 1);

    localStorage.setItem(`reservations_${selectedRoom}`, JSON.stringify(reservations));
    displayReservations();
  }

  // Display reservations when the page loads
  displayReservations();
});
