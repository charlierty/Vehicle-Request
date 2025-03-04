<?php
// Enable error logging
ini_set('log_errors', 1);
ini_set('error_log', '../../../logs/php-error.log');

// For debugging purposes, temporarily enable error display
ini_set('display_errors', 1);
error_reporting(E_ALL);

// Set headers
header('Content-Type: application/json');

try {
    // Log incoming request
    error_log("Delete request received");
    
    // Include database connection
    require_once '../../../../database/qm_db.php';
    
    // Verify database connection
    if (!isset($conn)) {
        throw new Exception('Database connection not established');
    }
    
    if ($conn->connect_error) {
        throw new Exception('Database connection failed: ' . $conn->connect_error);
    }

    // Verify table exists
    $table_check = $conn->query("SHOW TABLES LIKE 'tickets'");
    if ($table_check->num_rows === 0) {
        throw new Exception('Tickets table does not exist');
    }

    // Get and validate input
    $input = file_get_contents('php://input');
    if (!$input) {
        throw new Exception('No input received');
    }

    $data = json_decode($input, true);
    if (json_last_error() !== JSON_ERROR_NONE) {
        throw new Exception('Invalid JSON: ' . json_last_error_msg());
    }

    if (!isset($data['ticket_id'])) {
        throw new Exception('Ticket ID is required');
    }

    $ticket_id = intval($data['ticket_id']);
    if ($ticket_id <= 0) {
        throw new Exception('Invalid ticket ID');
    }

    // First check if ticket exists
    $check_stmt = $conn->prepare("SELECT id FROM tickets WHERE id = ?");
    if (!$check_stmt) {
        throw new Exception('Failed to prepare check statement: ' . $conn->error);
    }

    $check_stmt->bind_param("i", $ticket_id);
    $check_stmt->execute();
    $check_result = $check_stmt->get_result();
    
    if ($check_result->num_rows === 0) {
        throw new Exception('Ticket not found');
    }
    $check_stmt->close();

    // Proceed with deletion
    $delete_stmt = $conn->prepare("DELETE FROM tickets WHERE id = ?");
    if (!$delete_stmt) {
        throw new Exception('Failed to prepare delete statement: ' . $conn->error);
    }

    $delete_stmt->bind_param("i", $ticket_id);
    
    if (!$delete_stmt->execute()) {
        throw new Exception('Failed to execute delete: ' . $delete_stmt->error);
    }

    if ($delete_stmt->affected_rows > 0) {
        $response = [
            "success" => true,
            "message" => "Ticket {$ticket_id} deleted successfully"
        ];
    } else {
        throw new Exception('No rows were deleted');
    }

    $delete_stmt->close();
    
    // Log response
    error_log("Sending response: " . json_encode($response));
    
    // Send response
    echo json_encode($response);

} catch (Exception $e) {
    error_log("Delete ticket error: " . $e->getMessage());
    
    $error_response = [
        "success" => false,
        "error" => $e->getMessage(),
        "details" => "Please check the server logs for more information"
    ];
    
    http_response_code(500);
    echo json_encode($error_response);
}

// Close connection if it exists
if (isset($conn)) {
    $conn->close();
}
?>