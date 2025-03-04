<?php
// Prevent any output before JSON response
error_reporting(0);
ini_set('display_errors', 0);

$servername = "localhost";
$username = "root";  // Default MySQL username in XAMPP
$password = "";      // Default MySQL password in XAMPP (empty by default)
$dbname = "queuemanagementsystem";  // The name of your database
$port = "3308";  // The number of port
// Create connection
$conn = new mysqli("localhost", "root", "", "queuemanagementsystem","3308");

if ($conn->connect_error) {
    // Log error instead of displaying it
    error_log("Connection failed: " . $conn->connect_error);
    die(json_encode(['success' => false, 'message' => 'Database connection failed']));
}

// Check if tickets table has responsible column
$check_column = "SHOW COLUMNS FROM tickets LIKE 'responsible'";
$result = $conn->query($check_column);

if ($result->num_rows == 0) {
    // Add responsible column if it doesn't exist
    $alter_table = "ALTER TABLE tickets ADD COLUMN responsible TEXT";
    if (!$conn->query($alter_table)) {
        die("Error adding responsible column: " . $conn->error);
    }
}

// Do NOT call $conn->close() here!
?>
