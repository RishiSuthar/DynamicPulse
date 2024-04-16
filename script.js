document.addEventListener('DOMContentLoaded', function() {
    // Login form submission
    document.getElementById('login-form').addEventListener('submit', function(event) {
        event.preventDefault();
        // Get username and password
        var username = document.getElementById('username').value;
        var password = document.getElementById('password').value;

        var user2 = username.toLowerCase(); 
        var pass2 = password.toLowerCase();

        // For simplicity, hardcoded authentication logic
        if (user2 === 'user' && pass2 === 'user') {
            window.location.href = 'mainwindow.html';
        } else {
            alert('Invalid username or password. Please try again.');
        }
    });
});
