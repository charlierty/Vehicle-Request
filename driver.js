document.addEventListener('DOMContentLoaded', () => {
    const calendar = document.getElementById('calendar');
    const monthYearDisplay = document.getElementById('monthYear');
    const prevMonthBtn = document.getElementById('prevMonth');
    const nextMonthBtn = document.getElementById('nextMonth');
    const modal = document.getElementById('reservationModal');
    const modalBody = document.getElementById('modalBody');
    const modalClose = document.getElementById('modalClose');

    let currentYear = new Date().getFullYear();
    let currentMonth = new Date().getMonth();

    const monthNames = [
        "January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"
    ];

    // Add this color mapping at the top with your other constants
    const driverColors = {
        'Ronald Cañas': '#FF6B6B',     // Red
        'Hernan Cañas': '#4ECDC4',     // Turquoise
        'Adachi Segundo': '#95A5A6',   // Gray
        'Ronald Pagaduan': '#F7D794'   // Light Orange
    };

    function initializeCalendar(year, month) {
        const firstDayOfMonth = new Date(year, month, 1);
        const lastDayOfMonth = new Date(year, month + 1, 0);
        const daysInMonth = lastDayOfMonth.getDate();
        const startDay = firstDayOfMonth.getDay();

        monthYearDisplay.textContent = `${monthNames[month]} ${year}`;
        calendar.innerHTML = '';

        // Add day labels
        const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        days.forEach(day => {
            calendar.innerHTML += `<div class="day-label">${day}</div>`;
        });

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

        renderVehicleRequests(year, month);
    }

    function renderVehicleRequests(year, month) {
        fetch('/queue-management-system/frontend/src/pages/driver/get_vehicle_requests.php')
            .then(response => {
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                return response.json();
            })
            .then(requests => {
                // Clear existing tickets first
                const dayElements = calendar.querySelectorAll('.day');
                dayElements.forEach(day => {
                    const tickets = day.querySelectorAll('.ticket');
                    tickets.forEach(ticket => ticket.remove());
                });

                requests.forEach(request => {
                    if (!request.dateAssigned) return;
                    
                    const date = new Date(request.dateAssigned);
                    const resYear = date.getFullYear();
                    const resMonth = date.getMonth() + 1;
                    const resDay = date.getDate();
                    
                    const dateStr = `${resYear}-${String(resMonth).padStart(2, '0')}-${String(resDay).padStart(2, '0')}`;

                    if (resYear === year && resMonth === (month + 1)) {
                        const dayElement = calendar.querySelector(`[data-date="${dateStr}"]`);
                        if (dayElement) {
                            const ticketElement = document.createElement('div');
                            ticketElement.classList.add('ticket');
                            // Add background color based on driver
                            ticketElement.style.backgroundColor = driverColors[request.assignedDriver] || '#DDD';
                            // Add contrasting text color for better readability
                            ticketElement.style.color = '#000';
                            // Format time to show only HH:mm
                            const timeOnly = request.time.split(':').slice(0, 2).join(':');
                            ticketElement.textContent = `${timeOnly} - ${request.assignedDriver} / ${request.assignedVehicle}`;
                            ticketElement.addEventListener('click', () => {
                                showModal(request);
                            });
                            dayElement.appendChild(ticketElement);
                        }
                    }
                });
            })
            .catch(error => {
                console.error('Error fetching vehicle requests:', error);
            });
    }

    function showModal(request) {
        // Format time to show only HH:mm
        const timeOnly = request.time.split(':').slice(0, 2).join(':');
        const modalContent = `
            <p><strong>Requester:</strong> ${request.name}</p>
            <p><strong>Office:</strong> ${request.office || 'N/A'}</p>
            <p><strong>Date:</strong> ${request.dateAssigned || 'N/A'}</p>
            <p><strong>Time:</strong> ${timeOnly}</p>
            <p><strong>Number of Passengers:</strong> ${request.pax || 'N/A'}</p>
            <p><strong>Pick Up Point:</strong> ${request.pickup || 'N/A'}</p>
            <p><strong>Destination:</strong> ${request.destination || 'N/A'}</p>
            <p><strong>Assigned Vehicle:</strong> ${request.assignedVehicle || 'N/A'}</p>
            <p><strong>Assigned Driver:</strong> ${request.assignedDriver || 'N/A'}</p>
            <p><strong>Remarks:</strong> ${request.remarks || 'N/A'}</p>
        `;
    
        modalBody.innerHTML = modalContent;
        modal.style.display = 'block';
    }

    // Add event listener for the Escape key
    document.addEventListener('keydown', (event) => {
        if (event.key === 'Escape' && modal.style.display === 'block') {
            modal.style.display = 'none';
        }
    });

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

    // Initialize the calendar
    initializeCalendar(currentYear, currentMonth);
});

function logout() {
    window.location.href = '/queue-management-system/index.html';
}
