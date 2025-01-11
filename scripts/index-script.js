document.addEventListener('DOMContentLoaded', () => {
    const loginContainer = document.getElementById('login-container');
    const plannerContainer = document.getElementById('planner-container');
    const logoutButton = document.getElementById('logout-button');
  
    const storedUsers = JSON.parse(localStorage.getItem('users')) || [];
    const loggedInUser = localStorage.getItem('loggedInUser');
  
    if (loggedInUser) {
      loginContainer.style.display = 'none';
      plannerContainer.style.display = 'block';
      displayReservations(); // Call the reservation display logic
    } else {
      loginContainer.style.display = 'block';
      plannerContainer.style.display = 'none';
    }
  
    logoutButton.addEventListener('click', () => {
      localStorage.removeItem('loggedInUser'); // Clear logged-in user
      window.location.href = 'login.html'; // Redirect to login
    });
  
    function displayReservations() {
      const roomSelect = document.getElementById('room-select');
      const reservationsList = document.getElementById('reservation-items');
      const rooms = ["A300", "A301", "A302", "A303"];
  
      roomSelect.innerHTML = '<option value="">Choose a Room</option>';
      rooms.forEach((room) => {
        const option = document.createElement('option');
        option.value = room;
        option.textContent = room;
        roomSelect.appendChild(option);
      });
  
      roomSelect.addEventListener('change', () => {
        const selectedRoom = roomSelect.value;
        reservationsList.innerHTML = '';
  
        if (!selectedRoom) {
          reservationsList.innerHTML = '<p>Please select a room to view reservations.</p>';
          return;
        }
  
        const reservations = JSON.parse(localStorage.getItem(`reservations_${selectedRoom}`)) || [];
  
        if (reservations.length === 0) {
          reservationsList.innerHTML = '<p>No reservations for this room.</p>';
          return;
        }
  
        reservations.forEach((reservation, index) => {
          const listItem = document.createElement('li');
          listItem.innerHTML = `
            ${reservation.start} - ${reservation.end}
            <button data-index="${index}" data-room="${selectedRoom}">X</button>
          `;
          reservationsList.appendChild(listItem);
        });
      });
    }
  });
  