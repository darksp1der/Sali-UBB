import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm';

const supabaseUrl = 'https://nsufyifcoqdqxjotgzhe.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5zdWZ5aWZjb3FkcXhqb3RnemhlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzY1ODgyMTUsImV4cCI6MjA1MjE2NDIxNX0.2w2idoewRtMZZXdt1p5kRmMgUa40H9byEO2OoahHA1c';
const supabase = createClient(supabaseUrl, supabaseKey);

document.addEventListener("DOMContentLoaded", async () => {
  const loginContainer = document.getElementById("login-container");
  const signupContainer = document.getElementById("signup-container");
  const plannerContainer = document.getElementById("planner-container");
  const loginForm = document.getElementById("login-form");
  const signupForm = document.getElementById("signup-form");
  const createAccountLink = document.getElementById("create-account-link");
  const loginLink = document.getElementById("login-link");
  const reservationForm = document.getElementById("reservation-form");
  const roomSelect = document.getElementById("room-select");
  const dateInput = document.getElementById("reservation-date");
  const startTimeSelect = document.getElementById("start-time");
  const endTimeSelect = document.getElementById("end-time");
  const reservationsList = document.getElementById("reservation-items");

  const today = new Date().toISOString().split('T')[0]; // Get today's date in YYYY-MM-DD format
  dateInput.setAttribute("min", today);


  // ** Helper: Validate UBB email **
  function validateUBBEmail(email) {
    const validDomains = ['@ubbcluj.ro', '@stud.ubbcluj.ro'];
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/; // General email format
    if (!emailRegex.test(email)) return false;
    return validDomains.some(domain => email.toLowerCase().endsWith(domain));
  }

  // ** Login Form Submission **
  loginForm.addEventListener("submit", async (e) => {
    e.preventDefault(); // Prevent default form submission behavior

    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value.trim();

    if (!validateUBBEmail(email)) {
      alert("Please use a valid UBB email address (@ubbcluj.ro or @stud.ubbcluj.ro).");
      return;
    }

    // Placeholder for authentication logic
    console.log("Login attempted with:", { email, password });

    // Simulate successful login (adjust this based on your real authentication logic)
    loginContainer.style.display = "none"; // Hide login
    plannerContainer.style.display = "block"; // Show planner
    await populateRoomDropdown(); // Populate the room dropdown
  });

  // ** Signup Form Submission **
  signupForm.addEventListener("submit", async (e) => {
    e.preventDefault(); // Prevent default form submission behavior

    const email = document.getElementById("signup-email").value.trim();
    const password = document.getElementById("signup-password").value.trim();
    const confirmPassword = document.getElementById("signup-confirm-password").value.trim();

    if (!validateUBBEmail(email)) {
      alert("Please use a valid UBB email address (@ubbcluj.ro or @stud.ubbcluj.ro).");
      return;
    }

    if (password !== confirmPassword) {
      alert("Passwords do not match!");
      return;
    }

    // Placeholder for signup logic
    console.log("Account creation attempted with:", { email, password });

    // Simulate successful signup
    signupContainer.style.display = "none"; // Hide signup
    plannerContainer.style.display = "block"; // Show planner
    await populateRoomDropdown(); // Populate the room dropdown
  });

  // ** Populate the Room Dropdown **
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
    rooms.forEach((room) => {
      const option = document.createElement("option");
      option.value = room.name;
      option.textContent = room.name;
      roomSelect.appendChild(option);
    });
  }

  // ** Populate Time Dropdowns for 24 Hours **
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

  reservationForm.addEventListener("submit", async (e) => {
    e.preventDefault();
  
    const selectedRoom = roomSelect.value;
    const reservationDate = dateInput.value;
    const startTime = startTimeSelect.value;
    const endTime = endTimeSelect.value;
  
    if (!selectedRoom) {
      alert("Please select a room.");
      return;
    }
  
    if (!reservationDate) {
      alert("Please select a reservation date.");
      return;
    }
  
    if (!startTime || !endTime) {
      alert("Please select both start and end times.");
      return;
    }
  
    // Validate that the selected date and time are in the future
    const currentDate = new Date();
    const selectedDateTime = new Date(`${reservationDate}T${startTime}`);
  
    if (selectedDateTime < currentDate) {
      alert("You cannot select a date and time in the past.");
      return;
    }
  
    // Ensure that the end time is after the start time
    const startDateTime = new Date(`${reservationDate}T${startTime}`);
    const endDateTime = new Date(`${reservationDate}T${endTime}`);
  
    if (endDateTime <= startDateTime) {
      alert("End time must be after start time.");
      return;
    }
  
    // Check if the duration exceeds 4 hours
    const durationInHours = (endDateTime - startDateTime) / (1000 * 60 * 60); // Convert milliseconds to hours
    if (durationInHours > 4) {
      alert("Reservations cannot exceed 4 hours. Please adjust the times.");
      return;
    }
  
    // Insert reservation into Supabase
    try {
      const { data, error } = await supabase.from('reservations').insert([
        {
          room_name: selectedRoom,
          reservation_date: reservationDate,
          start_time: startTime,
          end_time: endTime,
        },
      ]);
  
      if (error) {
        console.error('Error saving reservation:', error.message);
        alert("Failed to save the reservation. Please try again.");
        return;
      }
  
      alert("Reservation saved successfully!");
      dateInput.value = "";
      startTimeSelect.value = "";
      endTimeSelect.value = "";
      displayReservations(); // Refresh reservations list
    } catch (err) {
      console.error('Unexpected error:', err.message);
      alert("An unexpected error occurred. Please try again.");
    }
  });
  
  

  // ** Display Reservations **
  async function displayReservations() {
    const selectedRoom = roomSelect.value;
    reservationsList.innerHTML = "";

    if (!selectedRoom) {
      reservationsList.innerHTML = "<p>Please select a room to view reservations.</p>";
      return;
    }

    const { data, error } = await supabase
      .from('reservations')
      .select('*')
      .eq('room_name', selectedRoom);

    if (error) {
      console.error('Error fetching reservations:', error.message);
      reservationsList.innerHTML = "<p>Failed to load reservations.</p>";
      return;
    }

    if (data.length === 0) {
      reservationsList.innerHTML = "<p>No reservations for this room.</p>";
      return;
    }

    data.forEach((reservation) => {
      const listItem = document.createElement("li");
      listItem.className = "reservation-item";
      listItem.innerHTML = `
        ${reservation.reservation_date} | ${reservation.start_time} - ${reservation.end_time}
        <button class="delete-btn" data-id="${reservation.id}">X</button>
      `;
      reservationsList.appendChild(listItem);
    });

    document.querySelectorAll(".delete-btn").forEach((btn) =>
      btn.addEventListener("click", deleteReservation)
    );
  }

  // ** Delete Reservation **
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
      console.error('Unexpected error deleting reservation:', err.message);
      alert("An unexpected error occurred. Please try again.");
    }
  }

  // ** Navigation Between Forms **
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

  // ** Initialize Dropdowns **
  await populateRoomDropdown();
  populateTimeDropdown(startTimeSelect);
  populateTimeDropdown(endTimeSelect);
});
