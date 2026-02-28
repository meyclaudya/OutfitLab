<?php
header('Content-Type: application/json');

// Koneksi ke database
$host = 'localhost';
$dbname = 'db_toko';
$username = 'root';
$password = '';

try {
    $pdo = new PDO("mysql:host=$host;dbname=$dbname", $username, $password);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    
    // Ambil stok dari produk
    $stmt1 = $pdo->query("SELECT id, stok FROM produk");
    $stocks = $stmt1->fetchAll(PDO::FETCH_KEY_PAIR);

    // Tambahkan prefix 'p_' untuk produk biasa
    $stocks = array_combine(
        array_map(function($key) { return 'p_' . $key; }, array_keys($stocks)),
        array_values($stocks)
    );

    // Ambil stok dari produk_sale
    $stmt2 = $pdo->query("SELECT id, stok FROM produk_sale");
    $saleStocks = $stmt2->fetchAll(PDO::FETCH_KEY_PAIR);

    // Tambahkan prefix 's_' untuk produk sale
    $saleStocks = array_combine(
        array_map(function($key) { return 's_' . $key; }, array_keys($saleStocks)),
        array_values($saleStocks)
    );

    // Gabungkan stok
    $stocks = array_merge($stocks, $saleStocks);

    // Kirim response
    echo json_encode($stocks);

} catch(PDOException $e) {
    // Jika terjadi error, kirim response error
    http_response_code(500);
    echo json_encode(['error' => 'Database error: ' . $e->getMessage()]);
}
?> 