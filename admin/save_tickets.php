<?php
// Add these debugging lines at the start of the file
error_log("Request received in save_tickets.php");
$raw_data = file_get_contents("php://input");
error_log("Raw data received: " . $raw_data);
$data = json_decode($raw_data, true);
error_log("Decoded data: " . print_r($data, true));

header("Content-Type: application/json");

// Enable error reporting for debugging (disable in production)
ini_set('display_errors', 1);
error_reporting(E_ALL);

// Include the database connection file
include('../../../../database/qm_db.php');

// Check if we have either the required fields for a new ticket or an ID for updating
if ($data && (
    (isset($data['name'], $data['description'], $data['office'], $data['buildingLocation'], $data['category'], $data['createdTime'])) ||
    (isset($data['id'], $data['status']))
)) {

    // Extract and sanitize fields
    $ticketId = isset($data['id']) ? intval($data['id']) : null;
    
    // If we're updating an existing ticket
    if ($ticketId) {
        $status = $conn->real_escape_string($data['status']);
        $closedTime = ($status === 'Closed') 
            ? "'" . date("Y-m-d H:i:s") . "'"
            : "NULL";
            
        $sql = "UPDATE tickets 
                SET status = '$status',
                    closed_time = $closedTime
                WHERE id = $ticketId";
    } else {
        $name             = $conn->real_escape_string($data['name']);
        $description      = $conn->real_escape_string($data['description']);
        $office           = $conn->real_escape_string($data['office']);
        $buildingLocation = $conn->real_escape_string($data['buildingLocation']);
        $category         = $conn->real_escape_string($data['category']);
        
        // Default status is "Open" if not provided
        $status = isset($data['status']) ? $conn->real_escape_string($data['status']) : "Open";
        
        // Responsible may be sent as an array; join into a comma-separated string if so
        $responsible = "";
        if (isset($data['responsible'])) {
            if (is_array($data['responsible'])) {
                $responsible = $conn->real_escape_string(implode(", ", $data['responsible']));
            } else {
                $responsible = $conn->real_escape_string($data['responsible']);
            }
        }
        
        // Convert createdTime (ISO string) to MySQL/MariaDB DATETIME format
        $createdTime = date("Y-m-d H:i:s", strtotime($data['createdTime']));
        
        // For closedTime, if provided and non-empty, convert it; otherwise set to NULL
        $closedTime = (isset($data['closedTime']) && $data['closedTime'] !== "")
                      ? "'" . $conn->real_escape_string(date("Y-m-d H:i:s", strtotime($data['closedTime']))) . "'"
                      : "NULL";

        // Build the SQL INSERT query for the tickets table
        $sql = "INSERT INTO tickets 
                (name, description, office, building_location, category, status, responsible, created_time, closed_time)
                VALUES ('$name', '$description', '$office', '$buildingLocation', '$category', '$status', '$responsible', '$createdTime', $closedTime)";
    }

    if ($conn->query($sql) === TRUE) {
        echo json_encode(["success" => true, "message" => ($ticketId ? "Ticket updated successfully." : "Ticket saved successfully.")]);
    } else {
        echo json_encode(["success" => false, "error" => "Database error: " . $conn->error]);
    }
} else {
    echo json_encode(["success" => false, "error" => "No data received or missing required fields."]);
}

$conn->close();
?>
