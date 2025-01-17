  document.addEventListener('DOMContentLoaded', () => {
      const loginForm = document.getElementById('login-form');
      const emailInput = document.getElementById('email');
      const passwordInput = document.getElementById('password');
    
      loginForm.addEventListener('submit', (e) => {
        e.preventDefault();
    
        const email = emailInput.value;
        const password = passwordInput.value;
    
        // Here you would typically send a request to your server to authenticate the user
        console.log('Login attempted with:', { email, password });
    
        // For demonstration purposes, we'll just log a message
        alert('Login functionality would be implemented here.');
    
        // Clear the formz
        emailInput.value = '';
        passwordInput.value = '';
      });
    });