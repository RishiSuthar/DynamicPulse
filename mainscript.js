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

    function renderClients(clients) {
        var clientList = document.getElementById('client-list');
        clientList.innerHTML = ''; // Clear previous list
        
        var clientCounter = 1; // Initialize client counter
        var clientNumbers = {}; // Object to store client numbers
    
        clients.forEach(function(client) {
            var listItem = document.createElement('div');
            listItem.classList.add('client-item');
    
            // Assign client number if not already assigned
            if (!clientNumbers.hasOwnProperty(client.id)) {
                clientNumbers[client.id] = clientCounter++;
            }
    
            // Client number
            var clientNumber = document.createElement('span');
            clientNumber.textContent = "Cl No. " + clientNumbers[client.id];
            listItem.appendChild(clientNumber);
    
            // Client name and company
            var clientInfo = document.createElement('span');
            clientInfo.textContent = client.fullName + ' : ' + client.company;
            listItem.appendChild(clientInfo);
    
            // Container for edit and delete buttons
            var buttonsContainer = document.createElement('div');
            buttonsContainer.classList.add('buttons-container');
    
            // Edit button
            var editButton = document.createElement('button');
            editButton.textContent = 'Edit';
            editButton.classList.add('edit-client-btn');
            editButton.setAttribute('data-client-id', client.id); // Add client ID as a data attribute
            buttonsContainer.appendChild(editButton);
    
            // Delete button
            var deleteButton = document.createElement('button');
            deleteButton.textContent = 'Delete';
            deleteButton.classList.add('delete-client-btn');
            deleteButton.setAttribute('data-client-id', client.id); // Add client ID as a data attribute
            buttonsContainer.appendChild(deleteButton);
    
            listItem.appendChild(buttonsContainer);
    
            // Prepend the new client to the top of the list
            clientList.prepend(listItem);
        });

        // Add event listener to each edit button
        clientList.querySelectorAll('.edit-client-btn').forEach(function(button) {
            button.addEventListener('click', function(event) {
                event.stopPropagation(); // Prevent click event from bubbling to the client item

                var clientId = button.getAttribute('data-client-id');
                editClient(clientId);
            });
        });

        // Add event listener to each delete button
        clientList.querySelectorAll('.delete-client-btn').forEach(function(button) {
            button.addEventListener('click', function(event) {
                event.stopPropagation(); // Prevent click event from bubbling to the client item

                var clientId = button.getAttribute('data-client-id');
                var confirmation = confirm("Are you sure you want to delete this client?");
                if (confirmation) {
                    deleteClient(clientId);
                }
            });
        });

        // Add event listener to each client item
        clientList.querySelectorAll('.client-item').forEach(function(item) {
            item.addEventListener('click', function() {
                var clientId = item.querySelector('.edit-client-btn').getAttribute('data-client-id');
                window.location.href = 'clientdetails.html?clientId=' + clientId; // Redirect to client details page
            });
        });
    }

    // Function to delete a client
    function deleteClient(clientId) {
        var clients = getClients();
        var updatedClients = clients.filter(function(client) {
            return client.id != clientId;
        });
        saveClients(updatedClients);
        renderClients(updatedClients);
    }



    // Function to add a new client
    function addClient() {
        // Display the add client modal
        var addClientModal = document.getElementById('add-client-modal');
        addClientModal.style.display = 'block';
    
        // Clear input fields
        document.getElementById('fullname').value = '';
        document.getElementById('address').value = '';
        document.getElementById('company').value = '';
        document.getElementById('phone').value = '';
    
        // Change the submit button to add client
        var submitButton = document.querySelector('#add-client-form button[type="submit"]');
        submitButton.textContent = 'Add Client';
    
        // Update client details on form submission
        var addClientForm = document.getElementById('add-client-form');
        addClientForm.addEventListener('submit', function(event) {
            event.preventDefault();
            // Get form values
            var fullName = document.getElementById('fullname').value;
            var address = document.getElementById('address').value;
            var company = document.getElementById('company').value;
            var phone = document.getElementById('phone').value;
    
            // Check if the client already exists
            var clients = getClients();
            var existingClient = clients.find(function(client) {
                return client.fullName === fullName && client.address === address && client.company === company && client.phone === phone;
            });
    
            if (existingClient) {
                alert('This client already exists.');
                return; // Exit the function if the client already exists
            }
    
            // Create new client object
            var newClient = {
                id: Date.now(), // Unique identifier for each client
                fullName: fullName,
                address: address,
                company: company,
                phone: phone
            };
    
            // Save the client to local storage
            clients.push(newClient);
            saveClients(clients);
    
            // Re-render the client list
            renderClients(clients);
    
            // Close the modal after form submission
            addClientModal.style.display = 'none';
        });
    }

    // Function to edit an existing client
    function editClient(clientId) {
        // Fetch client details from local storage
        var clients = getClients();
        var clientIndex = clients.findIndex(function(c) {
            return c.id == clientId;
        });

        if (clientIndex === -1) {
            console.error("Client not found");
            return;
        }

        var client = clients[clientIndex];

        // Populate the form with client details
        document.getElementById('fullname').value = client.fullName;
        document.getElementById('address').value = client.address;
        document.getElementById('company').value = client.company;
        document.getElementById('phone').value = client.phone;

        // Display the add client modal
        var addClientModal = document.getElementById('add-client-modal');
        addClientModal.style.display = 'block';

        // Change the submit button to update client
        var submitButton = document.querySelector('#add-client-form button[type="submit"]');
        submitButton.textContent = 'Save Changes';

        // Update client details on form submission
        var addClientForm = document.getElementById('add-client-form');
        addClientForm.addEventListener('submit', function(event) {
            event.preventDefault();
            // Get form values
            var fullName = document.getElementById('fullname').value;
            var address = document.getElementById('address').value;
            var company = document.getElementById('company').value;
            var phone = document.getElementById('phone').value;

            // Update client object
            clients[clientIndex].fullName = fullName;
            clients[clientIndex].address = address;
            clients[clientIndex].company = company;
            clients[clientIndex].phone = phone;

            // Save the updated clients list to local storage
            saveClients(clients);

            // Re-render the client list
            renderClients(clients);

            // Close the modal after form submission
            addClientModal.style.display = 'none';
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
        addClientBtn.addEventListener('click', addClient);

        closeModalSpan.addEventListener('click', function() {
            addClientModal.style.display = 'none';
        });

        window.addEventListener('click', function(event) {
            if (event.target == addClientModal) {
                addClientModal.style.display = 'none';
            }
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
