document.addEventListener('DOMContentLoaded', function() {
    // Login form submission
    document.getElementById('login-form').addEventListener('submit', function(event) {
        event.preventDefault();
        // Get username and password
        var username = document.getElementById('username').value;
        var password = document.getElementById('password').value;

        // For simplicity, hardcoded authentication logic
        if (username === 'user' && password === 'user') {
            window.location.href = 'mainwindow.html';
        } else {
            alert('Invalid username or password. Please try again.');
        }
    });
});
