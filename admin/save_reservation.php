<?php
// Include database connection
require_once '../../../../database/qm_db.php';

// Add error handling for database connection
if (!isset($conn) || $conn->connect_error) {
    die(json_encode([
        'success' => false,
        'error' => 'Database connection failed',
        'details' => isset($conn) ? $conn->connect_error : 'Connection not established'
    ]));
}

// Get JSON data from the request
$jsonData = file_get_contents('php://input');
$data = json_decode($jsonData, true);

// Validate JSON data
if (!$data || !isset($data['type'])) {
    die(json_encode(['success' => false, 'error' => 'Invalid or missing data']));
}

// Common fields for all reservation types
$sql = "INSERT INTO reservations (
    type, 
    name, 
    email, 
    office, 
    date_requested, 
    date_assigned, 
    time_requested";

$values = " VALUES (?, ?, ?, ?, ?, ?, ?";
$types = "sssssss";
$params = [
    $data['type'],
    $data['name'],
    $data['email'],
    $data['office'],
    $data['dateRequested'],
    $data['dateAssigned'],
    $data['time']
];

// Add type-specific fields
switch ($data['type']) {
    case 'Vehicle Request':
        $sql .= ", number_of_pax, pickup, destination, assigned_vehicle, assigned_driver, remarks";
        $values .= ", ?, ?, ?, ?, ?, ?";
        $types .= "isssss";
        array_push($params,
            intval($data['numberOfPax']),
            $data['pickup'],
            $data['destination'],
            $data['assignedVehicle'],
            $data['assignedDriver'],
            $data['remarks']
        );
        break;

    case 'Pest Control Service Request':
        $sql .= ", service_type, remarks";
        $values .= ", ?, ?";
        $types .= "ss";
        array_push($params,
            $data['serviceType'],
            $data['remarks']
        );
        break;

    case 'Facilities & Equipment Reservation':
        $sql .= ", building_location, facility_type, table_quantity, chair_quantity, 
                  speaker_quantity, mic_quantity, television_quantity, projector_quantity, remarks";
        $values .= ", ?, ?, ?, ?, ?, ?, ?, ?, ?";
        $types .= "ssiiiiiis";
        array_push($params,
            $data['buildingLocation'],
            $data['facilityType'],
            intval($data['tableQuantity']),
            intval($data['chairQuantity']),
            intval($data['speakerQuantity']),
            intval($data['micQuantity']),
            intval($data['televisionQuantity']),
            intval($data['projectorQuantity']),
            $data['remarks']
        );
        break;
}

// Complete the SQL statement
$sql .= ")" . $values . ")";

// Prepare and execute the statement
$stmt = $conn->prepare($sql);
if (!$stmt) {
    die(json_encode([
        'success' => false,
        'error' => 'Statement preparation failed',
        'details' => $conn->error
    ]));
}

$stmt->bind_param($types, ...$params);

if ($stmt->execute()) {
    echo json_encode(['success' => true]);
} else {
    echo json_encode([
        'success' => false,
        'error' => 'Database error',
        'details' => $stmt->error
    ]);
}

$stmt->close();
$conn->close();
?> 