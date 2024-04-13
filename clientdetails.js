document.addEventListener('DOMContentLoaded', function() {
    // Function to get query parameters from URL
    function getParameterByName(name) {
        var urlParams = new URLSearchParams(window.location.search);
        return urlParams.get(name);
    }

    // Function to fetch client details based on ID
    function getClientDetails(clientId) {
        var clients = JSON.parse(localStorage.getItem('clients')) || [];
        var client = clients.find(function(client) {
            return client.id == clientId;
        });
        return client;
    }

    // Function to populate client details in the HTML
    function populateClientDetails(client) {
        document.getElementById('client-fullname').textContent = client.fullName;
        document.getElementById('client-address').textContent = client.address;
        document.getElementById('client-company').textContent = client.company;
        document.getElementById('client-phone').textContent = client.phone;

        // Populate services
        renderServices(client.services);
    }

    // Function to render services in the HTML
    function renderServices(services) {
        var servicesContainer = document.getElementById('services-container');
        servicesContainer.innerHTML = ''; // Clear previous services

        services.forEach(function(service, index) {
            var serviceItem = document.createElement('div');
            serviceItem.classList.add('service-item');
            serviceItem.innerHTML = `
                <p><strong>Service Name:</strong> ${service.name}</p>
                <p><strong>Date of Service:</strong> ${service.date}</p>
                <p><strong>Payment:</strong> $${service.payment}</p>
                <div class="service-buttons">
                    <button class="renew-service-btn" data-index="${index}">Renew</button> <!-- Renew button -->
                    <button class="delete-service-btn" data-index="${index}">Delete</button> <!-- Delete button -->
                </div>
            `;
            servicesContainer.appendChild(serviceItem);
            // Display time until renewal
            displayTimeUntilRenewal(service, serviceItem);

            // Add a line under the service
            var line = document.createElement('hr');
            serviceItem.appendChild(line);
        });

        // Attach event listener to delete buttons
        var deleteButtons = document.querySelectorAll('.delete-service-btn');
        deleteButtons.forEach(function(button) {
            button.addEventListener('click', function() {
                var index = button.getAttribute('data-index');
                confirmDeleteService(index);
            });
        });

        // Attach event listener to renew buttons
        var renewButtons = document.querySelectorAll('.renew-service-btn');
        renewButtons.forEach(function(button) {
            button.addEventListener('click', function() {
                var index = button.getAttribute('data-index');
                renewService(index);
            });
        });
    }

    // Function to confirm deletion of a service
    function confirmDeleteService(index) {
        if (confirm("Are you sure you want to delete this service?")) {
            deleteService(index);
        }
    }

    // Function to delete a service
    function deleteService(index) {
        var clientId = getParameterByName('clientId');
        var clients = JSON.parse(localStorage.getItem('clients')) || [];
        var clientIndex = clients.findIndex(function(client) {
            return client.id == clientId;
        });
        if (clientIndex !== -1 && clients[clientIndex].services) {
            clients[clientIndex].services.splice(index, 1);
            localStorage.setItem('clients', JSON.stringify(clients));
            // Re-render services after deletion
            var client = getClientDetails(clientId);
            if (client) {
                renderServices(client.services);
            }
        }
    }

    // Function to handle service renewal
    function renewService(index) {
        var renewalPeriod = prompt("Renew for (month/day/year):");
        if (renewalPeriod && ['month', 'day', 'year'].includes(renewalPeriod.toLowerCase())) {
            // Get the client ID and services from local storage
            var clientId = getParameterByName('clientId');
            var clients = JSON.parse(localStorage.getItem('clients')) || [];
            var clientIndex = clients.findIndex(function(client) {
                return client.id == clientId;
            });
            if (clientIndex !== -1 && clients[clientIndex].services) {
                var service = clients[clientIndex].services[index];
                // Update the renewal period
                service.renewal = renewalPeriod.toLowerCase();
                // Save the updated services array
                localStorage.setItem('clients', JSON.stringify(clients));
                // Re-render services after renewal
                var client = getClientDetails(clientId);
                if (client) {
                    renderServices(client.services);
                }
            }
        } else {
            alert("Invalid renewal period!");
        }
    }

    // Function to calculate time until renewal
    function calculateTimeUntilRenewal(serviceDate, renewal) {
        var renewalDate = new Date(serviceDate);
        switch (renewal) {
            case 'month':
                renewalDate.setMonth(renewalDate.getMonth() + 1);
                break;
            case 'year':
                renewalDate.setFullYear(renewalDate.getFullYear() + 1);
                break;
            case 'day':
                renewalDate.setDate(renewalDate.getDate() + 1);
                break;
        }
        var today = new Date();
        var timeUntilRenewal = Math.ceil((renewalDate - today) / (1000 * 60 * 60 * 24)); // Calculate time in days
        return timeUntilRenewal;
    }

    // Function to display time until renewal with color coding
    function displayTimeUntilRenewal(service, serviceItem) {
        var timeUntilRenewal = calculateTimeUntilRenewal(service.date, service.renewal);
        var renewalInfo = document.createElement('p');
        renewalInfo.textContent = 'Renews in ' + timeUntilRenewal + ' days';

        // Apply color coding based on time until renewal
        if (timeUntilRenewal <= 15 && timeUntilRenewal >= 3) {
            renewalInfo.style.color = 'orange'; // Yellow for renewing within 10-14 days
        } else if (timeUntilRenewal >= 1 && timeUntilRenewal <= 3) {
            renewalInfo.style.color = 'red'; // Red for renewing within 1-3 days
        } else if (timeUntilRenewal <= 0) {
            renewalInfo.textContent = 'Expired';
            renewalInfo.style.color = 'red'; // Red for expired services
            renewalInfo.style.backgroundColor = 'black'; // Black background for expired services
        }

        serviceItem.appendChild(renewalInfo);
    }

    // Function to show the service modal
    function showServiceModal() {
        var serviceModal = document.getElementById('service-modal');
        if (serviceModal) {
            serviceModal.style.display = 'block';
        }
    }

    // Logout button functionality
    var logoutBtn = document.getElementById('logout-btn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', function() {
            // Redirect to the login page
            window.location.href = 'index.html';
        });
    }

    // Back button functionality
    var backBtn = document.getElementById('back-btn');
    if (backBtn) {
        backBtn.addEventListener('click', function() {
            window.location.href = 'mainwindow.html'; // Redirect to main panel page
        });
    }

    // Add Service button functionality
    var addServiceBtn = document.getElementById('add-service-btn');
    if (addServiceBtn) {
        addServiceBtn.addEventListener('click', function() {
            showServiceModal();
        });
    }

    // Service modal functionality
    var serviceModal = document.getElementById('service-modal');
    var addServiceForm = document.getElementById('add-service-form');
    if (serviceModal && addServiceForm) {
        var closeModalSpan = serviceModal.querySelector('.close');
        if (closeModalSpan) {
            closeModalSpan.addEventListener('click', function() {
                serviceModal.style.display = 'none';
            });
        }

        window.addEventListener('click', function(event) {
            if (event.target == serviceModal) {
                serviceModal.style.display = 'none';
            }
        });

        addServiceForm.addEventListener('submit', function(event) {
            event.preventDefault();
            // Get form values
            var serviceName = document.getElementById('service-name').value;
            var serviceDate = document.getElementById('service-date').value;
            var servicePayment = document.getElementById('service-payment').value;
            var serviceRenewal = document.getElementById('service-renewal').value;

            // Create service object
            var newService = {
                name: serviceName,
                date: serviceDate,
                payment: servicePayment,
                renewal: serviceRenewal
            };

            // Add service to client's services array
            var clientId = getParameterByName('clientId');
            var clients = JSON.parse(localStorage.getItem('clients')) || [];
            var clientIndex = clients.findIndex(function(client) {
                return client.id == clientId;
            });
            if (clientIndex !== -1) {
                if (!clients[clientIndex].services) {
                    clients[clientIndex].services = [];
                }
                clients[clientIndex].services.push(newService);
                localStorage.setItem('clients', JSON.stringify(clients));
            }

            // Populate client details again to reflect the added service
            var client = getClientDetails(clientId);
            if (client) {
                populateClientDetails(client);
            }

            // Close the modal after form submission
            serviceModal.style.display = 'none';
        });
    }

    // Get the client ID from the URL query parameter
    var clientId = getParameterByName('clientId');

    // Fetch client details and populate in HTML
    var client = getClientDetails(clientId);
    if (client) {
        populateClientDetails(client);
    } else {
        // Handle case where client ID is not found
        alert('Client not found');
    }
});
