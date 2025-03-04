// List of responsible persons
const responsibleList = [
  "Jumar Siva", "Carlos Gagal", "Robert Morales", "Marlon Argel",
  "Arnulfo Pineda", "Daniel Togonon", "Antonio Aranilla", "Aldrine Verzosa",
  "Carlo Floro", "Eddie Regalado", "Renante Royo", "Jexsel Jarce",
  "Hernan Guinto", "Florentino Montemayor", "Hernan Cañas", "Roland Cañas",
  "Adachi Segundo", "Rogelio Santos"
];

/* -------------------------------
   Helper: Format Date for MySQL
--------------------------------- */
function formatDateMySQL(date) {
  let yyyy = date.getFullYear();
  let mm = ("0" + (date.getMonth() + 1)).slice(-2);
  let dd = ("0" + date.getDate()).slice(-2);
  let hh = ("0" + date.getHours()).slice(-2);
  let mi = ("0" + date.getMinutes()).slice(-2);
  let ss = ("0" + date.getSeconds()).slice(-2);
  return `${yyyy}-${mm}-${dd} ${hh}:${mi}:${ss}`;
}

/* -------------------------------
   Ticket Form Submission
--------------------------------- */
document.addEventListener('DOMContentLoaded', function() {
  const ticketForm = document.getElementById('ticketForm');
  
  if (ticketForm) {
    ticketForm.addEventListener('submit', async function(event) {
      event.preventDefault();

      // Retrieve form values with null checks
      const nameInput = document.getElementById('name');
      const officeInput = document.getElementById('office');
      const buildingLocationInput = document.getElementById('buildingLocation');
      const categoryInput = document.getElementById('category');
      const descriptionInput = document.getElementById('description');

      // Check if all elements exist before accessing their values
      if (!nameInput || !officeInput || !buildingLocationInput || 
          !categoryInput || !descriptionInput) {
        console.error("One or more form elements not found");
        return;
      }

      // Use ISO string for createdTime (for backend compatibility)
      const createdTime = new Date().toISOString();

      // Build ticket data object for the server
      const ticketData = {
        name: nameInput.value,
        description: descriptionInput.value,
        office: officeInput.value,
        buildingLocation: buildingLocationInput.value,
        category: categoryInput.value,
        status: "Open",             // New tickets are open by default
        responsible: "",            // Initially empty
        createdTime,
        closedTime: ""              // Not closed yet
      };

      try {
        const response = await fetch('save_tickets.php', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(ticketData)
        });
        const data = await response.json();
        console.log('Ticket saved:', data);
        if (!data.success) {
          alert("Error saving ticket: " + data.error);
        } else {
          await loadTickets(); // Refresh the ticket table
          ticketForm.reset(); // Reset the form after successful submission
        }
      } catch (error) {
        console.error('Error saving ticket:', error);
        alert("There was an error saving the ticket.");
      }
    });
  } else {
    console.error("Ticket form not found in the document");
  }

  // Initial load of tickets
  loadTickets().catch(error => {
    console.error("Failed to load tickets:", error);
  });
});

/* -------------------------------
   Add Responsible Function
--------------------------------- */
async function addResponsible(button) {
  try {
    console.log("Add responsible button clicked.");
    const container = button.closest('.responsible-container');
    if (!container) throw new Error("Container not found");
    
    const select = container.querySelector('select');
    if (!select) throw new Error("Select element not found");
    
    const selectedValue = select.value;
    if (!selectedValue) throw new Error("No value selected");
    
    const badgesContainer = container.querySelector('.responsible-badges');
    if (!badgesContainer) throw new Error("Badges container not found");
    
    const row = container.closest('tr');
    const ticketId = row.getAttribute('data-ticket-id');
    if (!ticketId) throw new Error("No ticket ID found");

    // Check if badge already exists
    const badgeExists = Array.from(badgesContainer.children)
      .some(badge => badge.dataset.value === selectedValue);
    if (badgeExists) {
      console.log("Badge already exists for:", selectedValue);
      return;
    }

    // Get current status
    const statusBadge = row.querySelector('td:nth-child(7) .badge');
    const currentStatus = statusBadge ? statusBadge.textContent : 'Open';
    
    // Gather all responsible values
    const existingBadges = Array.from(badgesContainer.children).map(b => b.dataset.value);
    existingBadges.push(selectedValue);
    const responsibleStr = existingBadges.join(', ');
    
    const updateData = {
      ticket_id: ticketId,
      status: currentStatus,
      comments: responsibleStr  // This will be used as responsible in PHP
    };
    
    console.log("Sending update data:", updateData);
    
    const response = await fetch('update_tickets.php', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updateData)
    });
    
    const data = await response.json();
    console.log("Server response:", data);
    
    if (!data.success) {
      throw new Error(data.error || 'Unknown error occurred');
    }
    
    // Create and append the new badge
    const badge = document.createElement('span');
    badge.className = 'badge bg-primary me-1';
    badge.dataset.value = selectedValue;
    badge.textContent = selectedValue;
    
    const removeIcon = document.createElement('button');
    removeIcon.className = 'btn-close btn-close-white btn-sm ms-1';
    removeIcon.onclick = function() {
      removeBadgeAndUpdate(this);
    };
    badge.appendChild(removeIcon);
    badgesContainer.appendChild(badge);
    
    console.log("Responsible update successful");
    
  } catch (error) {
    console.error("Error in addResponsible:", error);
    console.error("Full error details:", {
      message: error.message,
      stack: error.stack
    });
    alert(`Failed to update responsible person: ${error.message}`);
  }
}

