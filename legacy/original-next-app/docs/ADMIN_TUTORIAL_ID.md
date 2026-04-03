# 🧑‍💼 Tutorial Cara Kerja Website ZBK (Untuk Admin)

Dokumen ini menjelaskan **cara menggunakan website ZBK sebagai admin** dengan bahasa sederhana dan langkah yang jelas.

> Target: Admin operasional (bukan programmer).  
> Tujuan: Bisa mengelola booking, kendaraan, dan konten dengan aman.

---

## 1. Masuk ke Halaman Admin (Login)

1. Buka browser (Chrome/Edge) di komputer atau laptop.
2. Ketik alamat website, misalnya:  
   `https://yourdomain.com/login/admin`  
   (Saat development: `http://localhost:3000/login/admin`)
3. Isi data login:
   - **Email**: email admin (contoh: `admin@zbklimo.com`)
   - **Password**: password yang sudah dibuat saat setup
4. Klik tombol **Login / Sign In**.
5. Jika benar, Anda akan diarahkan ke **Dashboard Admin**.

> Jika lupa password, hubungi developer / pemilik sistem untuk reset password.

---

## 2. Mengenal Dashboard Admin

Setelah login, Anda akan melihat **Dashboard** dengan ringkasan data:

- Jumlah **kendaraan** aktif.
- Jumlah **booking** (hari ini, bulan ini, total).
- **Total pendapatan (revenue)**.
- Grafik booking & pendapatan per bulan.
- Statistik seperti:
  - Booking yang **Pending / Confirmed / Completed / Cancelled**
  - Kendaraan yang sering dipakai

Fungsi Dashboard:
- Melihat **kondisi bisnis secara cepat**.
- Mengecek apakah ada **booking baru** yang perlu diproses.

Biasanya di menu kiri/atas ada bagian:
- **Dashboard**
- **Bookings**
- **Vehicles**
- **Blog**
- **Analytics / Reports**
- **Settings**

---

## 3. Mengelola Booking (Paling Penting)

Menu: **Bookings** / **Booking Management**

### 3.1 Melihat Daftar Booking

1. Klik menu **Bookings**.
2. Anda akan melihat tabel berisi:
   - Nama customer
   - Tanggal & jam
   - Kendaraan
   - Jenis layanan (Airport Transfer / Trip / 6 jam / 12 jam)
   - Status booking (Pending, Confirmed, In Progress, Completed, Cancelled)
   - Status pembayaran (Pending, Paid, Failed, Refunded)

### 3.2 Mengubah Status Booking

Contoh alur status:
- **Pending → Confirmed → In Progress → Completed**  
  atau  
- **Pending → Cancelled**

Langkah:
1. Cari booking yang ingin di-update (bisa pakai search / filter).
2. Klik booking tersebut atau tombol **Edit / Detail**.
3. Di halaman detail, ubah:
   - **Booking Status**
   - **Payment Status** (jika perlu)
4. Klik **Save / Update**.

> Tips:  
> - Booking yang sudah dibayar via Stripe biasanya otomatis jadi **Paid**.  
> - Admin hanya perlu pastikan status booking sesuai kondisi lapangan (misalnya: sudah selesai → Completed).

### 3.3 Mengirim Email ke Customer

Di halaman detail booking biasanya ada tombol **Send Email** atau sejenis:

- **Booking Confirmation**: kirim ulang email konfirmasi booking.
- **Payment Confirmation**: kirim info pembayaran telah diterima.
- **Status Update**: kirim informasi jika jadwal berubah / dibatalkan.

Langkah umum:
1. Buka detail booking.
2. Klik tombol **Send Email / Kirim Email**.
3. Pilih jenis email (jika ada pilihan).
4. Konfirmasi pengiriman.

---

## 4. Mengelola Kendaraan (Vehicle Management)

Menu: **Vehicles / Fleet**

### 4.1 Menambah Kendaraan Baru

1. Klik menu **Vehicles**.
2. Klik tombol **Add Vehicle / Tambah Kendaraan**.
3. Isi data kendaraan:
   - Nama kendaraan (misal: Alphard Executive)
   - Tipe / model, tahun, kapasitas penumpang, kapasitas bagasi
   - Nomor polisi, warna
   - Lokasi (jika digunakan)
4. Isi **harga**:
   - `priceAirportTransfer` (Airport Transfer, one-way)
   - `priceTrip` (Trip biasa, one-way)
   - `price6Hours` (Rental 6 jam, round-trip)
   - `price12Hours` (Rental 12 jam, round-trip)
5. Upload beberapa **foto kendaraan** (cover + galeri).
6. Pilih **status kendaraan**:
   - Available (bisa dibooking)
   - In Use (sedang dipakai)
   - Maintenance (sedang perbaikan)
   - Reserved (sudah dipesan di tanggal tertentu)
7. Klik **Save / Create**.

### 4.2 Mengedit atau Menonaktifkan Kendaraan

