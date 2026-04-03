# ZBK Limousine Tours — Strategy & Growth Deck
> **Dokumen ini dibuat untuk presentasi internal.**
> Format slide-ready. Setiap section = 1 slide PPT.

---

---

## SLIDE 1 — COVER

# ZBK Limousine Tours
## From Zero to Booking Machine
### Laporan Perkembangan & Strategi Pertumbuhan 2026

**zbktransportservices.com**
Singapore Premium Limousine Service

> _"Dari platform yang dibangun dari nol — menuju mesin booking yang menghasilkan revenue konsisten."_

---

---

## SLIDE 2 — SNAPSHOT: APA YANG SUDAH DIBANGUN

### Platform Full-Stack yang Sudah Berjalan

| Komponen | Status |
|----------|--------|
| Website publik (Next.js 15) | ✅ Live |
| Sistem booking online | ✅ Live |
| Payment gateway (Stripe) | ✅ Live |
| Admin dashboard | ✅ Live |
| Blog & CMS | ✅ Live |
| Customer auth (login/register) | ✅ Live |
| Email otomatis (konfirmasi booking) | ✅ Live |
| Google Analytics & Ads tracking | ✅ Live |
| SEO technical foundation | ✅ Diperbaiki |
| Database (PostgreSQL + Prisma) | ✅ Live |

**Ini bukan website biasa — ini platform bisnis yang lengkap.**

---

---

## SLIDE 3 — APA YANG SUDAH DIBANGUN: HALAMAN

### 13 Halaman Website Publik

```
/                  → Homepage (hero + fleet + services + testimonials)
/fleet             → Katalog kendaraan (Alphard, Noah, Hiace)
/services          → Layanan lengkap
/how-to-book       → Panduan booking (3 langkah)
/booking           → Form booking langsung
/booking/confirmation → Halaman konfirmasi
/payment/success   → Halaman sukses bayar
/payment/cancel    → Halaman pembatalan
/blog              → Blog SEO
/blog/[slug]       → Artikel individual
/about             → Tentang ZBK
/contact           → Kontak & peta
/my-bookings       → Riwayat booking customer
```

### 7 Halaman Admin Dashboard
```
/admin             → Overview & statistik
/admin/bookings    → Kelola semua booking
/admin/vehicles    → Kelola armada
/admin/blog        → Kelola artikel blog
/admin/hero-section → Kelola banner utama
/admin/analysis    → Analitik bisnis
/admin/settings    → Pengaturan sistem
```

---

---

## SLIDE 4 — APA YANG SUDAH DIBANGUN: TEKNOLOGI

### Stack Teknologi

**Frontend**
- Next.js 15 (App Router, SSR + SSG)
- TypeScript — type-safe, minim bug
- TailwindCSS — desain responsif, mobile-first
- React 19

**Backend & Database**
- 48 API endpoints
- PostgreSQL + Prisma ORM
- JWT authentication
- bcryptjs password hashing

**Integrasi Pihak Ketiga**
- **Stripe** — payment processing (kartu kredit, PayNow, Stripe Link)
- **Nodemailer** — email otomatis booking confirmation
- **Google Analytics GA4** — tracking behavior user
- **Google Ads** — conversion tracking (AW-17828596675)
- **Sharp** — optimasi gambar otomatis

**Content**
- Editor.js — rich text editor admin
- RSS Feed — /rss.xml untuk blog aggregator

---

---

## SLIDE 5 — APA YANG SUDAH DIBANGUN: FITUR BOOKING

### Alur Booking yang Sudah Berjalan

```
User buka website
    ↓
Pilih jenis layanan:
  ├── Airport Transfer (One-Way ke/dari Changi)
  ├── Trip (One-Way point-to-point)
  └── Rental (6 jam / 12 jam / custom)
    ↓
Pilih kendaraan (Alphard / Noah / Hiace)
    ↓
Isi detail: nama, email, telepon, lokasi
    ↓
Review Order Summary + harga final
    ↓
Bayar via Stripe (kartu / PayNow / Stripe Link)
    ↓
Email konfirmasi otomatis terkirim
    ↓
Driver hubungi customer 15 menit sebelum jemput
```

