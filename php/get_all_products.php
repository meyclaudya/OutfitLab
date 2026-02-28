<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');

// Koneksi ke database
$host = 'localhost';
$dbname = 'db_toko';
$username = 'root';
$password = '';

$products = [];

try {
    error_log('Attempting database connection...');
    $pdo = new PDO("mysql:host=$host;dbname=$dbname", $username, $password);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    error_log('Database connection successful');
    
    // Ambil produk dari tabel produk (bukan sale), termasuk page_category
    error_log('Fetching from produk table...');
    $stmt_produk = $pdo->query("SELECT id, nama_produk, kategori, harga, stok, gambar, page_category FROM produk");
    if ($stmt_produk) {
        while ($row = $stmt_produk->fetch(PDO::FETCH_ASSOC)) {
            $products[] = [
                'id' => 'p_' . $row['id'],
                'title' => $row['nama_produk'],
                'price' => (int)$row['harga'],
                'stock' => (int)$row['stok'],
                'image' => '../uploads/' . $row['gambar'],
                'category' => strtolower($row['kategori']),
                'isSale' => false,
                'pageCategory' => strtolower($row['page_category'])
            ];
        }
        error_log('Successfully fetched ' . count($products) . ' products from produk table');
    }

    // Ambil produk dari tabel produk_sale, termasuk page_category
    error_log('Fetching from produk_sale table...');
    $stmt_sale = $pdo->query("SELECT id, nama_produk, kategori, harga_asli, harga_sale, stok, gambar, page_category FROM produk_sale");
    if ($stmt_sale) {
        while ($row = $stmt_sale->fetch(PDO::FETCH_ASSOC)) {
            $products[] = [
                'id' => 's_' . $row['id'],
                'title' => $row['nama_produk'],
                'price' => (int)$row['harga_sale'],
                'originalPrice' => (int)$row['harga_asli'],
                'stock' => (int)$row['stok'],
                'image' => '../uploads/' . $row['gambar'],
                'category' => strtolower($row['kategori']),
                'isSale' => true,
                'pageCategory' => strtolower($row['page_category'])
            ];
        }
        error_log('Successfully fetched products from produk_sale table. Total products now: ' . count($products));
    }

    // Pastikan products adalah array
    if (!is_array($products)) {
        $products = [];
    }

    // Debug log
    error_log('Products fetched: ' . json_encode($products));

    // Kirim response dalam format JSON
    echo json_encode($products);

} catch(PDOException $e) {
    error_log('Database error: ' . $e->getMessage());
    http_response_code(500);
    echo json_encode(['error' => 'Database error: ' . $e->getMessage()]);
} catch(Exception $e) {
    error_log('General error: ' . $e->getMessage());
    http_response_code(500);
    echo json_encode(['error' => 'General error: ' . $e->getMessage()]);
}
?> 