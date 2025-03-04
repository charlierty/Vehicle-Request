function openReservation(type) {
    const reservationFormContainer = document.getElementById('reservationFormContainer');
    const reservationTitle = document.getElementById('reservationTitle');
    const dynamicFields = document.getElementById('dynamicFields');

    // Show the form and update the title
    reservationFormContainer.style.display = 'block';
    reservationTitle.textContent = type;

    // Clear and dynamically add input fields based on reservation type
    dynamicFields.innerHTML = '';

    if (type === 'Vehicle Request') {
        dynamicFields.innerHTML = `
            <div class="mb-3">
                <label for="numberOfPax" class="form-label">Number of Pax:</label>
                <input type="number" id="numberOfPax" class="form-control" required>
            </div>
            <div class="mb-3">
                <label for="pickup" class="form-label">Pick Up:</label>
                <input type="text" id="pickup" class="form-control" required>
            </div>
            <div class="mb-3">
                <label for="destination" class="form-label">Destination:</label>
                <input type="text" id="destination" class="form-control" required>
            </div>
            <div class="mb-3">
                <label for="assignedVehicle" class="form-label">Assigned Vehicle:</label>
                <select id="assignedVehicle" class="form-select" required>
                    <option value="">Select the vehicle</option>
                    <option value="Coaster (28pax maximum)">Coaster (28pax maximum)</option>
                    <option value="Hi-ace (13pax maximum)">Hi-ace (13pax maximum)</option>
                    <option value="Innova (7pax maximum)">Innova (7pax maximum)</option>
                    <option value="L300 (16pax maximum)">L300 (16pax maximum)</option>
                    <option value="Sportivo (7pax maximum)">Sportivo (7pax maximum)</option>
                </select>
            </div>
            <div class="mb-3">
                <label for="assignedDriver" class="form-label">Assigned Driver:</label>
                <select id="assignedDriver" class="form-select" required>
                    <option value="">Select the driver</option>
                    <option value="Ronald Cañas">Ronald Cañas</option>
                    <option value="Hernan Cañas">Hernan Cañas</option>
                    <option value="Adachi Segundo">Adachi Segundo</option>
                    <option value="Ronald Pagaduan">Ronald Pagaduan</option>
                </select>
            </div>
            <div class="mb-3">
                <label for="remarks" class="form-label">Remarks:</label>
                <textarea id="remarks" class="form-control" rows="3"></textarea>
            </div>
        `;
    } else if (type === 'Pest Control Service Request') {
        dynamicFields.innerHTML = `
            <div class="mb-3">
                <label for="serviceType" class="form-label">Service Type:</label>
                <select id="serviceType" class="form-select" required>
                    <option value="">Select the type of service</option>
                    <option value="All types of services">All types of services</option>
                    <option value="Rodent Control">Rodent Control</option>
                    <option value="Insect Control">Insect Control</option>
                    <option value="Termite Control">Termite Control</option>
                </select>
            </div>
            <div class="mb-3">
                <label for="remarks" class="form-label">Remarks:</label>
                <textarea id="remarks" class="form-control" rows="3"></textarea>
            </div>
        `;
    } else if (type === 'Facilities & Equipment Reservation') {
        dynamicFields.innerHTML = `
            <div class="mb-3">
                <label for="buildingLocation" class="form-label">Building Location:</label>
                <select id="buildingLocation" class="form-select" required>
                        <option value="">Select the concern location</option>
                        <option value="Bonifacio P. Sibayan Hall">Bonifacio P. Sibayan Hall</option>
                        <option value="Cafeteria">Cafeteria</option>
                        <option value="Chapel">Chapel</option>
                        <option value="Clinic">Clinic</option>
                        <option value="Culture and Sports Building">Culture and Sports Building</option>
                        <option value="Edilberto P. Dagot Hall">Edilberto P. Dagot Hall</option>
                        <option value="Faculty Center">Faculty Center</option>
                        <option value="Finance Building">Finance Building</option>
                        <option value="Food Stall">Food Stall</option>
                        <option value="Geronima T. Pecson Hall">Geronima T. Pecson Hall</option>
                        <option value="Gusali ng Wika">Gusali ng Wika</option>
                        <option value="Grasslandia">Grasslandia</option>
                        <option value="Gymnasium">Gymnasium</option>
                        <option value="Hostel">Hostel</option>
                        <option value="HRD Annex">HRD Annex</option>
                        <option value="HRD Building (1 storey)">HRD Building (1 storey)</option>
                        <option value="HRD Building (2 storey)">HRD Building (2 storey)</option>
                        <option value="IPEHRDS Faculty Building">IPEHRDS Faculty Building</option>
                        <option value="Linear Park">Linear Park</option>
                        <option value="Maceda Hall">Maceda Hall</option>
                        <option value="New Building">New Building</option>
                        <option value="Normal Hall">Normal Hall</option>
                        <option value="Old ITL Building (2 Storey)">Old ITL Building (2 Storey)</option>
                        <option value="Old ITL Building (4 Storey)">Old ITL Building (4 Storey)</option>
                        <option value="Open Court">Open Court</option>
                        <option value="Overpass">Overpass</option>
                        <option value="Pedro T. Orata Hall">Pedro T. Orata Hall</option>
                        <option value="PNU Quadrangle">PNU Quadrangle</option>
                        <option value="SSSMU Office Guard House">SSSMU Office Guard House</option>
                    </select>
            </div>
            <div class="mb-3">
                <label for="facilityType" class="form-label">Facility/Room:</label>
                <textarea id="facilityType" class="form-control" rows="3"></textarea>
            </div>
            <div class="mb-3">
                <label for="tableQuantity" class="form-label">Table Quantity:</label>
                <input type="number" class="form-control" id="tableQuantity" placeholder="Enter quantity" min="0">
            </div>
                        <div class="mb-3">
                <label for="chairQuantity" class="form-label">Chair Quantity:</label>
                <input type="number" class="form-control" id="chairQuantity" placeholder="Enter quantity" min="0">
            </div>
                        <div class="mb-3">
                <label for="speakerQuantity" class="form-label">Speaker Quantity:</label>
                <input type="number" class="form-control" id="speakerQuantity" placeholder="Enter quantity" min="0">
            <div class="mb-3">
                <label for="micQuantity" class="form-label">Mic Quantity:</label>
                <input type="number" class="form-control" id="micQuantity" placeholder="Enter quantity" min="0">
            </div>
                        <div class="mb-3">
                <label for="televisionQuantity" class="form-label">Television Quantity:</label>
                <input type="number" class="form-control" id="televisionQuantity" placeholder="Enter quantity" min="0">
            </div>
                      <div class="mb-3">
                <label for="projectorQuantity" class="form-label">Projector Quantity:</label>
                <input type="number" class="form-control" id="projectorQuantity" placeholder="Enter quantity" min="0">
            </div>
                        <div class="mb-3">
                <label for="remarks" class="form-label">Remarks:</label>
                <textarea id="remarks" class="form-control" rows="3"></textarea>
            </div>
        `;
    }
}