**Tidak perlu buat akun. Bisa booking sebagai guest.**

### Pricing Model yang Fleksibel
- Airport Transfer → harga tetap per trip
- Midnight surcharge → +SGD 10 (23:00–06:00)
- Hourly rental → paket 6 jam / 12 jam / per jam
- Semua harga transparan, tidak ada hidden fee

---

---

## SLIDE 6 — SEO: APA YANG SUDAH DIPERBAIKI

### SEO Technical Fixes — Batch Terbaru

#### P0 — Kritis (Sudah Selesai)
- ✅ `lang="id"` → `lang="en-SG"` (bahasa dokumen HTML benar)
- ✅ Hapus placeholder Google Search Console verification
- ✅ Organization schema pindah ke server-side (crawlable oleh Google)
- ✅ Hapus dead links di Footer (/help, /insurance, /faq, /chat)
- ✅ LinkedIn href="#" diperbaiki ke URL real

#### P1 — Tinggi (Sudah Selesai)
- ✅ Homepage metadata full server-side (title & description terindex)
- ✅ LocalBusiness schema (LimousineService type)
- ✅ `<button>Book Now</button>` → `<Link href="/booking">` (crawlable)
- ✅ `window.location.href` → `router.push()` (proper navigation)
- ✅ `sameAs` ditambahkan ke Organization schema (Facebook, Instagram, TikTok)

#### P2 — Sedang (Sudah Selesai)
- ✅ FAQPage schema di /how-to-book (Rich Results eligible)
- ✅ Service schema + ItemList di /services
- ✅ Vehicle/Product schema di /fleet (3 kendaraan)
- ✅ robots.txt: test routes di-disallow, `/_next/` dihapus dari allow
- ✅ `aria-expanded` dinamis di Header (accessibility fix)
- ✅ themeColor: `#000000` → `#D4AF37` (brand color)

#### P3 — Minor (Sudah Selesai)
- ✅ Hapus hardcoded CSS hash preload (Next.js handle otomatis)
- ✅ Hapus artificial setTimeout di Hero (300ms + 100ms delay)
- ✅ Blog article heading: `<h3>` → `<h2>` (heading hierarchy benar)
- ✅ H1 Contact page → keyword-rich
- ✅ Sitemap: lastModified dengan tanggal real, hapus category routes yang tidak exist

---

---

## SLIDE 7 — KONTEN SEO: 6 ARTIKEL YANG SUDAH DIBUAT

### Blog Articles — Siap Tayang di Google

| # | Judul Artikel | Target Keyword | Tanggal Publish |
|---|--------------|----------------|-----------------|
| 1 | Changi Airport Limousine Transfer Guide | changi airport transfer singapore | 8 Feb 2026 |
| 2 | Toyota Alphard vs Noah: Which to Book? | alphard vs noah singapore | 14 Feb 2026 |
| 3 | Corporate Limousine Service Singapore | corporate chauffeur singapore | 20 Feb 2026 |
| 4 | Singapore City Tour by Limousine 2026 | singapore city tour limo | 27 Feb 2026 |
| 5 | Limousine Price Singapore Guide 2026 | limousine price singapore | 5 Mar 2026 |
| 6 | Wedding Limousine Singapore Guide | wedding limousine singapore | 11 Mar 2026 |

**Setiap artikel mengandung:**
- Internal links ke /booking, /fleet, /services, /how-to-book
- HTML terstruktur (H2/H3, tabel, list)
- 5 SEO tags relevan
- Konten 700–1200 kata
- Keyword density natural (tidak spam)

---

---

## SLIDE 8 — APA YANG SUDAH BAGUS ✅

### Kekuatan Platform ZBK Sekarang

**1. Booking Tanpa Friction**
Guest checkout — tidak perlu daftar akun. Jumlah langkah minimal. Stripe yang trusted dan familiar di Singapore.

