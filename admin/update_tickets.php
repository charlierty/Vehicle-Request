<?php
session_start();
include('../../../../database/qm_db.php');

// Temporarily disable session check for testing
// Remove or modify these lines when implementing proper authentication
// if (!isset($_SESSION['user_id']) || $_SESSION['role'] !== 'admin') {
//     header('Content-Type: application/json');
//     echo json_encode(['error' => 'Unauthorized access']);
//     exit();
// }

// Enable detailed error reporting
error_reporting(E_ALL);
ini_set('display_errors', 1);

// Handle GET request to fetch ticket data
if ($_SERVER['REQUEST_METHOD'] === 'GET' && isset($_GET['id'])) {
    $ticket_id = mysqli_real_escape_string($conn, $_GET['id']);
    $query = "SELECT t.*, u.username as assigned_username, u.id as assigned_id 
              FROM tickets t 
              LEFT JOIN users u ON t.assigned_to = u.id 
              WHERE t.id = '$ticket_id'";
    
    $result = mysqli_query($conn, $query);
    
    if ($ticket = mysqli_fetch_assoc($result)) {
        // Add additional user information
        $ticket['assigned_to'] = [
            'id' => $ticket['assigned_id'],
            'username' => $ticket['assigned_username']
        ];
        unset($ticket['assigned_id']); // Clean up temporary field
        
        header('Content-Type: application/json');
        echo json_encode(['success' => true, 'ticket' => $ticket]);
    } else {
        header('Content-Type: application/json');
        echo json_encode(['success' => false, 'error' => 'Ticket not found']);
    }
    exit();
}

// Handle POST request to update ticket
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    try {
        // Get and decode the JSON data
        $raw_data = file_get_contents('php://input');
        $data = json_decode($raw_data, true);
        
        // Log the received data
        error_log("Received data: " . print_r($data, true));
        
        // Validate required fields
        if (!isset($data['ticket_id'])) {
            throw new Exception("Missing ticket_id");
        }
        
        $ticket_id = mysqli_real_escape_string($conn, $data['ticket_id']);
        $status = mysqli_real_escape_string($conn, $data['status'] ?? 'Open');
        $responsible = mysqli_real_escape_string($conn, $data['comments'] ?? '');

        // First check if the ticket exists
        $check_query = "SELECT id FROM tickets WHERE id = '$ticket_id'";
        $check_result = mysqli_query($conn, $check_query);
        
        if (!$check_result || mysqli_num_rows($check_result) === 0) {
            throw new Exception("Ticket ID $ticket_id not found");
        }

        // Simplified update query without assigned_to
        $update_query = "UPDATE tickets SET 
                        status = '$status',
                        responsible = '$responsible'
                        WHERE id = '$ticket_id'";
        
        error_log("Update query: " . $update_query);
        
        if (!mysqli_query($conn, $update_query)) {
            throw new Exception("Database update failed: " . mysqli_error($conn));
        }

        // Simplified fetch query without user join
        $fetch_query = "SELECT * FROM tickets WHERE id = '$ticket_id'";
        $result = mysqli_query($conn, $fetch_query);
        
        if (!$result) {
            throw new Exception("Failed to fetch updated ticket: " . mysqli_error($conn));
        }

        $updated_ticket = mysqli_fetch_assoc($result);
        
        if (!$updated_ticket) {
            throw new Exception("Failed to fetch updated ticket data");
        }

        // Return success response
        header('Content-Type: application/json');
        echo json_encode([
            'success' => true,
            'message' => 'Ticket updated successfully',
            'ticket' => $updated_ticket,
            'debug' => [
                'received_data' => $data,
                'ticket_id' => $ticket_id,
                'responsible' => $responsible
            ]
        ]);

    } catch (Exception $e) {
        header('Content-Type: application/json');
        echo json_encode([
            'success' => false,
            'error' => $e->getMessage(),
            'debug' => [
                'received_data' => $data ?? null,
                'ticket_id' => $ticket_id ?? null,
                'responsible' => $responsible ?? null,
                'sql_error' => mysqli_error($conn)
            ]
        ]);
        error_log("Error in update_tickets.php: " . $e->getMessage());
    }
    exit();
}

// If not POST, return error
header('Content-Type: application/json');
echo json_encode(['error' => 'Invalid request method']);
exit();
?>