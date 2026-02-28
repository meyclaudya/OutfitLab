<?php
header('Content-Type: application/json');

// Enable error reporting for debugging
error_reporting(E_ALL);
ini_set('display_errors', 1);

// Log file path
$logFile = 'subscribe_log.txt';

// Function to write log
function writeLog($message) {
    global $logFile;
    $timestamp = date('Y-m-d H:i:s');
    file_put_contents($logFile, "[$timestamp] $message\n", FILE_APPEND);
}

// Log start of script
writeLog("Script started");

// Koneksi ke database
$conn = new mysqli('localhost', 'root', '', 'db_toko');

// Cek koneksi
if ($conn->connect_error) {
    writeLog("Database connection failed: " . $conn->connect_error);
    die(json_encode([
        'success' => false,
        'message' => 'Koneksi database gagal: ' . $conn->connect_error
    ]));
}

writeLog("Database connected successfully");

// Terima data dari POST request
$data = json_decode(file_get_contents('php://input'), true);
$email = $data['email'] ?? '';

writeLog("Processed email: " . $email);

// Validasi email
if (empty($email) || !filter_var($email, FILTER_VALIDATE_EMAIL)) {
    writeLog("Invalid email format: " . $email);
    die(json_encode([
        'success' => false,
        'message' => 'Email tidak valid'
    ]));
}

try {
    // Cek apakah email sudah terdaftar
    $checkQuery = "SELECT id FROM subscribers WHERE email = ?";
    writeLog("Checking existing email with query: " . $checkQuery);
    
    $stmt = $conn->prepare($checkQuery);
    if (!$stmt) {
        throw new Exception("Prepare statement error: " . $conn->error);
    }
    
    $stmt->bind_param("s", $email);
    $stmt->execute();
    $result = $stmt->get_result();
    
    if ($result->num_rows > 0) {
        writeLog("Email already exists: " . $email);
        die(json_encode([
            'success' => false,
            'message' => 'Email sudah terdaftar'
        ]));
    }
    
    // Insert email baru
    $insertQuery = "INSERT INTO subscribers (email) VALUES (?)";
    writeLog("Inserting new email with query: " . $insertQuery);
    
    $stmt = $conn->prepare($insertQuery);
    if (!$stmt) {
        throw new Exception("Prepare statement error: " . $conn->error);
    }
    
    $stmt->bind_param("s", $email);
    
    if ($stmt->execute()) {
        writeLog("Email successfully inserted: " . $email);
        echo json_encode([
            'success' => true,
            'message' => 'Terima kasih telah berlangganan newsletter kami!'
        ]);
    } else {
        throw new Exception('Gagal menyimpan data: ' . $stmt->error);
    }
    
} catch (Exception $e) {
    writeLog("Error occurred: " . $e->getMessage());
    echo json_encode([
        'success' => false,
        'message' => 'Terjadi kesalahan: ' . $e->getMessage()
    ]);
}

$stmt->close();
$conn->close();
writeLog("Script completed");
?> 