**2. Admin Dashboard Lengkap**
Pemilik bisa kelola semua: booking, kendaraan, blog, konten hero — tanpa developer.

**3. Email Automation**
Customer dapat email konfirmasi otomatis setelah bayar. Profesional dan trust-building.

**4. Multi-Payment Method**
Kartu kredit, PayNow, Stripe Link — semua payment method populer di Singapore sudah di-cover.

**5. SEO Foundation Solid**
Setelah perbaikan batch terbaru — structured data (Organization, LocalBusiness, FAQPage, Service, Vehicle schema), sitemap, robots.txt, dan heading hierarchy sudah benar.

**6. Blog Platform Built-In**
Tidak perlu WordPress terpisah. Blog langsung di domain utama = SEO authority terpusat.

**7. Google Analytics + Ads Tracking**
Sudah ada tracking untuk mengukur konversi dari iklan.

**8. Mobile-First Design**
Semua halaman responsif dan dioptimasi untuk mobile — lebih dari 70% traffic Singapore berasal dari mobile.

---

---

## SLIDE 9 — GAP ANALYSIS: APA YANG MASIH KURANG

### Apa yang Belum Ada (dan Mempengaruhi Revenue)

| Gap | Dampak ke Revenue | Prioritas |
|-----|------------------|-----------|
| Tidak ada live chat / WhatsApp floating button | Kehilangan leads yang ragu-ragu | 🔴 Tinggi |
| Tidak ada review/rating di website | Trust rendah, konversi rendah | 🔴 Tinggi |
| Tidak ada promo/voucher system | Tidak bisa jalankan flash sale | 🔴 Tinggi |
| Tidak ada Google Business Profile yang dioptimasi | Tidak muncul di Google Maps | 🔴 Tinggi |
| Tidak ada retargeting pixel (Meta/TikTok) | Kehilangan warm audience | 🟠 Sedang |
| Tidak ada loyalty/repeat customer reward | Tidak ada insentif booking ulang | 🟠 Sedang |
| Tidak ada referral program | Word-of-mouth tidak terstruktur | 🟠 Sedang |
| Blog belum punya backlink | Artikel SEO belum dapat authority | 🟠 Sedang |
| Tidak ada "last-minute deals" section | Slot kosong = uang hilang | 🟡 Normal |
| Tidak ada WhatsApp API integration | Follow-up manual, lambat | 🟡 Normal |

---

---

## SLIDE 10 — STRATEGI PERTUMBUHAN: 3 PILAR UTAMA

### Framework Pertumbuhan ZBK

```
┌─────────────────────────────────────────────────────┐
│                                                     │
│   PILAR 1          PILAR 2          PILAR 3         │
│   TRAFFIC          KONVERSI         RETENSI         │
│                                                     │
│   Mendatangkan     Mengubah         Membuat          │
│   lebih banyak     pengunjung       customer         │
│   pengunjung       jadi booking     kembali lagi     │
│   ke website                                        │
│                                                     │
└─────────────────────────────────────────────────────┘
```

**Jika hanya fokus di satu pilar, pertumbuhan terbatas.**
**Ketiga pilar harus jalan bersamaan.**

---

---

## SLIDE 11 — PILAR 1: TRAFFIC — SEO & CONTENT

### Strategi Mendatangkan Traffic Organik

**A. SEO Konten (Sudah Dimulai)**
Target kata kunci dengan intent tinggi:
- "changi airport limousine" → 2,900 pencarian/bulan
- "singapore airport transfer" → 8,100 pencarian/bulan
- "toyota alphard rental singapore" → 1,600 pencarian/bulan
- "wedding car singapore" → 4,400 pencarian/bulan
- "limousine service singapore" → 3,600 pencarian/bulan

**Action:**
- Publish 2 artikel blog per minggu (konsisten selama 3 bulan)
- Targetkan long-tail keywords: "how much does limo cost singapore", "changi airport t3 pickup", dll.
- Bangun backlink dari: travel blogs Singapore, expat forums, wedding directories

