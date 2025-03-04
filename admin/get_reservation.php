<?php
// Enable error reporting for debugging
error_reporting(E_ALL);
ini_set('display_errors', 1);

try {
    require_once '../../../../database/qm_db.php';

    // Set headers for JSON response
    header('Content-Type: application/json');

    // Check if connection exists and is valid
    if (!isset($conn) || $conn->connect_error) {
        throw new Exception("Database connection failed: " . ($conn->connect_error ?? 'Connection not established'));
    }

    // Prepare SQL query to get all reservations
    $sql = "SELECT * FROM reservations ORDER BY created_at DESC";

    $result = $conn->query($sql);

    if (!$result) {
        throw new Exception("Query failed: " . $conn->error);
    }

    $reservations = [];
    while ($row = $result->fetch_assoc()) {
        // Base reservation data
        $reservation = [
            'type' => $row['type'],
            'name' => $row['name'],
            'email' => $row['email'],
            'office' => $row['office'],
            'dateRequested' => $row['date_requested'],
            'dateAssigned' => $row['date_assigned'],
            'time' => $row['time_requested'],
            'remarks' => $row['remarks'] ?? '',
        ];

        // Add type-specific fields
        switch ($row['type']) {
            case 'Vehicle Request':
                $reservation += [
                    'pax' => $row['number_of_pax'],
                    'pickup' => $row['pickup'],
                    'destination' => $row['destination'],
                    'assignedVehicle' => $row['assigned_vehicle'],
                    'assignedDriver' => $row['assigned_driver']
                ];
                break;

            case 'Pest Control Service Request':
                $reservation += [
                    'serviceType' => $row['service_type']
                ];
                break;

            case 'Facilities & Equipment Reservation':
                $reservation += [
                    'buildingLocation' => $row['building_location'],
                    'facilityType' => $row['facility_type'],
                    'tableQuantity' => $row['table_quantity'],
                    'chairQuantity' => $row['chair_quantity'],
                    'speakerQuantity' => $row['speaker_quantity'],
                    'micQuantity' => $row['mic_quantity'],
                    'televisionQuantity' => $row['television_quantity'],
                    'projectorQuantity' => $row['projector_quantity']
                ];
                break;
        }

        $reservations[] = $reservation;
    }

    echo json_encode($reservations);

} catch (Exception $e) {
    // Log the error
    error_log("Reservation Error: " . $e->getMessage());
    
    // Send error response
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'error' => 'Server error occurred',
        'debug_message' => $e->getMessage()
    ]);
}

if (isset($conn)) {
    $conn->close();
}
?>
