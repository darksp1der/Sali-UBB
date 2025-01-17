import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm';

const supabaseUrl = 'https://nsufyifcoqdqxjotgzhe.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5zdWZ5aWZjb3FkcXhqb3RnemhlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzY1ODgyMTUsImV4cCI6MjA1MjE2NDIxNX0.2w2idoewRtMZZXdt1p5kRmMgUa40H9byEO2OoahHA1c';
const supabase = createClient(supabaseUrl, supabaseKey);

document.addEventListener("DOMContentLoaded", async () => {
  // DOM Elements
  const loginContainer = document.getElementById("login-container");
  const signupContainer = document.getElementById("signup-container");
  const plannerContainer = document.getElementById("planner-container");
  const loginForm = document.getElementById("login-form");
  const signupForm = document.getElementById("signup-form");
  const createAccountLink = document.getElementById("create-account-link");
  const loginLink = document.getElementById("login-link");
  const logoutButton = document.getElementById("logout-button");
  const reservationForm = document.getElementById("reservation-form");
  const roomSelect = document.getElementById("room-select");
  const dateInput = document.getElementById("reservation-date");
  const startTimeSelect = document.getElementById("start-time");
  const endTimeSelect = document.getElementById("end-time");
  const reservationsList = document.getElementById("reservation-items");

  // Set minimum date for reservation
  const today = new Date().toISOString().split('T')[0];
  dateInput.setAttribute("min", today);

  // Helper: Validate UBB Email
  function validateUBBEmail(email) {
    const validDomains = ['@ubbcluj.ro', '@stud.ubbcluj.ro']; // Added @stud.ubbcluj.ro
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) return false;
    return validDomains.some(domain => email.toLowerCase().endsWith(domain));
  }

  // Helper: Check if user is superuser
  function isSuperuser(email) {
    return email.toLowerCase().endsWith("@ubbcluj.ro");
  }

  // Handle Signup
  signupForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const email = document.getElementById("signup-email").value.trim();
    const password = document.getElementById("signup-password").value.trim();
    const confirmPassword = document.getElementById("signup-confirm-password").value.trim();

    if (!validateUBBEmail(email)) {
      alert("Please use a valid UBB email address.");
      return;
    }

    if (password !== confirmPassword) {
      alert("Passwords do not match.");
      return;
    }

    try {
      const { data, error } = await supabase.from('accounts').insert([{ email, password }]);

      if (error) {
        console.error("Error creating account:", error.message);
        alert("Error creating account. Please try again.");
        return;
      }

      alert("Account created successfully!");
      signupContainer.style.display = "none";
      loginContainer.style.display = "block";
    } catch (err) {
      console.error("Unexpected error:", err.message);
      alert("An error occurred. Please try again.");
    }
  });

  // Handle Login
  loginForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value.trim();

    if (!validateUBBEmail(email)) {
      alert("Please use a valid UBB email address.");
      return;
    }

    try {
      const { data, error } = await supabase
        .from('accounts')
        .select("*")
        .eq('email', email)
        .eq('password', password);

      if (error) {
        console.error("Error during login:", error.message);
        alert("Login failed. Please try again.");
        return;
      }

      if (data.length === 0) {
        alert("Invalid email or password.");
        return;
      }

      const user = data[0];
      sessionStorage.setItem("user_id", user.id); // Store user ID for reservation management
      sessionStorage.setItem("user_email", email); // Store user email to check superuser status

      alert("Login successful!");
      loginContainer.style.display = "none";
      plannerContainer.style.display = "block";
      logoutButton.style.display = "block"; // Show logout button on login
      logoutButton.style.position = "absolute"; // Ensure it doesn't move with other elements

      await populateRoomDropdown();
    } catch (err) {
      console.error("Unexpected error during login:", err.message);
      alert("An error occurred. Please try again.");
    }
  });

  // Handle Logout
  logoutButton.addEventListener("click", () => {
    sessionStorage.clear(); // Clear session data
    logoutButton.style.display = "none"; // Hide logout button
    plannerContainer.style.display = "none"; // Hide planner container
    loginContainer.style.display = "block"; // Show login container
    alert("Logged out successfully!");
  });

  // Populate Room Dropdown
  async function fetchRooms() {
    try {
      const { data, error } = await supabase.from('rooms').select('name');
      if (error) {
        console.error('Error fetching rooms:', error.message);
        return [];
      }
      return data;
    } catch (err) {
      console.error('Unexpected error fetching rooms:', err.message);
      return [];
    }
  }

  async function populateRoomDropdown() {
    const rooms = await fetchRooms();
    roomSelect.innerHTML = `<option value="">Choose a Room</option>`;
    rooms.forEach(room => {
      const option = document.createElement("option");
      option.value = room.name;
      option.textContent = room.name;
      roomSelect.appendChild(option);
    });

    // Display reservations when a room is selected
    roomSelect.addEventListener("change", displayReservations);
  }

  // Populate Time Dropdowns for 24 Hours
  function populateTimeDropdown(selectElement) {
    for (let hour = 0; hour < 24; hour++) {
      for (let minutes = 0; minutes < 60; minutes += 15) {
        const timeString = `${String(hour).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
        const option = document.createElement("option");
        option.value = timeString;
        option.textContent = timeString;
        selectElement.appendChild(option);
      }
    }
  }

  // Display All Reservations
  async function displayReservations() {
    const selectedRoom = roomSelect.value;
    reservationsList.innerHTML = "";

    if (!selectedRoom) {
      reservationsList.innerHTML = "<p>Please select a room to view reservations.</p>";
      return;
    }

    try {
      const { data, error } = await supabase.from('reservations').select('*').eq('room_name', selectedRoom);

      if (error) {
        console.error('Error fetching reservations:', error.message);
        reservationsList.innerHTML = "<p>Failed to load reservations.</p>";
        return;
      }

      if (data.length === 0) {
        reservationsList.innerHTML = "<p>No reservations for this room.</p>";
        return;
      }

      data.forEach(reservation => {
        const isSuperUser = isSuperuser(sessionStorage.getItem("user_email"));
        const listItem = document.createElement("li");
        listItem.innerHTML = `
          ${reservation.reservation_date} | ${reservation.start_time} - ${reservation.end_time}
          ${(isSuperUser || reservation.user_id === sessionStorage.getItem("user_id")) ? `<button class="delete-btn" data-id="${reservation.id}">X</button>` : ''}
        `;
        reservationsList.appendChild(listItem);
      });

      // Attach delete event only to buttons for authorized users
      document.querySelectorAll(".delete-btn").forEach((btn) =>
        btn.addEventListener("click", deleteReservation)
      );
    } catch (err) {
      console.error("Unexpected error displaying reservations:", err.message);
      reservationsList.innerHTML = "<p>An error occurred. Please try again.</p>";
    }
  }

  // Handle Reservations
  reservationForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const selectedRoom = roomSelect.value;
    const reservationDate = dateInput.value;
    const startTime = startTimeSelect.value;
    const endTime = endTimeSelect.value;
    const userId = sessionStorage.getItem("user_id"); // Retrieve user ID

    if (!userId) {
      alert("User not authenticated. Please log in again.");
      return;
    }

    const currentDate = new Date();
    const selectedDateTime = new Date(`${reservationDate}T${startTime}`);

    if (selectedDateTime < currentDate) {
      alert("You cannot select a past date or time.");
      return;
    }

    if (new Date(`${reservationDate}T${endTime}`) <= selectedDateTime) {
      alert("End time must be after start time.");
      return;
    }

    const durationInHours = (new Date(`${reservationDate}T${endTime}`) - selectedDateTime) / (1000 * 60 * 60);
    if (durationInHours > 4) {
      alert("Reservations cannot exceed 4 hours.");
      return;
    }

    // Check for overlapping reservations
    try {
      const { data: overlappingReservations, error } = await supabase
        .from('reservations')
        .select('*')
        .eq('room_name', selectedRoom)
        .eq('reservation_date', reservationDate);

      if (error) {
        console.error('Error checking overlapping reservations:', error.message);
        alert("An error occurred while checking availability. Please try again.");
        return;
      }

      const isOverlapping = overlappingReservations.some(reservation => {
        const existingStart = new Date(`${reservation.reservation_date}T${reservation.start_time}`);
        const existingEnd = new Date(`${reservation.reservation_date}T${reservation.end_time}`);
        const newStart = new Date(`${reservationDate}T${startTime}`);
        const newEnd = new Date(`${reservationDate}T${endTime}`);

        return (
          (newStart < existingEnd && newEnd > existingStart) || // Overlapping start or end
          (newStart >= existingStart && newEnd <= existingEnd) // Fully within an existing reservation
        );
      });

      if (isOverlapping) {
        alert("The selected room is already reserved during the specified time. Please choose a different time.");
        return;
      }

      // Insert reservation into Supabase
      const { data, error: insertError } = await supabase.from('reservations').insert([
        {
          room_name: selectedRoom,
          reservation_date: reservationDate,
          start_time: startTime,
          end_time: endTime,
          user_id: userId,
        },
      ]);

      if (insertError) {
        console.error('Error saving reservation:', insertError.message);
        alert("Failed to save the reservation.");
        return;
      }

      alert("Reservation saved successfully!");
      dateInput.value = "";
      startTimeSelect.value = "";
      endTimeSelect.value = "";
      displayReservations();
    } catch (err) {
      console.error("Unexpected error:", err.message);
      alert("An error occurred. Please try again.");
    }
  });

  // Delete Reservation
  async function deleteReservation(e) {
    const reservationId = e.target.getAttribute("data-id");

    try {
      const { error } = await supabase.from('reservations').delete().eq('id', reservationId);

      if (error) {
        console.error('Error deleting reservation:', error.message);
        alert("Failed to delete the reservation.");
        return;
      }

      alert("Reservation deleted successfully!");
      displayReservations();
    } catch (err) {
      console.error("Unexpected error deleting reservation:", err.message);
      alert("An error occurred. Please try again.");
    }
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

  // Hide Logout Button Initially
  logoutButton.style.display = "none";

  await populateRoomDropdown();
  populateTimeDropdown(startTimeSelect);
  populateTimeDropdown(endTimeSelect);
});