1. Di menu **Vehicles**, cari kendaraan yang ingin diubah.
2. Klik **Edit**.
3. Ubah data yang diperlukan (harga, status, deskripsi, foto, dll).
4. Klik **Save**.

Jika kendaraan sudah tidak digunakan:
- Ubah status menjadi **Maintenance** atau **non-aktif** (jika ada opsi).
- Atau jangan tampilkan di website (misalnya ada toggle "Show on website").

---

## 5. Mengelola Blog & Konten

Menu: **Blog / Articles**

### 5.1 Menambah Artikel Baru

1. Klik menu **Blog**.
2. Klik **Add Post / New Article**.
3. Isi:
   - **Judul** artikel
   - **Slug** (biasanya otomatis dari judul, misal: `luxury-airport-transfer-bali`)
   - **Kategori / Tags** (optional)
   - **Excerpt** (ringkasan pendek 1–2 kalimat)
4. Tulis konten artikel di editor (bisa pakai format Markdown: heading, bold, dll).
5. Upload hingga **5 gambar**:
   - Gambar pertama = **cover utama**
   - Gambar berikutnya = **galeri** di dalam artikel
6. Pilih status:
   - **Draft** = belum tampil di website
   - **Published** = tampil di website
7. Klik **Save / Publish**.

### 5.2 Mengedit atau Menghapus Artikel

1. Buka menu **Blog**.
2. Cari artikel yang ingin diedit.
3. Klik **Edit**:
   - Ubah teks, gambar, atau status (Draft/Published).
   - Klik **Save**.
4. Untuk menghapus, gunakan tombol **Delete** (jika tersedia) dan konfirmasi.

---

## 6. Melihat Analytics & Reports

Menu: **Analytics / Reports / Dashboard**

Di sini admin bisa:
- Melihat **grafik pendapatan per bulan**.
- Melihat **jumlah booking berdasarkan status**.
- Melihat **kendaraan paling sering dibooking**.
- Memilih **rentang waktu** (1 bulan, 3 bulan, 6 bulan, 1 tahun).

Fungsi utama:
- Membantu pemilik bisnis melihat **tren**.
- Membantu membuat **keputusan** (misal: tambah unit kendaraan tertentu).

---

## 7. Pengaturan Sistem (Settings)

Menu: **Settings**

Yang biasanya bisa diatur:
- **Nama perusahaan**, alamat, nomor telepon.
- **Email admin** (tujuan notifikasi).
- Pengaturan **email SMTP** (sudah diset oleh developer).
- Pengaturan lain yang berkaitan dengan sistem.

Saran:
- Untuk pengaturan teknis (SMTP, Stripe, dsb), **sebaiknya hanya diubah oleh developer** atau orang yang paham teknis.

---

## 8. Alur Kerja Harian yang Disarankan

Berikut contoh alur harian admin menggunakan sistem:

1. **Pagi hari**
   - Login ke admin panel.
   - Cek **Dashboard**: ada booking baru atau tidak.
   - Cek booking dengan status **Pending** → konfirmasi dengan customer (jika perlu) → ubah jadi **Confirmed**.
2. **Sebelum jadwal penjemputan**
   - Cek booking hari ini.
   - Pastikan kendaraan berstatus **Available** untuk jam tersebut.
   - Koordinasi dengan driver.
3. **Setelah perjalanan selesai**
   - Ubah status booking menjadi **Completed**.
   - Pastikan status pembayaran **Paid** (jika sudah lunas).
4. **Akhir hari / mingguan**
   - Cek **Analytics / Reports** untuk melihat revenue.
   - Review jika ada booking yang **belum jelas statusnya**.
   - Update status kendaraan (misalnya masuk Maintenance).

---

## 9. Tips Keamanan Akun Admin

- Jangan membagikan **email & password admin** ke banyak orang.
- Gunakan **password yang kuat** (kombinasi huruf besar, kecil, angka).
- Jika ada staff baru, lebih baik:
  - Buat akun admin baru khusus orang tersebut (jika fitur tersedia),  
    daripada berbagi 1 akun.
- Selalu **logout** setelah selesai menggunakan sistem, terutama jika memakai komputer umum.
- Jika mencurigai ada akses yang tidak dikenal, segera ganti password dan hubungi developer.

---

## 10. Jika Terjadi Masalah

Jika admin mengalami masalah, contoh:
- Tidak bisa login.
- Booking tidak masuk padahal customer sudah bayar.
- Email tidak terkirim ke customer.
- Data di dashboard terasa tidak sesuai.

Langkah yang bisa dilakukan:
1. Catat waktu kejadian & nama customer.
2. Screenshot error (jika ada).
3. Kirim info tersebut ke **developer / tim teknis**:
   - Jelaskan langkah yang dilakukan sebelum error.
   - Sertakan screenshot & detail booking.

---

Dokumen ini bisa diperbarui sewaktu-waktu jika ada fitur baru.  
Jika Anda butuh versi PDF atau video tutorial, minta ke tim developer untuk dibuat berdasarkan panduan ini.

