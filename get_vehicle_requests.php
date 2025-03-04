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

    // Prepare SQL query to get only vehicle requests
    $sql = "SELECT * FROM reservations WHERE type = 'Vehicle Request' AND date_assigned IS NOT NULL ORDER BY date_assigned, time_requested";

    $result = $conn->query($sql);

    if (!$result) {
        throw new Exception("Query failed: " . $conn->error);
    }

    $vehicleRequests = [];
    while ($row = $result->fetch_assoc()) {
        // Format vehicle request data
        $request = [
            'name' => $row['name'],
            'email' => $row['email'],
            'office' => $row['office'],
            'dateRequested' => $row['date_requested'],
            'dateAssigned' => $row['date_assigned'],
            'time' => $row['time_requested'],
            'pax' => $row['number_of_pax'],
            'pickup' => $row['pickup'],
            'destination' => $row['destination'],
            'assignedVehicle' => $row['assigned_vehicle'],
            'assignedDriver' => $row['assigned_driver'],
            'remarks' => $row['remarks'] ?? ''
        ];

        $vehicleRequests[] = $request;
    }

    echo json_encode($vehicleRequests);

} catch (Exception $e) {
    // Log the error
    error_log("Vehicle Request Error: " . $e->getMessage());
    
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