**B. Google Business Profile**
- Optimasi profil GBP dengan foto armada, jam buka, kategori yang tepat
- Dorong customer kasih review bintang 5 di Google
- Reply semua review — sinyal positif untuk Google Maps ranking
- GBP yang optimal = muncul di "near me" searches tanpa bayar iklan

**C. Local SEO**
- Daftar di Yelp Singapore, TripAdvisor, Singapore Expats forum
- Direktori wedding Singapore (bridestory, hitched.sg)
- Direktori bisnis Singapore (yellowpages.sg, business.gov.sg)

---

---

## SLIDE 12 — PILAR 1: TRAFFIC — PAID ADS

### Strategi Iklan Berbayar

**A. Google Ads (Search)**
Tracking sudah ada (AW-17828596675). Saatnya aktifkan kampanye:

```
Kampanye 1: Airport Transfer
Keywords: "changi airport taxi", "airport limo singapore",
          "changi airport pickup service"
Target: Turis, expat, business traveler tiba di Changi

Kampanye 2: Corporate
Keywords: "corporate car service singapore", "executive chauffeur"
Target: B2B, HR managers, EA (Executive Assistant)

Kampanye 3: Wedding
Keywords: "wedding car singapore", "bridal car hire"
Target: Couples engaged (interest targeting)
```

**Budget rekomendasi:** Mulai SGD 20–30/hari per kampanye.

**B. Meta Ads (Facebook + Instagram)**
- Retargeting pengunjung website yang belum booking
- Lookalike audience dari customer yang sudah bayar
- Creative: video behind-the-scenes chauffeur, interior Alphard
- CTA: "Book Your Ride → Book Now"

**C. TikTok Ads**
- Short video tour interior Toyota Alphard
- "POV: Your client arrives in an Alphard" format
- Target: Singapore entrepreneurs, newlyweds aged 25–45

---

---

## SLIDE 13 — PILAR 2: KONVERSI — QUICK WINS

### Mengubah Lebih Banyak Pengunjung Jadi Booking

