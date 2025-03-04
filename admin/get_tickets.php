<?php
header("Content-Type: application/json");
ini_set('display_errors', 1);
error_reporting(E_ALL);

// Include the database connection file
// Adjust the relative path if necessary.
include('../../../../database/qm_db.php');

// Build and execute the query to fetch tickets
$sql = "SELECT * FROM tickets ORDER BY id ASC";
$result = $conn->query($sql);

// Check for query errors
if (!$result) {
    echo json_encode(["success" => false, "error" => $conn->error]);
    $conn->close();
    exit();
}

// Collect all tickets into an array
$tickets = [];
while ($row = $result->fetch_assoc()) {
    $tickets[] = $row;
}

// Output the tickets as JSON
echo json_encode($tickets);

// Close the database connection
$conn->close();
?>
