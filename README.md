# OutfitLab

Platform e-commerce untuk menjual berbagai jenis pakaian dan aksesori fashion. Aplikasi ini dibangun dengan HTML5, CSS3, JavaScript, dan PHP.

## Deskripsi Project

OutfitLab adalah toko online yang menyediakan katalog produk lengkap meliputi pakaian pria, wanita, anak-anak, aksesori, dan penawaran khusus. Website ini dilengkapi dengan fitur keranjang belanja, checkout, dan sistem manajemen inventori.

## Fitur Utama

- 🛍️ Katalog produk (Pria, Wanita, Anak, Aksesori, Sale)
- 🛒 Keranjang belanja dengan manajemen stok real-time
- 💳 Sistem checkout dan pesanan
- 📧 Fitur berlangganan newsletter
- 📦 Manajemen produk dan inventori
- 🎨 Desain responsif dan modern

## Struktur Project

```
OutfitLab/
├── assets/                 # File statis dan resources
│   ├── css/
│   │   └── style.css      # Stylesheet utama
│   └── js/
│       └── script.js      # Script JavaScript utama
├── checkout/               # Halaman dan proses checkout
│   └── checkout.php
├── pages/                  # Halaman utama aplikasi
│   ├── index.html         # Halaman beranda
│   ├── pria.html          # Katalog pakaian pria
│   ├── wanita.html        # Katalog pakaian wanita
│   ├── anak.html          # Katalog pakaian anak
│   ├── accessories.html   # Katalog aksesori
│   ├── cart.html          # Halaman keranjang belanja
│   └── sale.html          # Halaman penawaran khusus
├── php/                    # Backend dan logika aplikasi
│   ├── koneksi.php        # Koneksi database
│   ├── get_all_products.php    # API untuk mengambil semua produk
│   ├── get_stock.php           # API untuk mengecek stok
│   ├── proses_beli.php         # Proses pembayaran/pembelian
│   └── subscribe.php           # Proses berlangganan newsletter
├── storage/                # Penyimpanan data aplikasi
│   └── subscribe_log.txt   # Log berlangganan pengguna
├── uploads/                # Direktori upload file
└── README.md              # File dokumentasi (ini)
```

## Teknologi yang Digunakan

- **Frontend:**
  - HTML5
  - CSS3
  - JavaScript (Vanilla)

- **Backend:**
  - PHP
  - MySQL (via koneksi database)

- **Server:**
  - Apache (XAMPP)

## Persyaratan Sistem

- XAMPP atau server lokal lainnya dengan PHP dan MySQL
- Web browser modern
- PHP 7.0 atau lebih tinggi

## Instalasi

1. **Clone atau download project**


2. **Setup database**
   - Pastikan MySQL server berjalan (XAMPP Control Panel)
   - Buat database dan tabel yang diperlukan
   - Update credential di `php/koneksi.php`

3. **Jalankan aplikasi**
   - Buka browser dan akses: `http://localhost/OutfitLab/pages/index.html`

## Konfigurasi Database

File `php/koneksi.php` berisi konfigurasi koneksi database. Pastikan detail berikut sesuai dengan setup Anda:
- Host
- Username
- Password
- Nama database

## API Endpoints

### Get All Products
```
GET php/get_all_products.php
```
Mengambil semua data produk dari database.

### Check Stock
```
GET php/get_stock.php?product_id=ID
```
Mengecek ketersediaan stok produk tertentu.

### Process Purchase
```
POST php/proses_beli.php
```
Memproses pesanan belanja.

### Newsletter Subscription
```
POST php/subscribe.php
```
Mendaftarkan email untuk newsletter.

## Penggunaan

1. **Browsing Produk**
   - Akses halaman kategori (Pria, Wanita, Anak, Aksesori)
   - Pilih produk yang diinginkan

2. **Keranjang Belanja**
   - Tambahkan produk ke keranjang
   - Lihat `pages/cart.html` untuk mengelola keranjang

3. **Checkout**
   - Proses checkout di `checkout/checkout.php`
   - Ikuti instruksi pembayaran

4. **Berlangganan**
   - Masukkan email di form berlangganan
   - Konfirmasi akan disimpan di `storage/subscribe_log.txt`

## File Penting

| File | Fungsi |
|------|--------|
| `pages/index.html` | Halaman landing utama |
| `assets/css/style.css` | Styling keseluruhan aplikasi |
| `assets/js/script.js` | Interaktivitas frontend |
| `php/koneksi.php` | Koneksi dan query database |
| `php/proses_beli.php` | Business logic pembelian |

## Troubleshooting

**Database Connection Error**
- Pastikan MySQL server berjalan
- Verifikasi credential di `php/koneksi.php`

**File Upload Error**
- Pastikan direktori `uploads/` memiliki permission 777
- Cek ukuran file yang diupload

**Items Not Showing**
- Verifikasi data di database
- Cek kembali endpoint API di `php/get_all_products.php`

## Catatan Pengembangan

- Pastikan semua input dari user di-sanitasi untuk keamanan
- Gunakan prepared statements untuk query database
- Implementasikan HTTPS untuk bertransaksi sensitif
- Log semua aktivitas penting untuk debugging

## Informasi Tambahan

Project ini dibuat untuk memenuhi tugas akhir mata kuliah Pemrograman Web Fundamental I


---