// Handle form submission
document.getElementById('reservationForm').addEventListener('submit', async function(e) {
    e.preventDefault();
    
    const type = document.getElementById('reservationTitle').textContent;
    const formData = {
        type: type,
        name: document.getElementById('name').value,
        email: document.getElementById('email').value,
        office: document.getElementById('office').value,
        dateRequested: document.getElementById('dateRequested').value,
        dateAssigned: document.getElementById('dateAssigned').value,
        time: document.getElementById('time').value
    };
    
    // Add type-specific fields
    switch(type) {
        case 'Vehicle Request':
            formData.numberOfPax = document.getElementById('numberOfPax').value;
            formData.pickup = document.getElementById('pickup').value;
            formData.destination = document.getElementById('destination').value;
            formData.assignedVehicle = document.getElementById('assignedVehicle').value;
            formData.assignedDriver = document.getElementById('assignedDriver').value;
            formData.remarks = document.getElementById('remarks').value;
            break;
            
        case 'Pest Control Service Request':
            formData.serviceType = document.getElementById('serviceType').value;
            formData.remarks = document.getElementById('remarks').value;
            break;
            
        case 'Facilities & Equipment Reservation':
            formData.buildingLocation = document.getElementById('buildingLocation').value;
            formData.facilityType = document.getElementById('facilityType').value;
            formData.tableQuantity = document.getElementById('tableQuantity').value;
            formData.chairQuantity = document.getElementById('chairQuantity').value;
            formData.speakerQuantity = document.getElementById('speakerQuantity').value;
            formData.micQuantity = document.getElementById('micQuantity').value;
            formData.televisionQuantity = document.getElementById('televisionQuantity').value;
            formData.projectorQuantity = document.getElementById('projectorQuantity').value;
            formData.remarks = document.getElementById('remarks').value;
            break;
    }
    
    try {
        const response = await fetch('save_reservation.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(formData)
        });
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const result = await response.json();
        
        if (result.success) {
            alert('Reservation submitted successfully!');
            document.getElementById('reservationForm').reset();
            document.getElementById('reservationFormContainer').style.display = 'none';
        } else {
            alert('Error: ' + (result.error || 'Unknown error occurred'));
            if (result.details) {
                console.error('Error details:', result.details);
            }
        }
    } catch (error) {
        console.error('Error:', error);
        alert('An error occurred while submitting the reservation. Please check the console for details.');
    }
});


