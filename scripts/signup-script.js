document.addEventListener('DOMContentLoaded', () => {
    const signupForm = document.getElementById('signup-form');
    const emailInput = document.getElementById('signup-email');
    const passwordInput = document.getElementById('signup-password');
  
    signupForm.addEventListener('submit', (event) => {
      event.preventDefault();
  
      const email = emailInput.value.trim();
      const password = passwordInput.value.trim();
  
      if (!email || !password) {
        alert('Please fill out all fields.');
        return;
      }
  
      // Retrieve existing users from localStorage or use an empty array if none
      const users = JSON.parse(localStorage.getItem('users')) || [];
  
      // Check if user with this email already exists
      const existingUser = users.find((user) => user.email === email);
      if (existingUser) {
        alert('An account with this email already exists. Please log in instead.');
        return;
      }
  
      // Create a new user object
      const newUser = {
        email,
        password, // Plain text (for demonstration only!)
      };
  
      // Save to localStorage
      users.push(newUser);
      localStorage.setItem('users', JSON.stringify(users));
  
      alert('Account created successfully! You can now log in.');
  
      // Redirect or navigate to the login page
      window.location.href = 'login.html';
    });
  });
  