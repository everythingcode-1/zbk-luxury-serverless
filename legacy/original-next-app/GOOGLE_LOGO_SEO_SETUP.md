# Setup Logo untuk Google Search Results

## ✅ Perubahan yang Telah Dilakukan

### 1. **JSON-LD Structured Data**
File: `src/app/layout.tsx`

Telah ditambahkan **Schema.org Organization markup** yang mencakup:
- Logo organisasi (https://www.zbktransportservices.com/logo-website.png)
- Nama organisasi dan alternatif nama
- Deskripsi bisnis
- Alamat
- Informasi kontak
- Social media links
- Informasi perusahaan

### 2. **Open Graph Meta Tags**
- Update URL logo dari `/api/logo` ke URL absolut penuh
- Dimensi optimal: 1200x630 pixels (sesuai standar Facebook/LinkedIn)
- Alt text yang deskriptif

### 3. **Twitter Card Meta Tags**
- Update URL logo ke absolute URL
- Card type: `summary_large_image`

## 🔍 Cara Verifikasi Setup

### 1. **Test dengan Google Rich Results Test**
```
https://search.google.com/test/rich-results
```
- Masukkan URL website Anda
- Pastikan tidak ada error pada Organization schema
- Logo harus terdeteksi

### 2. **Test dengan Schema Markup Validator**
```
https://validator.schema.org/
```
- Paste HTML dari website Anda
- Verifikasi Organization schema valid

### 3. **Test Open Graph**
```
https://www.opengraph.xyz/
```
- Test apakah logo tampil dengan benar
- Verifikasi semua meta tags terdeteksi

### 4. **Facebook Sharing Debugger**
```
https://developers.facebook.com/tools/debug/
```
- Clear cache jika perlu
- Verifikasi image preview

## 📋 Checklist Langkah Selanjutnya

### ✅ Sudah Dilakukan
- [x] Tambahkan JSON-LD structured data
- [x] Update Open Graph images ke absolute URL
- [x] Update Twitter Card images
- [x] Setup robots.txt dan sitemap

### ⚠️ Yang Perlu Anda Lakukan

#### 1. **Verifikasi Logo File**
Pastikan file logo ada di lokasi berikut:
```
public/logo-website.png
```

**Spesifikasi logo yang direkomendasikan:**
- Format: PNG dengan background transparan atau solid
- Dimensi minimal: 112x112 pixels
- Dimensi optimal: 800x600 pixels atau 1200x630 pixels
- Ukuran file: < 200KB
- Aspek rasio: Persegi atau landscape

#### 2. **Google Search Console**
a. **Daftarkan Website**
   ```
   https://search.google.com/search-console
   ```
   - Tambahkan property website Anda
   - Verifikasi kepemilikan website

b. **Submit Sitemap**
   ```
   https://www.zbktransportservices.com/sitemap.xml
   ```
   - Masuk ke Google Search Console
   - Sitemaps > Add new sitemap
   - Masukkan: `sitemap.xml`

c. **Request Indexing**
   - URL Inspection tool
   - Masukkan homepage URL
   - Klik "Request Indexing"

d. **Update Verification Code**
   File: `src/app/layout.tsx` baris 88
   ```typescript
   verification: {
     google: "your-actual-verification-code", // Ganti dengan kode verifikasi Anda
   },
   ```

#### 3. **Bing Webmaster Tools**
```
https://www.bing.com/webmasters
```
- Import dari Google Search Console (lebih mudah)
- Atau submit manual

#### 4. **Pastikan Logo Berkualitas Tinggi**
Jika logo saat ini kurang optimal, pertimbangkan:
- Buat versi high-resolution (1200x630px)
- Simpan sebagai `public/og-image.png` khusus untuk social sharing
- Update path di layout.tsx jika menggunakan file berbeda

#### 5. **Submit URL untuk Indexing**
Setelah deploy perubahan:
```bash
# Cara cepat submit ke Google
https://www.google.com/ping?sitemap=https://www.zbktransportservices.com/sitemap.xml
```

## ⏱️ Timeline

**Kapan logo akan tampil di Google?**
- **Crawling**: 1-3 hari setelah submit
- **Indexing**: 3-7 hari
- **Logo tampil di search**: 1-4 minggu

**Faktor yang mempengaruhi:**
- Domain authority website
- Frekuensi update content
- Quality score website
- Backlink profile

## 🔧 Troubleshooting

### Logo tidak tampil setelah 4 minggu?

**1. Cek file logo accessible:**
```
https://www.zbktransportservices.com/logo-website.png
```
Harus bisa dibuka langsung di browser

**2. Cek robots.txt tidak memblokir:**
```
https://www.zbktransportservices.com/robots.txt
```
Pastikan logo file tidak di-disallow

**3. Re-submit ke Google Search Console:**
- Request indexing ulang
- Check Coverage report untuk error

**4. Verifikasi Structured Data:**
```bash
# Di browser, view page source
# Cari: "application/ld+json"
# Pastikan ada dan valid JSON
```

**5. Cek dimensi logo:**
- Minimum: 112x112 pixels
- Recommended: 512x512 pixels atau lebih
- Aspek rasio harus square (1:1) untuk logo

## 📊 Monitoring

### Tools untuk Monitor SEO:
1. **Google Search Console** - Traffic dan indexing status
2. **Google Analytics** - User behavior
3. **Screaming Frog** - Technical SEO audit (free untuk 500 URLs)

### Key Metrics:
- Impressions di Google Search
- Click-through rate (CTR)
- Average position
- Mobile usability

## 💡 Tips Tambahan

### Optimasi Logo untuk SEO:
```html
<!-- Gunakan multiple sizes -->
public/
  ├── logo-192x192.png    (untuk mobile)
  ├── logo-512x512.png    (untuk desktop)
  ├── logo-website.png    (untuk organization)
  └── og-image.png        (1200x630 untuk social)
```

### Update JSON-LD jika perlu:
Tambahkan informasi lebih detail seperti:
- Nomor telepon: `"telephone": "+65-XXXX-XXXX"`
- Email: `"email": "contact@zbktransportservices.com"`
- Jam operasional (OpeningHoursSpecification)
- Rating dan review (AggregateRating)

## 📞 Support

Jika ada masalah atau pertanyaan, hubungi developer atau konsultasikan dengan:
- Google Search Central Help: https://support.google.com/webmasters
- Schema.org Documentation: https://schema.org/Organization

---

**Dibuat:** December 22, 2025  
**Website:** https://www.zbktransportservices.com  
**Status:** ✅ Setup Complete - Menunggu Google Crawling













