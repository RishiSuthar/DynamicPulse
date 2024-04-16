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
        if (client.services) {
            renderServices(client.services);
        } else {
            // Handle case where no services are available
            var servicesContainer = document.getElementById('services-container');
            servicesContainer.innerHTML = '<p>No services available.</p>';
        }
    
        // Populate tasks
        renderTasks(client.tasks);
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
                <p><strong>Date of Renew:</strong> ${service.renewals}</p>
                <p><strong>Payment:</strong> $${service.payment} per ${service.renewal}</p> <!-- Display renewal period here -->
                <div class="service-buttons">
                    <button class="renew-service-btn" data-index="${index}">Renew</button> <!-- Renew button -->
                    <button class="get-invoice-btn" data-index="${index}">Get Invoice</button>
                    <button class="delete-service-btn" data-index="${index}">Delete</button> <!-- Delete button -->
                </div>
            `;
            // Insert the service item at the beginning of the services container
            servicesContainer.insertBefore(serviceItem, servicesContainer.firstChild);
            // Display time until renewal
            displayTimeUntilRenewal(service, serviceItem);
    
            // Add a line under the service
            var line = document.createElement('hr');
            servicesContainer.insertBefore(line, servicesContainer.firstChild);
        });
        
        // Attach event listener to "Get Invoice" buttons
        var getInvoiceButtons = document.querySelectorAll('.get-invoice-btn');
        getInvoiceButtons.forEach(function(button) {
            button.addEventListener('click', function() {
                var serviceItem = button.closest('.service-item'); // Find the parent service item
                var serviceNameElement = serviceItem.querySelector('p:nth-of-type(1)'); // Get the service name element
                var servicePaymentElement = serviceItem.querySelector('p:nth-of-type(3)'); // Get the service payment element
                var serviceDateElement = serviceItem.querySelector('p:nth-of-type(2)'); // Get the service date element
                var renewalInfo = serviceItem.querySelector('p:nth-of-type(4)');
                

                var billToName = client.fullName;
                var billToAddress = client.address;
                var billToPhone = client.phone;

                // Check if all required elements are present
                if (serviceNameElement && servicePaymentElement && serviceDateElement) {
                    var serviceName = serviceNameElement.textContent.trim().split(':')[1]; // Get service name
                    var servicePayment = servicePaymentElement.textContent.trim().split(':')[1].replace('$', ''); // Get service payment
                    var serviceDate = serviceDateElement.textContent.trim().split(':')[1];
                    var timeUntilRenewal = renewalInfo.textContent.split(' ')[2]; 

                    var invoiceUrl = `invoice.html?serviceName=${serviceName}&servicePayment=${servicePayment}&serviceDate=${serviceDate}&timeUntilRenewal=${timeUntilRenewal}&billToName=${billToName}&billToAddress=${billToAddress}&billToPhone=${billToPhone}&renewdates=${timeUntilRenewal}`;
            
                    // Open the invoice page in a new tab
                    window.open(invoiceUrl, '_blank');

                } else {
                    console.error('Required elements not found');
                }
            });
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

    // Inside the renewService function
    function renewService(index) {
        var renewalDays = prompt("Renew for how many days?");
        if (renewalDays && !isNaN(renewalDays)) {
            var clientId = getParameterByName('clientId');
            var clients = JSON.parse(localStorage.getItem('clients')) || [];
            var clientIndex = clients.findIndex(function(client) {
                return client.id == clientId;
            });
            if (clientIndex !== -1 && clients[clientIndex].services) {
                var service = clients[clientIndex].services[index];
                var currentDate = new Date()
                var expiryDate = new Date(service.date);
                expiryDate.setDate(expiryDate.getDate() + parseInt(renewalDays)); // Renew for specified days
                
                // Calculate time until renewal
                var timeUntilRenewal = calculateTimeUntilRenewal(expiryDate.toISOString().split('T')[0], service.renewal);

                // Update the service date
                service.date = expiryDate.toISOString().split('T')[0];
                service.renewals = currentDate.toISOString().split('T')[0];

                localStorage.setItem('clients', JSON.stringify(clients));

                // Show confirmation message
                alert(`Service renewed for ${renewalDays} days. Please refresh the page!`);
            }
        } else {
            alert("Invalid input. Please enter a valid number of days.");
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
            var client = getClientDetails(clientId);
            if (client) {
                renderServices(client.services);
            }
        }
    }


    // Function to add a new task
    function addTask(taskName) {
        var clientId = getParameterByName('clientId');
        var clients = JSON.parse(localStorage.getItem('clients')) || [];
        var clientIndex = clients.findIndex(function(client) {
            return client.id == clientId;
        });
        if (clientIndex !== -1) {
            if (!clients[clientIndex].tasks) {
                clients[clientIndex].tasks = [];
            }
            // Create a new task object
            var newTask = {
                name: taskName,
                status: 'inprogress' // Set the initial status to 'inprogress'
            };
            // Add the new task to the client's tasks array
            clients[clientIndex].tasks.push(newTask);
            localStorage.setItem('clients', JSON.stringify(clients));
            // Re-render tasks after adding the new task
            renderTasks(clients[clientIndex].tasks);

            // Update the color of the newly added task
            var tasksList = document.getElementById('tasks-list');
            var newTaskItem = tasksList.lastElementChild.previousElementSibling; // Get the newly added task item
            var statusDropdown = newTaskItem.querySelector('.status-dropdown');
            var status = statusDropdown.value; // Get the status from the dropdown
            updateTaskStatus(newTaskItem, status); // Apply color coding based on the status
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
        renewalInfo.textContent = 'Expires in ' + timeUntilRenewal + ' days';

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

    // Function to render tasks in the HTML
    function renderTasks(tasks) {
        var tasksList = document.getElementById('tasks-list');
        tasksList.innerHTML = ''; // Clear previous tasks
    
        if (tasks && tasks.length > 0) {
            tasks.forEach(function(task, index) {
                var taskItem = document.createElement('li');
                taskItem.innerHTML = `
                    <span class="task-name">${task.name}</span>
                    <div class="task-status">
                        <select class="status-dropdown" data-index="${index}">
                            <option value="inprogress">In Progress</option>
                            <option value="complete">Complete</option>
                            <option value="incomplete">Incomplete</option>
                        </select>
                    </div>
                    <button class="delete-task-btn">X</button>
                `;
    
                tasksList.appendChild(taskItem);
                // Set the selected status based on the task status from local storage
                var storedStatus = localStorage.getItem(`taskStatus-${clientId}-${index}`);
                if (storedStatus) {
                    taskItem.querySelector('.status-dropdown').value = storedStatus;
                    updateTaskStatus(taskItem, storedStatus); // Apply color coding based on stored status
                }
    
                // Add a line for spacing
                var line = document.createElement('hr');
                tasksList.appendChild(line);
            });
    
            // Attach event listener to task status dropdowns
            var dropdowns = document.querySelectorAll('.status-dropdown');
            dropdowns.forEach(function(dropdown) {
                dropdown.addEventListener('change', function() {
                    var index = parseInt(dropdown.getAttribute('data-index'));
                    var status = dropdown.value;
                    updateTaskStatus(dropdown.parentElement.parentElement, status);
                });
            });
    
            // Attach event listener to delete task buttons
            var deleteButtons = document.querySelectorAll('.delete-task-btn');
            deleteButtons.forEach(function(button, index) {
                button.addEventListener('click', function() {
                    deleteTask(index);
                });
            });
        } else {
            tasksList.innerHTML = '<p>No tasks available.</p>';
        }
    }
    


    // Function to update task status
    function updateTaskStatus(taskItem, status) {
        var taskName = taskItem.querySelector('.task-name');
        var taskStatus = taskItem.querySelector('.task-status');
    
        // Remove previous status classes
        taskName.classList.remove('green', 'red', 'yellow');
    
        // Add new status classes
        var statusClass = getStatusClass(status);
        taskName.classList.add(statusClass);
    
        var index = parseInt(taskItem.querySelector('.status-dropdown').getAttribute('data-index'));
        var clientId = getParameterByName('clientId');
        var clients = JSON.parse(localStorage.getItem('clients')) || [];
        var clientIndex = clients.findIndex(function(client) {
            return client.id == clientId;
        });
        if (clientIndex !== -1) {
            clients[clientIndex].tasks[index].status = status; // Update the task status
            localStorage.setItem('clients', JSON.stringify(clients)); // Save the updated tasks
    
            // Save the status in localStorage
            localStorage.setItem(`taskStatus-${clientId}-${index}`, status);
        }
    }

    // Function to delete a task
    function deleteTask(index) {
        var clientId = getParameterByName('clientId');
        var clients = JSON.parse(localStorage.getItem('clients')) || [];
        var clientIndex = clients.findIndex(function(client) {
            return client.id == clientId;
        });
        if (clientIndex !== -1 && clients[clientIndex].tasks) {
            clients[clientIndex].tasks.splice(index, 1);
            localStorage.setItem('clients', JSON.stringify(clients));
            var client = getClientDetails(clientId);
            if (client) {
                renderTasks(client.tasks);
            }
        }
    }

    // Helper function to get CSS class based on task status
    function getStatusClass(status) {
        switch (status) {
            case 'complete':
                return 'green';
            case 'incomplete':
                return 'red';
            case 'inprogress':
                return 'yellow';
            default:
                return '';
        }
    }

    // Attach event listener to add task form
    var addTaskForm = document.getElementById('add-task-form');
    if (addTaskForm) {
        addTaskForm.addEventListener('submit', function(event) {
            event.preventDefault();
            var taskInput = document.getElementById('task-input');
            var taskName = taskInput.value.trim();
            if (taskName !== '') {
                addTask(taskName);
                taskInput.value = '';
            }
        });
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

            var today = new Date();
            // Get form values
            var serviceName = document.getElementById('service-name').value;
            var serviceDate = today.toISOString().split('T')[0];

            var serviceRenewals = today.toISOString().split('T')[0];

            console.log(serviceDate);
            
            //var serviceDate = document.getElementById('service-date').value;
            var servicePayment = document.getElementById('service-payment').value;
            var serviceRenewal = document.getElementById('service-renewal').value;

            // Create service object
            var newService = {
                name: serviceName,
                date: serviceDate,
                renewals: serviceRenewals,
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
        renderTasks(client.tasks); // Render tasks after populating client details
    } else {
        // Handle case where client ID is not found
        alert('Client not found');
    }

});