/* -------------------------------
   Remove Badge and Update Function
--------------------------------- */
function removeBadgeAndUpdate(button) {
  const badge = button.parentElement;
  badge.remove();
  const container = button.closest('.responsible-container');
  updateResponsibleForRow(container);
}

/* -------------------------------
   Update Responsible for Row
--------------------------------- */
async function updateResponsibleForRow(container) {
  const row = container.closest('tr');
  if (!row) return;
  const ticketId = row.getAttribute('data-ticket-id');
  if (!ticketId) return;
  
  // Gather responsible values from badges
  const badgesContainer = container.querySelector('.responsible-badges');
  const responsibleArr = Array.from(badgesContainer.children).map(badge => badge.dataset.value);
  const responsibleStr = responsibleArr.join(', ');
  
  const updateData = {
    ticket_id: ticketId,  // Changed from 'id' to 'ticket_id' to match PHP expectations
    status: 'Open',       // Add required status field
    assigned_to: '1',     // Add required assigned_to field (you might want to adjust this value)
    comments: responsibleStr  // Using responsible string as comments
  };
  
  try {
    const response = await fetch('update_tickets.php', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updateData)
    });
    const data = await response.json();
    if (!data.success) {
      console.error("Error updating responsible:", data.error);
    } else {
      console.log("Responsible update successful:", data.message);
    }
  } catch (error) {
    console.error("Error updating responsible:", error);
  }
}

/* -------------------------------
   Close Ticket (UI & DB Update)
--------------------------------- */
function closeTicket(button) {
  const row = button.closest('tr');
  const ticketId = row.getAttribute('data-ticket-id');

  // Capture current time as Date object
  const now = new Date();
  // For UI display
  const nowDisplay = now.toLocaleString();
  // For database update (MySQL DATETIME format)
  const nowMySQL = formatDateMySQL(now);

  console.log("Closing ticket", ticketId, "with closedTime:", nowMySQL);

  // Update UI: change status and closed time
  row.cells[6].innerHTML = '<span class="badge bg-success">Closed</span>';
  row.cells[9].textContent = nowDisplay;

  // Remove the select, add button, and make badges non-removable
  const responsibleCell = row.cells[7];
  const container = responsibleCell.querySelector('.responsible-container');
  if (container) {
    // Keep only the badges without close buttons
    const badges = Array.from(container.querySelectorAll('.badge')).map(badge => {
      return `<span class="badge bg-primary me-1">${badge.dataset.value}</span>`;
    }).join('');
    container.innerHTML = `<div class="responsible-container"><div class="responsible-badges">${badges}</div></div>`;
  }
  
  // Update the buttons in the last cell to show only Delete button
  const actionsCell = row.cells[10];
  actionsCell.innerHTML = `
    <button class="btn btn-danger btn-sm" onclick="deleteRow(this)">Delete</button>
  `;
  
  // Prepare update data to send to close_tickets.php
  const updateData = {
    id: ticketId,
    closedTime: nowMySQL
  };
  
  console.log("Sending update data to close_tickets.php:", updateData);
  
  // Send update request to server using close_tickets.php
  fetch('close_tickets.php', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(updateData)
  })
  .then(response => {
    console.log("Raw response:", response);
    return response.json();
  })
  .then(data => {
    console.log("Server response:", data);
    if (!data.success) {
      console.error("Error closing ticket:", data.error);
    } else {
      console.log("Ticket closed successfully.");
    }
  })
  .catch(error => {
    console.error("Error closing ticket:", error);
  });
}

/* -------------------------------
   Update Ticket Function
--------------------------------- */
function updateTicket(button) {
  const row = button.closest('tr');
  const ticketId = row.getAttribute('data-ticket-id');
  alert('Update ticket with ID: ' + ticketId);
  // Custom update logic here (e.g., open a modal)
}

/* -------------------------------
   Delete Ticket Row (UI & DB Update)
--------------------------------- */
async function deleteRow(button) {
    // Add confirmation dialog
    if (!confirm('Are you sure you want to delete this ticket?')) {
        return; // Exit if user clicks "Cancel"
    }

    try {
        // Get the ticket ID from the row
        const row = button.closest('tr');
        const ticketId = row.getAttribute('data-ticket-id');
        
        console.log("Attempting to delete ticket:", ticketId);

        const response = await fetch('delete_tickets.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                ticket_id: ticketId
            })
        });

        // Log the raw response for debugging
        console.log("Response status:", response.status);
        const responseText = await response.text();
        console.log("Raw response:", responseText);

        // Try to parse the response as JSON
        let data;
        try {
            data = JSON.parse(responseText);
        } catch (e) {
            console.error("Failed to parse JSON response:", e);
            throw new Error(`Invalid JSON response: ${responseText}`);
        }

        if (data.success) {
            row.remove();
            alert('Ticket deleted successfully');
        } else {
            throw new Error(data.error || 'Failed to delete ticket');
        }

    } catch (error) {
        console.error('Error deleting ticket:', error);
        alert(`Failed to delete ticket: ${error.message}`);
    }
}

