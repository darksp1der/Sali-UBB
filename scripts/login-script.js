document.addEventListener('DOMContentLoaded', () => {
  const loginForm = document.getElementById('login-form');
  const emailInput = document.getElementById('email');
  const passwordInput = document.getElementById('password');

  loginForm.addEventListener('submit', (event) => {
    event.preventDefault();

    const email = emailInput.value.trim();
    const password = passwordInput.value.trim();

    if (!email || !password) {
      alert('Please enter both email and password.');
      return;
    }

    const storedUsers = JSON.parse(localStorage.getItem('users')) || [];
    const matchingUser = storedUsers.find(
      (user) => user.email === email && user.password === password
    );

    if (matchingUser) {
      localStorage.setItem('loggedInUser', email); // Save logged-in user
      alert('Login successful! Redirecting...');
      window.location.href = 'index.html'; // Redirect to reservation planner
    } else {
      alert('Invalid email or password. Please try again.');
    }
  });
});
