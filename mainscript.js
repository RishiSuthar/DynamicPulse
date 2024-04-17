document.addEventListener('DOMContentLoaded', function() {
    // Function to fetch clients from local storage
    function getClients() {
        var clients = JSON.parse(localStorage.getItem('clients')) || [];
        return clients;
    }

    // Function to save clients to local storage
    function saveClients(clients) {
        localStorage.setItem('clients', JSON.stringify(clients));
    }

    // Function to render clients in the client list
    function renderClients(clients) {
        var clientList = document.getElementById('client-list');
        clientList.innerHTML = ''; // Clear previous list

        clients.forEach(function(client) {
            var listItem = document.createElement('div');
            listItem.textContent = client.fullName + ' : ' + client.company;
            listItem.classList.add('client-item');
            listItem.setAttribute('data-client-id', client.id); // Add client ID as a data attribute
            clientList.appendChild(listItem);
        });

        // Add event listener to each client item
        clientList.querySelectorAll('.client-item').forEach(function(item) {
            item.addEventListener('click', function() {
                var clientId = item.getAttribute('data-client-id');
                window.location.href = 'clientdetails.html?clientId=' + clientId; // Redirect to client details page
            });
        });
    }

    // Initial rendering of clients
    var allClients = getClients();
    renderClients(allClients);

    // Logout button functionality
    var logoutBtn = document.getElementById('logout-btn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', function() {
            // Redirect to the login page
            window.location.href = 'index.html';
        });
    }

    // Add client modal functionality
    var addClientModal = document.getElementById('add-client-modal');
    var addClientBtn = document.getElementById('add-client-btn');
    var closeModalSpan = document.getElementsByClassName('close')[0];

    if (addClientBtn && addClientModal && closeModalSpan) {
        addClientBtn.addEventListener('click', function() {
            addClientModal.style.display = 'block';
        });

        closeModalSpan.addEventListener('click', function() {
            addClientModal.style.display = 'none';
        });

        window.addEventListener('click', function(event) {
            if (event.target == addClientModal) {
                addClientModal.style.display = 'none';
            }
        });
    }

    // Form submission for adding client
    var addClientForm = document.getElementById('add-client-form');
    if (addClientForm) {
        addClientForm.addEventListener('submit', function(event) {
            event.preventDefault();
            // Get form values
            var fullName = document.getElementById('fullname').value;
            var address = document.getElementById('address').value;
            var company = document.getElementById('company').value;
            var phone = document.getElementById('phone').value;

            // Create new client object
            var newClient = {
                id: Date.now(), // Unique identifier for each client
                fullName: fullName,
                address: address,
                company: company,
                phone: phone
            };

            // Save the client to local storage
            var clients = getClients();
            clients.push(newClient);
            saveClients(clients);

            // Re-render the client list
            renderClients(clients);

            // Close the modal after form submission
            addClientModal.style.display = 'none';
        });
    }

    var searchInput = document.getElementById('search-input');
    searchInput.addEventListener('input', function() {
        var searchTerm = searchInput.value.toLowerCase();
        var filteredClients = allClients.filter(function(client) {
            // Check if the search term matches either full name or company name
            return client.fullName.toLowerCase().includes(searchTerm) || client.company.toLowerCase().includes(searchTerm);
        });
        renderClients(filteredClients);
    });
});