/* -------------------------------
   Load Tickets from Server
--------------------------------- */
async function loadTickets() {
  try {
    console.log("Starting loadTickets");
    
    const tableBody = document.getElementById('ticketTableBody');
    if (!tableBody) {
      console.error("Table body not found");
      return;
    }

    const response = await fetch('get_tickets.php');
    const tickets = await response.json();
    console.log("Fetched tickets:", tickets);

    // Clear table
    tableBody.innerHTML = '';

    // Add rows
    if (Array.isArray(tickets)) {
      tickets.forEach((ticket, index) => {
        const row = document.createElement('tr');
        row.setAttribute('data-ticket-id', ticket.id); // Important for other functions
        
        // Create responsible section with select and badges
        const responsibleHtml = `
          <div class="responsible-container">
            <div class="responsible-badges">
              ${(ticket.responsible || '').split(',').map(name => 
                name.trim() ? `<span class="badge bg-primary me-1" data-value="${name.trim()}">${name.trim()}
                  <button class="btn-close btn-close-white btn-sm ms-1" onclick="removeBadgeAndUpdate(this)"></button>
                </span>` : ''
              ).join('')}
            </div>
            <select class="form-select form-select-sm mt-1">
              <option value="">Select Person</option>
              ${responsibleList.map(name => 
                `<option value="${name}">${name}</option>`
              ).join('')}
            </select>
            <button class="btn btn-primary btn-sm mt-1" onclick="addResponsible(this)">Add</button>
          </div>
        `;

        // Create action buttons based on status
        const actionButtons = ticket.status === 'Closed' 
          ? `<button class="btn btn-danger btn-sm" onclick="deleteRow(this)">Delete</button>`
          : `<button class="btn btn-success btn-sm me-1" onclick="closeTicket(this)">Close</button>
             <button class="btn btn-danger btn-sm" onclick="deleteRow(this)">Delete</button>`;

        row.innerHTML = `
          <td>${index + 1}</td>
          <td>${ticket.name || '-'}</td>
          <td>${ticket.description || '-'}</td>
          <td>${ticket.office || '-'}</td>
          <td>${ticket.building_location || '-'}</td>
          <td>${ticket.category || '-'}</td>
          <td><span class="badge ${ticket.status === 'Closed' ? 'bg-success' : 'bg-primary'}">${ticket.status || 'Open'}</span></td>
          <td>${responsibleHtml}</td>
          <td>${ticket.created_time || '-'}</td>
          <td>${ticket.closed_time || '-'}</td>
          <td>${actionButtons}</td>
        `;
        
        tableBody.appendChild(row);
      });
    }

    console.log("Table populated successfully");

  } catch (error) {
    console.error("Error loading tickets:", error);
  }
}

/* -------------------------------
   Download Tickets as CSV
--------------------------------- */
function downloadCSV() {
  // Get all tickets from the table
  const table = document.getElementById('ticketTableBody');
  const rows = Array.from(table.getElementsByTagName('tr'));
  
  // Define CSV headers
  const headers = ['No.', 'Name', 'Description', 'Office', 'Building Location', 
                  'Category', 'Status', 'Responsible', 'Created Time', 'Closed Time'];
  
  // Convert table data to CSV format
  let csvContent = headers.join(',') + '\n';
  
  rows.forEach((row, index) => {
    const cells = Array.from(row.cells);
    const rowData = cells.map((cell, cellIndex) => {
      let value = '';
      
      // Special handling for responsible column (index 7)
      if (cellIndex === 7) {
        const badges = cell.querySelectorAll('.badge');
        value = Array.from(badges)
          .map(badge => badge.textContent.trim())
          .join('; ');
      } else {
        // For other columns, just get the text content
        value = cell.textContent.trim();
      }
      
      // Escape special characters and wrap in quotes
      value = value.replace(/"/g, '""');
      return `"${value}"`;
    });
    
    // Skip the last column (actions buttons)
    rowData.pop();
    csvContent += rowData.join(',') + '\n';
  });
  
  // Create and trigger download
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  
  link.setAttribute('href', url);
  link.setAttribute('download', `tickets_${formatDateForFilename(new Date())}.csv`);
  link.style.visibility = 'hidden';
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

/* -------------------------------
   Helper: Format Date for Filename
--------------------------------- */
function formatDateForFilename(date) {
  let yyyy = date.getFullYear();
  let mm = ("0" + (date.getMonth() + 1)).slice(-2);
  let dd = ("0" + date.getDate()).slice(-2);
  let hh = ("0" + date.getHours()).slice(-2);
  let mi = ("0" + date.getMinutes()).slice(-2);
  return `${yyyy}${mm}${dd}_${hh}${mi}`;
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  console.log("DOM loaded");
  loadTickets();
});

// Remove window.onload
window.onload = null;
