<?php
header("Content-Type: application/json");

// Enable error reporting for debugging (disable or log errors in production)
ini_set('display_errors', 1);
error_reporting(E_ALL);

// Include the database connection file (adjust the path as needed)
include('database/qm_db.php');

// Read the JSON payload from the POST request
$data = json_decode(file_get_contents("php://input"), true);

// Initialize default response and log variables
$response = [];
$status = "failure"; // Default log status
$log_username = "";  // To store username for logging
$ip = $_SERVER['REMOTE_ADDR']; // Get the user's IP address

if ($data && isset($data['username'], $data['password'])) {
    // Sanitize the inputs
    $log_username = $conn->real_escape_string($data['username']);
    $log_password = $conn->real_escape_string($data['password']);

    // Query including role check
    $sql = "SELECT * FROM users WHERE username='$log_username' LIMIT 1";
    $result = $conn->query($sql);

    if ($result && $result->num_rows > 0) {
        $user = $result->fetch_assoc();
        // For demonstration purposes, we compare plain text passwords.
        // In production, use password_hash() and password_verify().
        if ($log_password === $user['password']) {
            // Check role and set appropriate redirect
            switch($user['role']) {
                case 'admin':
                    $response = [
                        "success" => true,
                        "redirect" => './frontend/src/pages/admin.html',
                        "role" => "admin"
                    ];
                    break;
                case 'worker':
                    $response = [
                        "success" => true,
                        "redirect" => './frontend/src/pages/worker.html',
                        "role" => "worker"
                    ];
                    break;
                case 'driver':
                    $response = [
                        "success" => true,
                        "redirect" => './frontend/src/pages/driver/driver.html',
                        "role" => "driver"
                    ];
                    break;
                default:
                    $response = ["success" => false, "error" => "Invalid role."];
            }
            $status = "success";
        } else {
            $response = ["success" => false, "error" => "Invalid credentials."];
        }
    } else {
        $response = ["success" => false, "error" => "User not found."];
    }
} else {
    // When login data is incomplete, prepare the error response
    $response = ["success" => false, "error" => "Incomplete login data."];
}

// Log the login attempt if login data was provided
if ($data && isset($data['username'], $data['password'])) {
    $role = isset($user['role']) ? $user['role'] : 'unknown';
    $logQuery = "INSERT INTO login_logs (username, role, status, ip_address) 
                 VALUES ('$log_username', '$role', '$status', '$ip')";
    // You might want to check for errors here in a real application.
    $conn->query($logQuery);
}

// Output the JSON response
echo json_encode($response);

// Close the database connection
$conn->close();
