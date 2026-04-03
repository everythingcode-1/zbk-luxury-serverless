# 📚 Tutorial Cara Kerja Website ZBK Transport Services

**Panduan Lengkap untuk Admin - Bahasa Sederhana & Mudah Dipahami**

---

## 📋 Daftar Isi

1. [Pengenalan](#-pengenalan)
2. [Cara Login ke Admin Panel](#-cara-login-ke-admin-panel)
3. [Dashboard - Pusat Informasi](#-dashboard---pusat-informasi)
4. [Mengelola Kendaraan](#-mengelola-kendaraan)
5. [Mengelola Booking](#-mengelola-booking)
6. [Mengelola Blog](#-mengelola-blog)
7. [Melihat Analytics & Laporan](#-melihat-analytics--laporan)
8. [Pengaturan Sistem](#-pengaturan-sistem)
9. [Tips & Best Practices](#-tips--best-practices)
10. [Troubleshooting](#-troubleshooting)

---

## 🎯 Pengenalan

Website ZBK Transport Services adalah platform untuk mengelola bisnis rental kendaraan mewah. Sebagai admin, Anda memiliki akses penuh untuk:

- ✅ Melihat semua booking yang masuk
- ✅ Mengelola kendaraan (tambah, edit, hapus)
- ✅ Menulis artikel blog
- ✅ Melihat laporan keuangan & statistik
- ✅ Mengatur pengaturan sistem

**Akses Admin Panel:** `https://yourdomain.com/admin`

---

## 🔐 Cara Login ke Admin Panel

### Langkah 1: Buka Halaman Login
1. Buka browser (Chrome, Firefox, Safari, dll)
2. Ketik alamat website: `https://yourdomain.com/login/admin`
3. Atau klik tombol **"Admin Login"** di website

### Langkah 2: Masukkan Kredensial
1. **Email:** Masukkan email admin Anda (contoh: `admin@zbklimo.com`)
2. **Password:** Masukkan password Anda
3. Klik tombol **"Login"**

### Langkah 3: Masuk ke Dashboard
- Jika login berhasil, Anda akan langsung diarahkan ke **Dashboard Admin**
- Jika salah password, akan muncul pesan error

### ⚠️ Lupa Password?
Jika lupa password, hubungi developer untuk reset password melalui:
- API endpoint: `/api/auth/reset-admin`
- Atau langsung edit di database

---

## 📊 Dashboard - Pusat Informasi

Dashboard adalah halaman pertama yang Anda lihat setelah login. Ini adalah **pusat informasi** untuk melihat gambaran bisnis Anda.

### Apa yang Ada di Dashboard?

#### 1. **Statistik Real-time** (Kartu di Atas)
Ada 4 kartu yang menampilkan:
- **Total Vehicles:** Jumlah total kendaraan yang terdaftar
- **Total Bookings:** Jumlah semua booking (dari awal)
- **Total Revenue:** Total pendapatan dari semua booking
- **Active Bookings Today:** Booking yang aktif hari ini

#### 2. **Analytics Charts** (Grafik)
- **Monthly Revenue Trends:** Grafik garis yang menunjukkan pendapatan per bulan
- **Booking Status Distribution:** Diagram lingkaran yang menunjukkan distribusi status booking
- **Vehicle Utilization:** Grafik batang yang menunjukkan kendaraan mana yang paling sering dipakai
- **Popular Vehicles:** Daftar kendaraan paling populer

#### 3. **Time Range Filter**
Di pojok kanan atas, ada dropdown untuk memilih periode:
- **1 Month** - Data 1 bulan terakhir
- **3 Months** - Data 3 bulan terakhir
- **6 Months** - Data 6 bulan terakhir
- **1 Year** - Data 1 tahun terakhir

**Cara Menggunakan:**
1. Klik dropdown "Time Range"
2. Pilih periode yang ingin dilihat
3. Grafik akan otomatis update

### 💡 Tips Dashboard
- Refresh halaman untuk update data terbaru
- Gunakan filter time range untuk analisis periode tertentu
- Klik pada grafik untuk melihat detail lebih lanjut

---

## 🚗 Mengelola Kendaraan

Menu ini untuk **menambah, mengedit, atau menghapus kendaraan** di sistem.

### Cara Menambah Kendaraan Baru

#### Langkah 1: Buka Halaman Vehicles
1. Di sidebar kiri, klik menu **"Vehicles"**
2. Atau akses langsung: `/admin/vehicles`

#### Langkah 2: Klik Tombol "Add Vehicle"
- Di pojok kanan atas, ada tombol **"Add Vehicle"** (warna kuning)
- Klik tombol tersebut

#### Langkah 3: Isi Form Kendaraan

**A. Basic Information (Informasi Dasar)**
- **Name:** Nama kendaraan (contoh: "Toyota Alphard 2024")
- **Model:** Model kendaraan (contoh: "Alphard")
- **Year:** Tahun pembuatan (contoh: 2024)
- **Plate Number:** Nomor plat (harus unik, tidak boleh sama)
- **Color:** Warna kendaraan (contoh: "Black", "White")
- **Location:** Lokasi kendaraan (contoh: "Jakarta", "Bali")

**B. Capacity (Kapasitas)**
- **Passenger Capacity:** Jumlah penumpang (contoh: 7)
- **Luggage Capacity:** Kapasitas bagasi (contoh: 4)

**C. Pricing (Harga)**
Ada 4 jenis harga yang harus diisi:
- **Airport Transfer Price:** Harga untuk transfer bandara (contoh: 80)
- **Trip Price:** Harga untuk perjalanan biasa (contoh: 75)
- **6 Hours Rental:** Harga sewa 6 jam (contoh: 360)
- **12 Hours Rental:** Harga sewa 12 jam (contoh: 720)

**D. Services (Layanan)**
Centang layanan yang tersedia:
- ☑ Airport Transfer
- ☑ Trip
- ☑ Rental

**E. Upload Images (Gambar Kendaraan)**
- Klik area upload (border putus-putus)
- Pilih gambar dari komputer (bisa multiple, max 5 gambar)
- Format: JPG, PNG, JPEG
- Max size: 5MB per gambar
- Gambar pertama akan jadi thumbnail

**F. Features (Fitur Kendaraan)**
- Tambahkan fitur satu per satu (contoh: "Leather Seats", "Sunroof")
- Klik "Add Feature" setelah mengetik
- Fitur akan muncul sebagai tag

**G. Description (Deskripsi)**
- Tulis deskripsi kendaraan (opsional)
- Bisa menggunakan format markdown

#### Langkah 4: Simpan Kendaraan
- Klik tombol **"Save Vehicle"** di bawah form
- Jika berhasil, kendaraan akan muncul di daftar

### Cara Mengedit Kendaraan

1. Di halaman Vehicles, cari kendaraan yang ingin diedit
2. Klik tombol **Edit** (ikon pensil, warna hijau)
3. Form akan terbuka dengan data yang sudah ada
4. Ubah data yang ingin diubah
5. Klik **"Update Vehicle"**

### Cara Menghapus Kendaraan

1. Di halaman Vehicles, cari kendaraan yang ingin dihapus
2. Klik tombol **Delete** (ikon trash, warna merah)
3. Akan muncul konfirmasi
4. Klik **"Delete"** lagi untuk konfirmasi
5. ⚠️ **PERHATIAN:** Menghapus kendaraan akan menghapus semua booking terkait!

### Cara Mengubah Status Kendaraan

Status kendaraan ada 4:
- **Available** - Tersedia untuk booking
- **In Use** - Sedang digunakan
- **Maintenance** - Sedang maintenance
- **Reserved** - Dipesan khusus

**Cara mengubah:**
1. Klik tombol **Edit** pada kendaraan
2. Di form, cari dropdown **"Status"**
3. Pilih status yang sesuai
4. Klik **"Update Vehicle"**

### 💡 Tips Mengelola Kendaraan
- **Gunakan gambar berkualitas tinggi** untuk menarik customer
- **Isi semua harga** agar customer bisa booking semua layanan
- **Update status secara rutin** agar tidak ada double booking
- **Gunakan deskripsi yang menarik** untuk SEO

---

## 📝 Mengelola Booking

Menu ini untuk **melihat, mengupdate, dan mengelola semua booking** yang masuk.

### Melihat Daftar Booking

1. Klik menu **"Bookings"** di sidebar
2. Atau akses: `/admin/bookings`

**Apa yang Terlihat:**
- Tabel dengan semua booking
- Kolom: Customer Name, Vehicle, Service, Date, Status, Payment, Actions
- Ada search box untuk mencari booking
- Ada filter untuk status booking

### Cara Mencari Booking

**Menggunakan Search Box:**
1. Ketik nama customer, email, atau nomor booking di search box
2. Hasil akan otomatis terfilter

**Menggunakan Filter:**
1. Klik dropdown **"Filter by Status"**
2. Pilih status: All, Pending, Confirmed, In Progress, Completed, Cancelled
3. Tabel akan menampilkan booking sesuai filter

### Cara Update Status Booking

Status booking ada 5:
1. **Pending** - Booking baru, belum dikonfirmasi
2. **Confirmed** - Booking sudah dikonfirmasi
3. **In Progress** - Booking sedang berjalan
4. **Completed** - Booking sudah selesai
5. **Cancelled** - Booking dibatalkan

**Langkah Update:**
1. Di tabel booking, cari booking yang ingin diupdate
2. Klik tombol **Edit** (ikon pensil)
3. Modal akan terbuka dengan detail booking
4. Cari dropdown **"Status"**
5. Pilih status baru
6. Klik **"Update Booking"**

### Cara Update Payment Status

Payment status ada 4:
- **Pending** - Belum bayar
- **Paid** - Sudah bayar
- **Failed** - Pembayaran gagal
- **Refunded** - Uang dikembalikan

**Langkah Update:**
1. Buka booking yang ingin diupdate
2. Di modal, cari dropdown **"Payment Status"**
3. Pilih status pembayaran
4. Klik **"Update Booking"**

### Cara Mengirim Email ke Customer

1. Buka booking yang ingin dikirim email
2. Di modal detail, klik tombol **"Send Email"**
3. Email konfirmasi akan dikirim ke customer
4. Status akan muncul di layar

### Melihat Detail Booking Lengkap

Klik tombol **View** (ikon mata) untuk melihat detail lengkap:
- Informasi customer (nama, email, telepon)
- Informasi kendaraan
- Informasi booking (tanggal, waktu, lokasi)
- Harga & pembayaran
- Status booking & payment

### 💡 Tips Mengelola Booking
- **Update status segera** setelah customer booking untuk konfirmasi cepat
- **Cek payment status** secara rutin untuk tracking pembayaran
- **Kirim email konfirmasi** setiap kali status berubah
- **Gunakan filter** untuk melihat booking pending yang perlu action
- **Search box** sangat membantu untuk mencari booking spesifik

---

## 📰 Mengelola Blog

Menu ini untuk **menulis artikel blog** yang akan muncul di website public.

### Cara Membuat Artikel Blog Baru

#### Langkah 1: Buka Halaman Blog
1. Klik menu **"Blog"** di sidebar
2. Atau akses: `/admin/blog`

#### Langkah 2: Klik "New Post"
- Di pojok kanan atas, klik tombol **"New Post"**
- Modal form akan terbuka

#### Langkah 3: Isi Informasi Dasar

**A. Basic Information**
- **Title:** Judul artikel (contoh: "Tips Memilih Kendaraan Mewah untuk Wedding")
- **Slug:** URL-friendly version dari judul (otomatis ter-generate, bisa diubah)
- **Author:** Nama penulis (default: "ZBK Team")

**B. Blog Images (Gambar Blog)**
- **Upload hingga 5 gambar**
- Gambar pertama akan jadi **cover image** (gambar utama di atas artikel)
- Gambar 2-5 akan jadi **gallery** di bawah artikel
- Format: JPG, PNG, JPEG
- Max size: 5MB per gambar

**Cara Upload:**
1. Klik area upload (border putus-putus)
2. Pilih gambar dari komputer (bisa multiple sekaligus)
3. Gambar akan muncul di preview grid
4. Gambar pertama otomatis jadi "COVER"
5. Klik X untuk hapus gambar jika salah

**C. Content (Isi Artikel)**
- **Excerpt:** Ringkasan singkat artikel (akan muncul di preview)
- **Content:** Isi artikel lengkap

**Format Penulisan (Markdown):**
Anda bisa menggunakan format markdown untuk menulis:

```markdown
# Heading 1 (Judul Besar)
## Heading 2 (Sub Judul)
### Heading 3 (Sub Sub Judul)

**Teks Tebal**
*Teks Miring*

- Bullet point 1
- Bullet point 2

1. Numbered list 1
2. Numbered list 2

[Link Text](https://example.com)

| Kolom 1 | Kolom 2 |
|---------|---------|
| Data 1  | Data 2  |
```

**Contoh Penulisan:**
```markdown
# Tips Memilih Kendaraan Mewah untuk Wedding

## Kenapa Penting?

Memilih kendaraan yang tepat untuk acara wedding adalah hal penting karena:

- **Prestise:** Meningkatkan kesan mewah
- **Kenyamanan:** Tamu merasa nyaman
- **Foto:** Hasil foto lebih bagus

## Rekomendasi Kendaraan

| Kendaraan | Kapasitas | Harga |
|-----------|-----------|-------|
| Alphard   | 7 orang   | $360  |
| Hiace     | 15 orang  | $500  |
```

**D. Tags (Tag Artikel)**
- Ketik tag dipisahkan koma (contoh: `wedding, luxury, tips`)
- Tag akan muncul sebagai kategori artikel

**E. Publish Status**
- ☑ **Publish immediately** - Artikel langsung muncul di website
- ☐ **Save as Draft** - Simpan sebagai draft (tidak muncul di website)

#### Langkah 4: Preview Artikel
1. Klik tombol **"Preview"** di pojok kanan atas form
2. Anda akan melihat preview artikel seperti yang akan muncul di website
3. Klik **"Edit"** untuk kembali ke form

#### Langkah 5: Simpan Artikel
- Klik tombol **"Save Post"** di bawah form
- Jika berhasil, artikel akan muncul di daftar blog

### Cara Mengedit Artikel

1. Di halaman Blog, cari artikel yang ingin diedit
2. Klik tombol **Edit** (ikon pensil, warna hijau)
3. Form akan terbuka dengan data yang sudah ada
4. Ubah konten yang ingin diubah
5. Klik **"Update Post"**

### Cara Menghapus Artikel

1. Di halaman Blog, cari artikel yang ingin dihapus
2. Klik tombol **Delete** (ikon trash, warna merah)
3. Akan muncul konfirmasi
4. Klik **"Delete"** lagi untuk konfirmasi
5. ⚠️ **PERHATIAN:** Artikel yang dihapus tidak bisa dikembalikan!

### Cara Mengubah Status Publish

**Mengubah dari Draft ke Published:**
1. Buka artikel yang ingin dipublish
2. Centang **"Publish immediately"**
3. Klik **"Update Post"**

**Mengubah dari Published ke Draft:**
1. Buka artikel yang ingin dijadikan draft
2. Hapus centang **"Publish immediately"**
3. Klik **"Update Post"**

### Cara Preview Artikel

1. Di tabel blog, klik tombol **View** (ikon mata, warna biru)
2. Modal preview akan terbuka
3. Anda akan melihat artikel seperti yang muncul di website
4. Klik **X** untuk tutup preview

### 💡 Tips Menulis Blog
- **Gunakan gambar berkualitas** - Cover image yang menarik akan meningkatkan engagement
- **Tulis excerpt yang menarik** - Ini yang muncul di preview, buat menarik!
- **Gunakan heading** untuk struktur artikel yang jelas
- **Tambahkan gambar gallery** untuk membuat artikel tidak monoton
- **Gunakan tags yang relevan** untuk SEO
- **Preview sebelum publish** untuk cek formatting
- **Gunakan markdown** untuk formatting yang rapi (tables, lists, bold, dll)

---

## 📈 Melihat Analytics & Laporan

Analytics membantu Anda **menganalisis performa bisnis** dan membuat keputusan yang tepat.

### Akses Analytics

1. Di Dashboard, scroll ke bawah
2. Anda akan melihat 4 grafik analytics

### Jenis Grafik Analytics

#### 1. Monthly Revenue Trends
- **Apa itu:** Grafik garis yang menunjukkan pendapatan per bulan
- **Kegunaan:** Melihat trend pendapatan (naik/turun)
- **Cara baca:** Garis naik = pendapatan meningkat, garis turun = menurun

#### 2. Booking Status Distribution
- **Apa itu:** Diagram lingkaran yang menunjukkan distribusi status booking
- **Kegunaan:** Melihat berapa banyak booking pending, confirmed, completed, dll
- **Cara baca:** Warna berbeda = status berbeda, ukuran = jumlah

#### 3. Vehicle Utilization
- **Apa itu:** Grafik batang yang menunjukkan kendaraan mana yang paling sering dipakai
- **Kegunaan:** Mengetahui kendaraan populer dan yang kurang digunakan
- **Cara baca:** Bar lebih tinggi = lebih sering dipakai

#### 4. Popular Vehicles
- **Apa itu:** Daftar kendaraan paling populer
- **Kegunaan:** Mengetahui kendaraan favorit customer
- **Cara baca:** Ranking 1 = paling populer

### Menggunakan Time Range Filter

1. Di pojok kanan atas dashboard, klik dropdown **"Time Range"**
2. Pilih periode:
   - **1 Month** - Data 1 bulan terakhir
   - **3 Months** - Data 3 bulan terakhir
   - **6 Months** - Data 6 bulan terakhir
   - **1 Year** - Data 1 tahun terakhir
3. Grafik akan otomatis update

### 💡 Tips Analytics
- **Cek analytics secara rutin** (mingguan/bulanan) untuk tracking performa
- **Gunakan time range** untuk analisis periode tertentu
- **Perhatikan trend** - jika revenue turun, cek penyebabnya
- **Gunakan data vehicle utilization** untuk keputusan inventory

---

## ⚙️ Pengaturan Sistem

Menu Settings untuk **mengatur konfigurasi sistem** (jika ada).

### Akses Settings

1. Klik menu **"Settings"** di sidebar
2. Atau akses: `/admin/settings`

### Pengaturan yang Tersedia

- **General Settings:** Pengaturan umum
- **Email Configuration:** Konfigurasi email
- **System Settings:** Pengaturan sistem

**Catatan:** Settings biasanya dikonfigurasi oleh developer melalui environment variables.

---

## 💡 Tips & Best Practices

### Tips Umum

1. **Login Secara Rutin**
   - Cek booking baru setiap hari
   - Update status booking segera setelah konfirmasi

2. **Update Status Secara Real-time**
   - Jangan biarkan booking pending terlalu lama
   - Update status segera setelah ada perubahan

3. **Gunakan Search & Filter**
   - Search box sangat membantu untuk mencari data spesifik
   - Filter membantu melihat data yang relevan

4. **Upload Gambar Berkualitas**
   - Gunakan gambar HD untuk kendaraan dan blog
   - Gambar yang bagus meningkatkan konversi

5. **Tulis Blog Secara Rutin**
   - Blog membantu SEO dan menarik customer
   - Update blog minimal 1-2 kali per bulan

6. **Monitor Analytics**
   - Cek analytics setiap minggu
   - Gunakan data untuk keputusan bisnis

### Best Practices untuk Booking

1. **Respon Cepat**
   - Konfirmasi booking dalam 24 jam
   - Update status segera setelah ada perubahan

2. **Komunikasi dengan Customer**
   - Kirim email konfirmasi setiap update status
   - Pastikan customer tahu status booking mereka

3. **Track Payment**
   - Update payment status setelah customer bayar
   - Cek payment secara rutin

### Best Practices untuk Kendaraan

1. **Update Status Real-time**
   - Ubah status ke "In Use" saat kendaraan dipakai
   - Ubah ke "Maintenance" saat service
   - Ubah ke "Available" setelah selesai

2. **Gunakan Gambar Berkualitas**
   - Upload gambar dari berbagai angle
   - Gunakan gambar yang menarik

3. **Isi Semua Informasi**
   - Lengkapi semua field (harga, fitur, deskripsi)
   - Informasi lengkap membantu customer memutuskan

### Best Practices untuk Blog

1. **Gunakan Cover Image yang Menarik**
   - Cover image adalah hal pertama yang dilihat
   - Gunakan gambar yang relevan dan menarik

2. **Struktur Artikel yang Jelas**
   - Gunakan heading (H1, H2, H3) untuk struktur
   - Buat paragraf yang tidak terlalu panjang

3. **Tambahkan Gallery Images**
   - Gunakan 2-5 gambar untuk membuat artikel tidak monoton
   - Gambar gallery membuat artikel lebih menarik

4. **SEO-Friendly**
   - Gunakan slug yang deskriptif
   - Tambahkan tags yang relevan
   - Tulis excerpt yang menarik

---

## 🔧 Troubleshooting

### Masalah: Tidak Bisa Login

**Penyebab:**
- Password salah
- Email tidak terdaftar
- Session expired

**Solusi:**
1. Pastikan email dan password benar
2. Coba clear cache browser
3. Hubungi developer untuk reset password

### Masalah: Gambar Tidak Upload

**Penyebab:**
- File terlalu besar (>5MB)
- Format tidak didukung
- Koneksi internet lambat

**Solusi:**
1. Pastikan file < 5MB
2. Gunakan format JPG, PNG, atau JPEG
3. Coba lagi dengan koneksi yang lebih stabil

### Masalah: Booking Tidak Muncul

**Penyebab:**
- Filter aktif
- Search term tidak cocok
- Data belum di-refresh

**Solusi:**
1. Clear filter (pilih "All")
2. Clear search box
3. Refresh halaman (F5)

### Masalah: Grafik Tidak Update

**Penyebab:**
- Data belum ada
- Time range tidak sesuai
- Cache browser

**Solusi:**
1. Pastikan ada data booking
2. Coba ubah time range
3. Clear cache dan refresh

### Masalah: Email Tidak Terkirim

**Penyebab:**
- SMTP tidak dikonfigurasi
- Email server down
- Email masuk spam

**Solusi:**
1. Hubungi developer untuk cek konfigurasi SMTP
2. Cek folder spam customer
3. Pastikan email customer valid

### Masalah: Status Tidak Berubah

**Penyebab:**
- Form tidak tersubmit
- Database error
- Session expired

**Solusi:**
1. Pastikan klik tombol "Update"
2. Refresh halaman dan coba lagi
3. Logout dan login kembali

---

## 📞 Bantuan & Support

Jika mengalami masalah yang tidak bisa diselesaikan:

1. **Cek Troubleshooting** di atas
2. **Hubungi Developer** untuk bantuan teknis
3. **Cek Logs** di browser console (F12) untuk error details

---

## ✅ Checklist Harian Admin

Gunakan checklist ini untuk memastikan semua tugas admin selesai:

### Setiap Hari
- [ ] Login ke admin panel
- [ ] Cek booking baru (pending)
- [ ] Konfirmasi booking yang masuk
- [ ] Update status booking yang berubah
- [ ] Cek payment status
- [ ] Update status kendaraan (In Use → Available)

### Setiap Minggu
- [ ] Review analytics & laporan
- [ ] Cek vehicle utilization
- [ ] Update blog (jika ada artikel baru)
- [ ] Cek email notifications

### Setiap Bulan
- [ ] Review revenue trends
- [ ] Analisis popular vehicles
- [ ] Update kendaraan (gambar, harga, dll)
- [ ] Backup data penting

---

## 🎓 Kesimpulan

Website ZBK Transport Services dirancang untuk **mudah digunakan** dan **efisien**. Dengan mengikuti tutorial ini, Anda akan bisa:

- ✅ Mengelola booking dengan lancar
- ✅ Mengelola kendaraan dengan baik
- ✅ Menulis blog yang menarik
- ✅ Menganalisis performa bisnis
- ✅ Memberikan pelayanan terbaik ke customer

**Selamat menggunakan website ZBK Transport Services!** 🚀

---

**Versi Tutorial:** 1.0  
**Terakhir Diupdate:** December 18, 2024  
**Untuk:** Admin ZBK Transport Services

---

*Jika ada pertanyaan atau butuh bantuan, hubungi developer atau tim support.*