**A. WhatsApp Floating Button (PRIORITAS #1)**
```
Pasang tombol WhatsApp di kanan bawah semua halaman
→ Direct chat ke nomor bisnis
→ Banyak orang Singapore prefer WhatsApp sebelum booking
→ Implementation: 1 jam kerja, dampak LANGSUNG
```

**B. Social Proof — Review & Testimonials**
- Integrasikan Google Reviews widget di homepage
- Tambahkan badge "Rated 4.9/5 on Google"
- Tampilkan total number of rides completed
- Tambahkan foto customer (dengan izin) di testimonials section

**C. Urgency & Scarcity**
- Badge "Limited slots this weekend" di booking form
- Countdown timer untuk promo tertentu
- "3 vehicles available today" indicator real-time

**D. Exit Intent Popup**
- Ketika user mau keluar tanpa booking: tampilkan promo "10% off first ride with code: ZBK10"
- Kumpulkan email untuk email marketing

**E. Trust Signals**
- Logo Stripe di checkout ("Secure Payment")
- "No registration required" prominent di hero section
- Tampilkan nomor telepon di header (bukan hanya di contact page)

---

---

## SLIDE 14 — PILAR 2: KONVERSI — PRICING STRATEGY

### Strategi Harga untuk Maksimalkan Revenue per Booking

**A. Tiered Package (Upsell)**
```
SILVER → Airport Transfer (one-way)
  + standard meet & greet

GOLD → Airport Transfer + 1 hour city drop
  + priority pickup lane
  + complimentary water

PLATINUM → Full Day 12 Hours
  + dedicated chauffeur
  + lunch break included
  + airport + hotel loop
```
**Upsell dari Silver ke Gold bisa tambah 30–40% revenue per booking**

**B. Add-On Services**
Saat checkout, tawarkan:
- 🌹 Flower bouquet decoration (+SGD 25)
- 🍾 Welcome drinks (sparkling water/juice) (+SGD 15)
- 🔌 Phone charger (USB-C/Lightning) — complimentary tapi sebutkan
- 🛡️ Extended wait time guarantee (+SGD 20 untuk 2 jam wait)

**C. Bundling**
- "Wedding Package": Round trip + dekorasi + 6 jam = harga bundel
- "Corporate Day Pass": 8 jam + 2 destination = flat rate
- "Honeymoon Transfer": Airport + Hotel + 1 city tour stop

**D. Early Bird & Last Minute**
- Book 7+ hari sebelumnya → diskon 10%
- Last-minute (same day) → premium +15% (scarcity pricing)

---

---

## SLIDE 15 — PILAR 2: KONVERSI — BOOKING FUNNEL

### Perbaikan Funnel Booking

**Saat ini:** User → Website → Booking Form → Bayar ✅

**Yang bisa ditambahkan:**

```
Step 1: Pasang Live Chat (WhatsApp / Intercom)
        → Jawab pertanyaan real-time, tidak biarkan ragu-ragu pergi

Step 2: Booking Form Progress Bar
        → "Step 1 of 3" — user tahu seberapa jauh mereka sudah

Step 3: Auto-save Form
        → Jika user menutup tab, next visit form sudah terisi

Step 4: Booking Abandonment Email
        → "You left something behind — complete your booking and get 5% off"

Step 5: Post-Booking Upsell
        → Setelah konfirmasi: "Add airport meet & greet service?"
```

**Target konversi:** Dari asumsi 3–5% → target 8–12% dengan funnel improvement

---

---

## SLIDE 16 — PILAR 3: RETENSI — REPEAT CUSTOMER

### Membuat Customer Kembali Lagi

**A. Loyalty Program Sederhana**
```
Sistem stamp digital:
- 5 booking → gratis 1 trip (airport transfer)
- Birthday month → diskon 15%
- Referral: Ajak teman → kamu dapat SGD 20 credit
```

**B. Post-Trip Email Sequence**
```
Hari 0  → Email konfirmasi booking
Hari 1  → Email selamat datang + "Review us on Google"
Hari 7  → "How was your ride?" feedback form
Hari 30 → "Planning your next trip to Singapore?"
Hari 60 → Promo: "Book before [date] and save 10%"
```

**C. WhatsApp Follow-Up**
- 24 jam setelah trip: "Terima kasih telah memilih ZBK. Bagaimana perjalanan Anda?"
- Link ke Google Review: simple, 1 klik
- Setiap 45 hari: gentle reminder + promo

**D. Corporate Retainer**
- Tawarkan kontrak bulanan ke perusahaan
- Misalnya: 10 trip/bulan → rate khusus
- Target: konsulat, hotel bintang 5, perusahaan MNC di Singapore
- 1 corporate account = equivalent 10+ individual bookings

---

---

## SLIDE 17 — REVENUE STREAMS BARU

### Cara Menambah Sumber Pendapatan

**1. B2B Corporate Account (Potensi Terbesar)**
- Target: HR managers, executive assistants di perusahaan multinasional
- Pitch: "No more Grab surge pricing for your executives"
- Model: Invoice bulanan, bukan per-trip payment
- Potensi: 1 akun korporat = SGD 2.000–10.000/bulan

**2. Hotel Partnership**
- Kerjasama dengan hotel bintang 4-5 di Singapore (Marriott, Shangri-La, Ritz-Carlton)
- Hotel recommend ZBK ke tamu yang butuh airport transfer
- Model: Komisi 10–15% per booking referral
- Pendaftaran di: Concierge team langsung, atau platform seperti HelloGold, Klook

**3. Wedding Planner Partnership**
- Daftar sebagai vendor di wedding directories (Bridestory, WeddingWire SG)
- Partner dengan wedding planners — mereka bundel transportasi ke paket mereka
- Model: Referral fee atau eksklusif paket

**4. Travel Agent & OTA Integration**
- Daftar di Klook, Viator, GetYourGuide sebagai "Private Limousine Tour"
- Singapore City Tour product = produk wisata yang laku
- OTA handle marketing — ZBK handle service

**5. Event Transportation**
- Target organizer MICE (Meetings, Incentives, Conferences, Exhibitions)
- Singapore banyak konferensi internasional di Marina Bay Sands, Suntec
- Multi-vehicle booking = high-value single transaction

---

---

## SLIDE 18 — ROADMAP 90 HARI

### Action Plan Q1–Q2 2026

#### BULAN 1 (Maret 2026) — Foundation
```
Minggu 1:
  ✅ Push semua SEO fixes ke production (DONE)
  ✅ 6 artikel SEO di-seed ke database (DONE)
  □ Pasang WhatsApp floating button di website
  □ Optimasi Google Business Profile ZBK

Minggu 2:
  □ Aktifkan Google Ads kampanye Airport Transfer (SGD 20/hari)
  □ Install Meta Pixel di website
  □ Setup email follow-up sequence post-booking

Minggu 3:
  □ Publish 2 artikel blog baru (keyword research dulu)
  □ Submit sitemap ke Google Search Console
  □ Mulai collect Google Reviews dari existing customer

Minggu 4:
  □ A/B test hero section CTA button
  □ Tambahkan testimonials section dengan foto
  □ Review analytics — apa yang paling banyak diklik
```

#### BULAN 2 (April 2026) — Growth
```
  □ Launch promo Ramadan / Lebaran (airport peak season)
  □ Integrasi WhatsApp Business API
  □ Mulai outreach ke hotel (5 hotel target per minggu)
  □ Publish 8 artikel blog (2/minggu)
  □ Setup retargeting Meta Ads untuk website visitors
  □ Tambahkan add-on services di checkout flow
  □ Daftar di Klook sebagai "Singapore Private Limousine Tour"
```

#### BULAN 3 (Mei 2026) — Scale
```
  □ Launch corporate sales outreach (target 10 companies)
  □ Wedding vendor registration di Bridestory & WeddingWire
  □ Implementasi loyalty/stamp program
  □ Review SEO rankings — cek progress artikel bulan lalu
  □ Scale budget Google Ads yang perform
  □ Launch referral program: "Ajak teman, dapat SGD 20"
  □ Monthly revenue report + target setting untuk Q3
```

---

---

## SLIDE 19 — TARGET KPI

### Key Performance Indicators 2026

#### Traffic
| Metric | Baseline (Est.) | Target 3 Bulan | Target 6 Bulan |
|--------|----------------|----------------|----------------|
| Organic sessions/bulan | < 500 | 2.000 | 8.000 |
| Google ranking "changi airport limo" | Tidak terindex | Top 20 | Top 5 |
| Blog page views/bulan | 0 | 500 | 3.000 |

#### Konversi
| Metric | Baseline | Target |
|--------|----------|--------|
| Booking conversion rate | Est. 2–3% | 8% |
| WhatsApp inquiry to booking | N/A | 40% |
| Average order value | SGD X | +20% via upsell |

#### Revenue
| Metric | Target |
|--------|--------|
| Bookings/bulan (Month 1) | 30 trips |
| Bookings/bulan (Month 3) | 80 trips |
| Bookings/bulan (Month 6) | 200 trips |
| 1 corporate account acquired | Month 2 |
| Klook listing live | Month 2 |

---

---

## SLIDE 20 — INVESTASI vs RETURN

### ROI Estimate per Strategi

| Strategi | Biaya Setup | Biaya Bulanan | Potensi Revenue/Bulan |
|----------|------------|---------------|----------------------|
| Google Ads (Airport Transfer) | SGD 0 | SGD 600 | SGD 3.000–8.000 |
| SEO Blog Content | SGD 0 | SGD 200 (waktu) | SGD 1.000–5.000 (Month 6+) |
| WhatsApp Button | SGD 0 | SGD 0 | +15–20% konversi existing |
| Google Business Profile | SGD 0 | SGD 0 | +20–30% dari local search |
| Klook/Viator Listing | SGD 0 | 20–25% komisi | Tambahan 10–30 booking/bulan |
| Corporate Account (1 account) | SGD 0 | Effort sales | SGD 2.000–10.000/bulan |
| Meta Retargeting | SGD 0 | SGD 300 | +10–15% recovery dari bounced |
| Loyalty Program | Dev cost | SGD 0 | +25% repeat rate |

**Paling high-ROI dengan effort terendah:**
1. 🏆 Google Business Profile optimization (gratis, setup 2 jam)
2. 🏆 WhatsApp floating button (gratis, setup 1 jam)
3. 🏆 Google Ads Airport Transfer (bayar tapi ROI terukur dan jelas)

---

---

## SLIDE 21 — COMPETITIVE ADVANTAGE

### Kenapa ZBK Bisa Menang di Singapore

**Kelemahan Kompetitor Utama:**
- SMRT Taxis → tidak premium, tidak bookable online dengan mudah
- Grab/Gojek → surge pricing, kualitas kendaraan inconsistent, bukan dedicated limo
- MaxiCab → kalah di digital presence dan SEO
- Hotel limousine → mahal, tidak fleksibel, tidak bisa direct book

**Keunggulan ZBK:**
| Faktor | ZBK | Kompetitor |
|--------|-----|-----------|
| Booking online 24/7 | ✅ | Mostly phone-based |
| Fixed pricing, no surge | ✅ | Surge di peak hours |
| Dedicated premium fleet | ✅ | Mixed fleet quality |
| Konfirmasi instan via email | ✅ | Manual confirmation |
| Guest checkout (no signup) | ✅ | Mostly requires account |
| SEO & content marketing | ✅ Growing | Minimal |
| Admin dashboard sendiri | ✅ | Spreadsheet/manual |

**Conclusion: ZBK sudah punya infrastruktur yang lebih baik dari sebagian besar kompetitor lokal. Tinggal gas di marketing.**

---

---

## SLIDE 22 — KESIMPULAN

### Rangkuman: Di Mana ZBK Sekarang & Ke Mana Selanjutnya

**✅ SUDAH BAGUS:**
- Platform booking lengkap dan berjalan
- Payment gateway terintegrasi (Stripe)
- SEO technical foundation diperbaiki (P0–P3)
- 6 artikel SEO berkualitas sudah dibuat
- Admin dashboard untuk kelola bisnis mandiri
- Email automation untuk customer experience

**⚠️ YANG PERLU SEGERA:**
- WhatsApp button → tambah konversi dalam 24 jam setelah dipasang
- Google Business Profile → ranking Maps = booking gratis
- Google Ads → traffic yang jelas dan terukur ROI-nya
- Kumpulkan Google Reviews dari customer lama

**🚀 UNTUK SKALA BESAR:**
- Corporate B2B sales
- Hotel & wedding planner partnership
- Daftar di Klook/Viator
- Loyalty & referral program

---

### Satu Kalimat untuk Diingat:

> **"Platform sudah siap. Sekarang saatnya isi dengan traffic, konversi dengan trust, dan scale dengan partnership."**

---

---

## SLIDE 23 — THANK YOU

# Terima Kasih

**ZBK Limousine Tours**
zbktransportservices.com

📞 +65 9747 6453
📧 zbklimo@gmail.com
📍 Jurong West Street 65, Singapore 640635

---

🤙 Facebook · Instagram · TikTok : **@zbksingapore**

---

_Dokumen ini dibuat sebagai strategic deck internal._
_Untuk pertanyaan teknis atau implementasi, hubungi tim developer._

---

**LAMPIRAN**

### Tech Stack Summary (untuk developer reference)
- **Framework:** Next.js 15, React 19, TypeScript
- **Database:** PostgreSQL + Prisma ORM
- **Payment:** Stripe (cards, PayNow, Stripe Link)
- **Email:** Nodemailer (SMTP)
- **Auth:** JWT + bcryptjs
- **Analytics:** Google Analytics GA4 + Google Ads
- **Hosting:** (sesuaikan dengan environment produksi)
- **API Endpoints:** 48 endpoints
- **Pages:** 13 publik + 7 admin
- **Models DB:** 10 model (User, Customer, Vehicle, Booking, Blog, dll.)
