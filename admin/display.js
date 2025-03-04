document.addEventListener('DOMContentLoaded', () => {
    const calendar = document.getElementById('calendar');
    const monthYearDisplay = document.getElementById('monthYear');
    const prevMonthBtn = document.getElementById('prevMonth');
    const nextMonthBtn = document.getElementById('nextMonth');
    const reservationsKey = 'reservations';
    const modal = document.getElementById('reservationModal');
    const modalBody = document.getElementById('modalBody');
    const modalClose = document.getElementById('modalClose');

    let currentYear = 2025;
    let currentMonth = new Date().getMonth(); // Use current month initially

    const monthNames = [
        "January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"
    ];

    function initializeCalendar(year, month) {
        const firstDayOfMonth = new Date(year, month, 1);
        const lastDayOfMonth = new Date(year, month + 1, 0);
        const daysInMonth = lastDayOfMonth.getDate();
        const startDay = firstDayOfMonth.getDay();

        monthYearDisplay.textContent = `${monthNames[month]} ${year}`;
        calendar.innerHTML = '';

        for (let i = 0; i < startDay; i++) {
            calendar.innerHTML += `<div class="day empty"></div>`;
        }

        for (let day = 1; day <= daysInMonth; day++) {
            const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
            const dayElement = document.createElement('div');
            dayElement.classList.add('day');
            dayElement.dataset.date = dateStr;

            const dateLabel = document.createElement('div');
            dateLabel.classList.add('date');
            dateLabel.textContent = day;

            dayElement.appendChild(dateLabel);
            calendar.appendChild(dayElement);
        }

        renderReservations(year, month);
    }

    function renderReservations(year, month) {
        fetch('/queue-management-system/frontend/src/pages/admin/get_reservation.php')
            .then(response => {
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                return response.json();
            })
            .then(reservations => {
                // Clear existing tickets first
                const dayElements = calendar.querySelectorAll('.day');
                dayElements.forEach(day => {
                    const tickets = day.querySelectorAll('.ticket');
                    tickets.forEach(ticket => ticket.remove());
                });

                // Filter and display reservations for the current month and year
                reservations.forEach(reservation => {
                    if (!reservation.dateAssigned) return;
                    
                    // Parse the MySQL datetime format (YYYY-MM-DD HH:mm:ss)
                    const date = new Date(reservation.dateAssigned);
                    const resYear = date.getFullYear();
                    const resMonth = date.getMonth() + 1; // JavaScript months are 0-based
                    const resDay = date.getDate();
                    
                    // Format the date string to match the data-date attribute format
                    const dateStr = `${resYear}-${String(resMonth).padStart(2, '0')}-${String(resDay).padStart(2, '0')}`;

                    if (resYear === year && resMonth === (month + 1)) {
                        const dayElement = calendar.querySelector(`[data-date="${dateStr}"]`);
                        if (dayElement) {
                            const ticketElement = document.createElement('div');
                            ticketElement.classList.add('ticket');
                            // Use the formatted name from PHP
                            ticketElement.textContent = `${reservation.type}: ${reservation.name}`;
                            ticketElement.addEventListener('click', () => {
                                showModal(reservation);
                            });
                            dayElement.appendChild(ticketElement);
                        }
                    }
                });
            })
            .catch(error => {
                console.error('Error fetching reservations:', error);
            });
    }

    function showModal(reservation) {
        let modalContent = `
            <p><strong>Type:</strong> ${reservation.type}</p>
            <p><strong>Name:</strong> ${reservation.name}</p>
            <p><strong>Email:</strong> ${reservation.email}</p>
            <p><strong>Office:</strong> ${reservation.office || 'N/A'}</p>
            <p><strong>Requested Date:</strong> ${reservation.dateRequested || 'N/A'}</p>
            <p><strong>Assigned Date:</strong> ${reservation.dateAssigned || 'N/A'}</p>
            <p><strong>Time:</strong> ${reservation.time || 'N/A'}</p>
        `;
    
        if (reservation.type === 'Vehicle Request') {
            modalContent += `
                <p><strong>Number of Pax:</strong> ${reservation.pax || 'N/A'}</p>
                <p><strong>Pick Up:</strong> ${reservation.pickup || 'N/A'}</p>
                <p><strong>Destination:</strong> ${reservation.destination || 'N/A'}</p>
                <p><strong>Assigned Vehicle:</strong> ${reservation.assignedVehicle || 'N/A'}</p>
                <p><strong>Assigned Driver:</strong> ${reservation.assignedDriver || 'N/A'}</p>
                <p><strong>Remarks:</strong> ${reservation.remarks || 'N/A'}</p>
            `;
        } else if (reservation.type === 'Pest Control Service Request') {
            modalContent += `
                <p><strong>Service Type:</strong> ${reservation.serviceType || 'N/A'}</p>
                <p><strong>Remarks:</strong> ${reservation.remarks || 'N/A'}</p>
            `;
        } else if (reservation.type === 'Facilities & Equipment Reservation') {
            modalContent += `
                <p><strong>Building Location:</strong> ${reservation.buildingLocation || 'N/A'}</p>
                <p><strong>Facility/Room:</strong> ${reservation.facilityType || 'N/A'}</p>
                <p><strong>Table Quantity:</strong> ${reservation.tableQuantity || '0'}</p>
                <p><strong>Chair Quantity:</strong> ${reservation.chairQuantity || '0'}</p>
                <p><strong>Speaker Quantity:</strong> ${reservation.speakerQuantity || '0'}</p>
                <p><strong>Mic Quantity:</strong> ${reservation.micQuantity || '0'}</p>
                <p><strong>Television Quantity:</strong> ${reservation.televisionQuantity || '0'}</p>
                <p><strong>Projector Quantity:</strong> ${reservation.projectorQuantity || '0'}</p>
                <p><strong>Remarks:</strong> ${reservation.remarks || 'N/A'}</p>
            `;
        }
    
        modalBody.innerHTML = modalContent;
        modal.style.display = 'block';
    }

    modalClose.addEventListener('click', () => {
        modal.style.display = 'none';
    });

    prevMonthBtn.addEventListener('click', () => {
        currentMonth--;
        if (currentMonth < 0) {
            currentMonth = 11;
            currentYear--;
        }
        initializeCalendar(currentYear, currentMonth);
    });

    nextMonthBtn.addEventListener('click', () => {
        currentMonth++;
        if (currentMonth > 11) {
            currentMonth = 0;
            currentYear++;
        }
        initializeCalendar(currentYear, currentMonth);
    });

    initializeCalendar(currentYear, currentMonth);

    function downloadCSV() {
        const calendar = document.getElementById('calendar');
        const monthYear = document.getElementById('monthYear').textContent;
        
        let csvContent = "Date,Event Details\n";
        
        // Get all days that have tickets
        const days = calendar.getElementsByClassName('day');
        Array.from(days).forEach(day => {
            const date = day.querySelector('.date')?.textContent;
            const tickets = day.getElementsByClassName('ticket');
            
            if (tickets.length > 0) {
                Array.from(tickets).forEach(ticket => {
                    csvContent += `${monthYear} ${date},${ticket.textContent}\n`;
                });
            }
        });
        
        // Create and trigger download
        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.setAttribute('href', url);
        a.setAttribute('download', `reservations_${monthYear.replace(' ', '_')}.csv`);
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
    }

    document.getElementById('downloadCSV').addEventListener('click', downloadCSV);
});

function logout() {
    window.location.href = 'index.html'; // Redirect to login page
}