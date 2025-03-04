<?php
header("Content-Type: application/json");

// Enable error reporting for debugging (disable in production)
ini_set('display_errors', 1);
error_reporting(E_ALL);

// Include the database connection file (adjust the relative path if needed)
include('../../../../database/qm_db.php');

// Read JSON input from the POST request
$data = json_decode(file_get_contents("php://input"), true);

if ($data && isset($data['id']) && isset($data['closedTime'])) {
    // Ticket ID is required for the update
    $ticketId = (int)$data['id'];
    
    // Set the status to "Closed"
    $status = "Closed";
    
    // Convert the provided closedTime (assumed to be in a valid datetime string format)
    // to MySQL DATETIME format ("YYYY-MM-DD HH:MM:SS")
    $closedTime = date("Y-m-d H:i:s", strtotime($data['closedTime']));
    $closedTimeEscaped = "'" . $conn->real_escape_string($closedTime) . "'";
    
    // Build the UPDATE query
    $sql = "UPDATE tickets 
            SET status = '$status', closed_time = $closedTimeEscaped 
            WHERE id = $ticketId";
    
    if ($conn->query($sql) === TRUE) {
        echo json_encode(["success" => true, "message" => "Ticket closed successfully."]);
    } else {
        echo json_encode(["success" => false, "error" => "Database error: " . $conn->error]);
    }
} else {
    echo json_encode(["success" => false, "error" => "No valid data received."]);
}

$conn->close();
?>
