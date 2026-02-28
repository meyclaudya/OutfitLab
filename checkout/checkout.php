<?php
require_once '../php/koneksi.php';

header('Content-Type: application/json');

try {
    // Get POST data
    $data = json_decode(file_get_contents('php://input'), true);
    
    if (!$data) {
        throw new Exception('Invalid input data');
    }

    // Generate order number (format: ORD-YYYYMMDD-XXXX)
    $orderNumber = 'ORD-' . date('Ymd') . '-' . sprintf('%04d', rand(1, 9999));

    // Start transaction
    $conn->begin_transaction();

    // Insert into orders table
    $stmt = $conn->prepare("INSERT INTO orders (order_number, customer_name, email, phone, address, total_amount, order_date, status) VALUES (?, ?, ?, ?, ?, ?, NOW(), 'pending')");
    
    $stmt->bind_param("sssssd", 
        $orderNumber,
        $data['customer_name'],
        $data['customer_email'],
        $data['customer_phone'],
        $data['customer_address'],
        $data['total_amount']
    );

    if (!$stmt->execute()) {
        throw new Exception('Error creating order: ' . $stmt->error);
    }

    $orderId = $conn->insert_id;

    // Insert order items
    $stmt = $conn->prepare("INSERT INTO order_items (order_id, product_name, quantity, price, subtotal) VALUES (?, ?, ?, ?, ?)");
    
    foreach ($data['items'] as $item) {
        $subtotal = $item['price'] * $item['quantity'];
        $stmt->bind_param("isidi", 
            $orderId,
            $item['title'],
            $item['quantity'],
            $item['price'],
            $subtotal
        );

        if (!$stmt->execute()) {
            throw new Exception('Error creating order item: ' . $stmt->error);
        }

        // Update stock
        $productId = substr($item['id'], 2); // Remove 'p_' or 's_' prefix
        if ($item['isSale']) {
            // Update stock in produk_sale table
            $updateStock = $conn->prepare("UPDATE produk_sale SET stok = stok - ? WHERE id = ?");
            $updateStock->bind_param("ii", $item['quantity'], $productId);
        } else {
            // Update stock in produk table
            $updateStock = $conn->prepare("UPDATE produk SET stok = stok - ? WHERE id = ?");
            $updateStock->bind_param("ii", $item['quantity'], $productId);
        }

        if (!$updateStock->execute()) {
            throw new Exception('Error updating stock: ' . $updateStock->error);
        }
        $updateStock->close();
    }

    // Commit transaction
    $conn->commit();

    // Format WhatsApp message
    $whatsappMessage = "Halo, saya ingin memesan dari OutfitLab\n\n";
    $whatsappMessage .= "Nama: " . $data['customer_name'] . "\n";
    $whatsappMessage .= "Email: " . $data['customer_email'] . "\n";
    $whatsappMessage .= "Telepon: " . $data['customer_phone'] . "\n";
    $whatsappMessage .= "Alamat: " . $data['customer_address'] . "\n\n";
    $whatsappMessage .= "Pesanan:\n";
    
    foreach ($data['items'] as $item) {
        $subtotal = $item['price'] * $item['quantity'];
        $whatsappMessage .= "- " . $item['title'] . " x" . $item['quantity'] . " - Rp" . number_format($subtotal, 0, ',', '.') . "\n";
    }
    
    $whatsappMessage .= "\nTotal: Rp" . number_format($data['total_amount'], 0, ',', '.') . "\n";
    $whatsappMessage .= "No. Order: " . $orderNumber;

    // Encode message for URL
    $encodedMessage = urlencode($whatsappMessage);
    $whatsappUrl = "https://wa.me/text=" . $encodedMessage;

    // Return success response with WhatsApp URL
    echo json_encode([
        'success' => true,
        'message' => 'Order created successfully',
        'order_number' => $orderNumber,
        'whatsapp_url' => $whatsappUrl
    ]);

} catch (Exception $e) {
    // Rollback transaction on error
    if (isset($conn)) {
        $conn->rollback();
    }
    
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => $e->getMessage()
    ]);
}

$conn->close();
?> 