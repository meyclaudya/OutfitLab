<?php
header('Content-Type: application/json');

require_once 'koneksi.php';

// Koneksi ke database
$host = 'localhost';
$dbname = 'db_toko';
$username = 'root';
$password = '';

try {
    $pdo = new PDO("mysql:host=$host;dbname=$dbname", $username, $password);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    
    // Ambil data cart dari POST request
    $cartData = json_decode($_POST['cart'], true);
    
    if (!$cartData) {
        throw new Exception('Invalid cart data');
    }
    
    // Mulai transaksi
    $pdo->beginTransaction();

    $total = 0;
    $success = true;

    // Update stok dan hitung total
    foreach ($cartData as $item) {
        // Hitung total
        $price = (int) preg_replace('/[^0-9]/', '', $item['price']);
        $total += $price * $item['quantity'];
        
        // Ekstrak ID asli dari format baru
        $originalId = substr($item['id'], 2); // Hapus prefix 'p_' atau 's_'
        
        if ($item['isSale']) {
            // Cek dan update stok produk sale
            $stmt = $pdo->prepare("SELECT stok FROM produk_sale WHERE id = ?");
            $stmt->execute([$originalId]);
            $currentStock = $stmt->fetchColumn();
            
            if ($currentStock === false) {
                throw new Exception('Produk sale tidak ditemukan: ' . $originalId);
            }
            if ($currentStock < $item['quantity']) {
                throw new Exception('Stok tidak mencukupi untuk produk sale: ' . $originalId);
            }
            $stmt = $pdo->prepare("UPDATE produk_sale SET stok = stok - ? WHERE id = ?");
            $stmt->execute([$item['quantity'], $originalId]);
        } else {
            // Cek dan update stok produk biasa
            $stmt = $pdo->prepare("SELECT stok FROM produk WHERE id = ?");
            $stmt->execute([$originalId]);
            $currentStock = $stmt->fetchColumn();
            
            if ($currentStock === false) {
                throw new Exception('Produk tidak ditemukan: ' . $originalId);
            }
            if ($currentStock < $item['quantity']) {
                throw new Exception('Stok tidak mencukupi untuk produk: ' . $originalId);
            }
            $stmt = $pdo->prepare("UPDATE produk SET stok = stok - ? WHERE id = ?");
            $stmt->execute([$item['quantity'], $originalId]);
        }
    }
    
    // Jika semua berhasil, commit transaksi
    $pdo->commit();
    
    // Kirim response sukses
    echo json_encode([
        'success' => true,
        'total' => $total
    ]);
    
} catch(Exception $e) {
    // Jika terjadi error, rollback transaksi
    if ($pdo->inTransaction()) {
        $pdo->rollBack();
    }
    
    // Kirim response error
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'error' => $e->getMessage()
    ]);
}
?> 