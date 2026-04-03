# 📊 Google Ads Conversion Tracking Setup

## ✅ Status: Sudah Diinstall & Dikonfigurasi

Google Ads conversion tracking tag sudah ditambahkan ke website dan helper functions sudah diintegrasikan.

### 📍 Lokasi Implementation

**Files:**
- `src/components/GoogleAnalytics.tsx` - Base tag dan global helper function
- `src/utils/googleAds.ts` - TypeScript utility functions
- `src/components/organisms/VehicleSearchModal.tsx` - Conversion tracking untuk redirect ke Stripe
- `src/app/(website)/payment/success/page.tsx` - Conversion tracking untuk completed booking

Tag Google Ads sudah diintegrasikan dengan Google Analytics yang sudah ada, dan helper functions sudah ditambahkan untuk delayed navigation.

### 🔧 Konfigurasi

**Google Ads Conversion ID:** `AW-17828596675`

Tag sudah di-load di semua halaman melalui `layout.tsx` (root layout).

---

## 🎯 Next Steps: Setup Conversion Actions

Setelah tag base sudah diinstall, Anda perlu setup conversion actions di Google Ads:

### Step 1: Setup Conversion Action di Google Ads

1. Login ke Google Ads: https://ads.google.com
2. Klik **Tools & Settings** (icon tools di kanan atas)
3. Pilih **Conversions** di bawah "Measurement"
4. Klik **"+ New conversion action"**
5. Pilih **"Website"**
6. Isi form:
   - **Category:** Select "Submit lead form" atau "Contact"
   - **Conversion name:** "Booking Form Submission"
   - **Value:** 
     - Select "Use different values for each conversion"
     - Atau set fixed value (misalnya $50 per booking)
   - **Count:** Select "One" (count once per conversion)
   - **Click-through window:** 30 days (default)
   - **Engagement window:** 30 days (default)
   - **Attribution model:** Data-driven atau Last click (default)

7. Klik **"Create and continue"**

### Step 2: Google Ads akan Generate Conversion Code

Google Ads akan memberikan 2 pilihan:

#### Option A: Use Google Tag (Recommended - Sudah Diinstall ✅)

Karena kita sudah install base tag, kita hanya perlu:
1. Pilih **"Use Google Tag"**
2. Google akan automatically detect tag yang sudah diinstall
3. Klik **"Done"** atau **"Verify tag"**

#### Option B: Add Code Snippet Manually

Jika perlu manual (tidak direkomendasikan karena sudah pakai base tag):
- Google akan berikan code snippet untuk di-add di halaman conversion

---

## 📍 Conversion Events yang Perlu Di-Track

### 1. Booking Form Submission (Primary Conversion)

**Trigger:** User submit booking form dan sampai di confirmation page

**Halaman:** `/payment/success` atau `/booking/confirmation`

**Implementation:**
```javascript
// Add to payment success page atau booking confirmation page
gtag('event', 'conversion', {
  'send_to': 'AW-17828596675/CONVERSION_LABEL', // Replace CONVERSION_LABEL dengan label dari Google Ads
  'value': bookingTotalAmount, // Optional: booking amount
  'currency': 'SGD'
});
```

**File yang perlu di-update:**
- `src/app/(website)/payment/success/page.tsx`
- `src/app/(website)/booking/confirmation/page.tsx`

### 2. Phone Call Clicks (Secondary Conversion)

**Trigger:** User click phone number

**Implementation:**
```javascript
// Add onclick to phone links
<a href="tel:+6581234567" 
   onClick={() => {
     if (typeof window !== 'undefined' && (window as any).gtag) {
       (window as any).gtag('event', 'conversion', {
         'send_to': 'AW-17828596675/PHONE_CALL_CONVERSION_LABEL'
       });
     }
   }}>
   Call Us
</a>
```

### 3. Contact Form Submission

**Trigger:** User submit contact form

**Halaman:** Contact form thank you page

---

## 🔍 Verifikasi Tag Installation

### Method 1: Google Tag Assistant

1. Install Chrome Extension: [Google Tag Assistant](https://chrome.google.com/webstore/detail/tag-assistant-legacy-by-g/kejbdjndbnbjgmefkgdddjlbokphdefk)
2. Visit website: https://www.zbktransportservices.com
3. Klik extension icon
4. Harus terlihat:
   - ✅ Google Analytics: G-3MQD3KV6MM
   - ✅ Google Ads: AW-17828596675

### Method 2: Google Ads Tag Verification

1. Google Ads → Tools & Settings → Conversions
2. Klik conversion action yang dibuat
3. Klik **"Tag setup"** tab
4. Klik **"Check installation"**
5. Visit website Anda
6. Harus muncul: ✅ "Tag detected"

### Method 3: Browser Console

1. Buka website di browser
2. Open Developer Tools (F12)
3. Go to Console tab
4. Type: `window.dataLayer`
5. Harus muncul array dengan gtag configs

---

## 📊 Testing Conversions

### Test Conversion di Google Ads:

1. Google Ads → Tools & Settings → Conversions
2. Klik conversion action
3. Klik **"Test conversion"**
4. Masukkan URL website Anda
5. Klik **"Test"**
6. Conversion akan muncul di dashboard (bisa beberapa menit delay)

### Test Real Conversion:

1. Buka website
2. Complete booking flow
3. Sampai di confirmation page
4. Check Google Ads → Conversions → harus muncul conversion baru (dengan delay beberapa menit/jam)

---

## 🎯 Conversion Values (Optional)

Jika ingin track revenue per conversion:

```javascript
gtag('event', 'conversion', {
  'send_to': 'AW-17828596675/CONVERSION_LABEL',
  'value': bookingTotalAmount, // Total booking amount
  'currency': 'SGD',
  'transaction_id': bookingId // Optional: untuk avoid duplicate
});
```

Ini akan membantu track:
- ROAS (Return on Ad Spend)
- Cost per conversion dengan value
- Revenue generated dari ads

---

## ✅ Checklist Setup

- [x] Google Ads base tag installed (AW-17828596675)
- [ ] Conversion action created di Google Ads
- [ ] Conversion tag verified di Google Ads
- [ ] Conversion event code added ke booking confirmation page
- [ ] Test conversion di Google Ads
- [ ] Real conversion tested (complete booking flow)
- [ ] Conversion data muncul di Google Ads dashboard

---

## 📞 Support

Jika tag tidak terdeteksi:
1. Check browser console untuk error
2. Verify tag ada di page source (View Page Source → search "AW-17828596675")
3. Check Google Tag Assistant untuk error
4. Pastikan tidak ada ad blocker yang memblokir

---

**Last Updated:** January 2025  
**Google Ads ID:** AW-17828596675  
**Status:** ✅ Base Tag Installed - Need Conversion Actions Setup

