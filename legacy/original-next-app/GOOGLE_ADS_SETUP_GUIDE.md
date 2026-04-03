# 🎯 Google Ads Setup Guide untuk ZBK Limo Tours

## 📋 Rekomendasi Campaign Objective

Berdasarkan bisnis ZBK Limo Tours & Transportation Services, berikut rekomendasi objective:

### 🥇 **Primary Choice: LEADS** ⭐ (Recommended)

**Mengapa Leads?**
- ✅ Tujuan utama: Mendapatkan booking/pemesanan
- ✅ Track konversi: Form submission, phone calls, WhatsApp clicks
- ✅ Optimize untuk: Lead quality dan cost per lead
- ✅ Cocok untuk: Service business seperti limo/transportation

**Conversion Actions yang bisa di-track:**
1. Booking form submission
2. Phone call clicks (click-to-call)
3. WhatsApp/Contact form submissions
4. Email inquiries

### 🥈 Secondary Choice: SALES

**Mengapa Sales?**
- ✅ Sudah ada online booking system
- ✅ Bisa track revenue per campaign
- ✅ Optimize untuk: ROAS (Return on Ad Spend)
- ⚠️ Perlu setup conversion tracking yang lebih kompleks

### 🥉 Alternative: WEBSITE TRAFFIC

**Mengapa Website Traffic?**
- ✅ Cocok untuk brand awareness
- ✅ Meningkatkan organic traffic
- ✅ Build customer database
- ⚠️ Tidak optimize langsung untuk konversi

---

## 🚀 Step-by-Step Setup Guide

### **STEP 1: Pilih Campaign Objective**

1. Login ke Google Ads: https://ads.google.com
2. Klik **"New Campaign"**
3. Pilih **"Leads"** ⭐ (Recommended untuk tahap awal)
   - Klik **"Leads"** → **"Get leads and other conversions"**
   - Pilih **"Website"** sebagai lead source

### **STEP 2: Campaign Type**

Setelah pilih Leads, pilih:
- **Search** - Ads muncul di Google Search results
- Atau **Performance Max** - Multiple channels (Search, Display, YouTube, etc.)

**Rekomendasi untuk awal:**
- Mulai dengan **Search Campaign** untuk learning phase
- Setelah 1-2 bulan, tambahkan **Performance Max** untuk scale

---

## 🔧 Setup Conversion Tracking (PENTING!)

### **Option A: Google Tag (Recommended - Mudah)**

1. **Install Google Tag di Website:**
   ```html
   <!-- Global Site Tag (gtag.js) -->
   <script async src="https://www.googletagmanager.com/gtag/js?id=AW-CONVERSION_ID"></script>
   <script>
     window.dataLayer = window.dataLayer || [];
     function gtag(){dataLayer.push(arguments);}
     gtag('js', new Date());
     gtag('config', 'AW-CONVERSION_ID');
   </script>
   ```

2. **Setup Conversion Action di Google Ads:**
   - Google Ads → Tools & Settings → Conversions
   - Click **"+ New conversion action"**
   - Select **"Website"**
   - Category: **"Submit lead form"** atau **"Contact"**
   - Value: Set conversion value (optional)
   - Count: **"One"** (count once per conversion)

3. **Add Conversion Code:**
   - Google Ads akan generate conversion tag
   - Install di halaman **booking confirmation** atau **thank you page**

### **Option B: Google Analytics 4 (GA4) - Advanced**

Jika sudah pakai GA4:
1. Link Google Ads dengan Google Analytics 4
2. Import conversions dari GA4 ke Google Ads
3. Track events: `booking_completed`, `form_submission`, etc.

---

## 📍 Conversion Actions untuk ZBK Limo Tours

### **1. Booking Form Submission** (Primary Conversion)

**Setup:**
- Trigger: User submit booking form
- Page: `/booking/confirmation` atau `/payment/success`
- Value: Total booking amount (optional)

**Implementation:**
```javascript
// Add to booking confirmation page
gtag('event', 'conversion', {
  'send_to': 'AW-CONVERSION_ID/CONVERSION_LABEL',
  'value': bookingTotalAmount,
  'currency': 'SGD'
});
```

### **2. Phone Call Clicks** (Secondary Conversion)

**Setup:**
- Track: Click-to-call button clicks
- Value: Lower value (around $10-20 per call)

**Implementation:**
```html
<!-- Add onclick to phone links -->
<a href="tel:+6581234567" 
   onclick="gtag('event', 'conversion', {
     'send_to': 'AW-CONVERSION_ID/CALL_CONVERSION_LABEL'
   });">
   Call Us
</a>
```

### **3. Contact Form Submission**

**Setup:**
- Track: Contact form submissions
- Page: Contact form thank you page

### **4. WhatsApp Clicks**

**Setup:**
- Track: WhatsApp button clicks
- Value: Medium value (around $15-25 per click)

---

## 🎯 Campaign Structure Recommendations

### **Campaign 1: Branded Search**
- Name: `ZBK Limo Tours - Branded`
- Keywords: "zbk limo tours", "zbk transport", "zbk luxury transport"
- Bid: High (these are your customers looking for you)

### **Campaign 2: Service-Based Search**
- Name: `Singapore Limo Service - Airport Transfer`
- Keywords:
  - "singapore airport transfer"
  - "changi airport limo"
  - "luxury airport transfer singapore"
  - "toyota alphard rental singapore"
  - "premium car rental singapore"

### **Campaign 3: Vehicle-Specific**
- Name: `Toyota Alphard & Hiace Rental`
- Keywords:
  - "toyota alphard rental singapore"
  - "toyota hiace rental"
  - "luxury mpv rental singapore"

### **Campaign 4: Location-Based**
- Name: `Singapore Luxury Transport`
- Keywords:
  - "limo service singapore"
  - "luxury transportation singapore"
  - "premium car service singapore"

---

## 💰 Budget Recommendations

### **Initial Budget (Learning Phase - Month 1-2):**
- **Daily Budget:** SGD $20-50/day
- **Monthly:** SGD $600-1,500
- **Focus:** Testing keywords, ad copy, landing pages

### **Growth Phase (Month 3-6):**
- **Daily Budget:** SGD $50-150/day
- **Monthly:** SGD $1,500-4,500
- **Focus:** Scale winning campaigns

### **Optimization Phase (Month 6+):**
- **Daily Budget:** Based on ROAS
- **Target ROAS:** 3:1 to 5:1 (earn $3-5 for every $1 spent)
- **Focus:** Maximize profitable campaigns

---

## 📝 Ad Copy Templates

### **Headline 1: Service Focus**
```
Premium Limo Service Singapore | ZBK Luxury Transport
```

### **Headline 2: Vehicle Focus**
```
Toyota Alphard & Hiace Rental | Airport Transfer Specialist
```

### **Headline 3: Value Proposition**
```
24/7 Luxury Transport | Professional Chauffeur Service
```

### **Description 1:**
```
Experience premium transportation with ZBK Limo Tours. 
Airport transfers, city tours & special events. 
Book your luxury ride today!
```

### **Description 2:**
```
Singapore's trusted luxury transport service. 
Toyota Alphard & Hiace fleet available 24/7. 
Airport transfers, corporate & wedding services.
```

### **Call to Action:**
- "Book Now"
- "Get Quote"
- "Call Now"
- "View Fleet"

---

## 🎨 Landing Page Recommendations

### **For Search Campaigns:**

1. **Service-Specific Landing Pages:**
   - `/services/airport-transfer`
   - `/services/city-tour`
   - `/services/corporate-transport`

2. **Vehicle Landing Pages:**
   - `/fleet/toyota-alphard`
   - `/fleet/toyota-hiace`

3. **Location Landing Pages:**
   - `/services/singapore-luxury-transport`

### **Landing Page Best Practices:**

✅ **Do:**
- Clear headline matching ad copy
- Prominent booking form/CTA button
- Trust signals (reviews, ratings, certifications)
- Phone number (click-to-call)
- Clear pricing or "Get Quote" button
- Fast loading speed (< 3 seconds)

❌ **Don't:**
- Cluttered design
- Hidden contact information
- Slow loading pages
- Mobile-unfriendly layout

---

## 📊 Keywords Research Suggestions

### **High-Intent Keywords (Buy Now):**
- "book limo singapore"
- "airport transfer booking"
- "toyota alphard rental singapore"
- "changi airport limo service"
- "luxury car rental singapore price"

### **Medium-Intent Keywords (Research Phase):**
- "best limo service singapore"
- "premium transportation singapore"
- "toyota alphard rental price"
- "airport transfer singapore cost"

### **Low-Intent Keywords (Awareness):**
- "limo service singapore"
- "luxury transport singapore"
- "premium car rental singapore"

---

## 🔍 Negative Keywords List

Add these as negative keywords to avoid irrelevant clicks:

```
-free
-cheap
-job
-career
-hiring
-employment
-second hand
-used
-buy
-sell
-rental car (if focus on limo service)
```

---

## 📱 Mobile Optimization

**Critical for transportation services:**
- 70%+ searches are mobile
- Ensure mobile-friendly landing pages
- Fast loading speed on mobile
- Click-to-call prominently displayed
- Easy booking form on mobile

---

## 📈 Tracking & Optimization

### **Week 1-2: Learning Phase**
- Monitor: Click-through rate (CTR), Cost per click (CPC)
- Adjust: Pause low-performing keywords
- Focus: Let Google learn what works

### **Week 3-4: Optimization Phase**
- Monitor: Conversion rate, Cost per conversion
- Adjust: Increase bids on converting keywords
- Focus: Improve ad copy based on performance

### **Month 2+: Scale Phase**
- Monitor: ROAS, Total conversions, Revenue
- Adjust: Scale winning campaigns, pause losers
- Focus: Maximize profitable campaigns

---

## 🎯 Next Steps Action Plan

### **Immediate (Week 1):**

1. ✅ **Pilih Campaign Objective:** "Leads"
2. ✅ **Setup Conversion Tracking:** Install Google Tag
3. ✅ **Create 1-2 Test Campaigns:** Start with branded + 1 service campaign
4. ✅ **Set Daily Budget:** SGD $20-50/day
5. ✅ **Launch Campaigns:** Let them run for 1-2 weeks

### **Short-term (Month 1-2):**

1. ✅ **Monitor Performance:** Check daily
2. ✅ **Optimize Ad Copy:** Test 2-3 variations
3. ✅ **Add Negative Keywords:** Remove irrelevant clicks
4. ✅ **Expand Winning Campaigns:** Add more keywords/ad groups
5. ✅ **Setup Additional Conversions:** Phone calls, WhatsApp

### **Long-term (Month 3+):**

1. ✅ **Scale Budget:** Increase for winning campaigns
2. ✅ **Add Performance Max:** Multi-channel campaigns
3. ✅ **Refine Targeting:** Location, demographics, devices
4. ✅ **A/B Test Landing Pages:** Improve conversion rate
5. ✅ **Track Full Funnel:** From ad click to booking completion

---

## 🆘 Common Issues & Solutions

### **Issue: No Conversions**
- **Solution:** Check conversion tracking installation
- Verify tags fire on confirmation page
- Check Google Tag Assistant

### **Issue: High Cost, Low Conversions**
- **Solution:** Add negative keywords
- Refine keyword match types (use exact/phrase)
- Improve landing page relevance

### **Issue: Low Click-Through Rate (CTR)**
- **Solution:** Improve ad copy (more compelling headlines)
- Add extensions (call, location, sitelinks)
- Increase keyword relevance

### **Issue: Low Quality Score**
- **Solution:** Improve landing page relevance
- Better ad relevance to keywords
- Increase expected CTR (better ad copy)

---

## 📞 Support Resources

- **Google Ads Help:** https://support.google.com/google-ads
- **Google Ads Community:** https://support.google.com/google-ads/community
- **Conversion Tracking Guide:** https://support.google.com/google-ads/answer/1722054

---

## ✅ Checklist untuk Launch

- [ ] Google Ads account setup
- [ ] Conversion tracking installed
- [ ] Google Tag installed di website
- [ ] At least 1 conversion action setup
- [ ] Landing pages optimized (mobile-friendly, fast loading)
- [ ] First campaign created (Branded or Service-based)
- [ ] Daily budget set
- [ ] Keywords added (at least 10-20 per campaign)
- [ ] Ad copy written (2-3 variations)
- [ ] Negative keywords list prepared
- [ ] Extensions added (call, location, sitelinks)
- [ ] Campaign launched
- [ ] Performance monitoring setup (daily check)

---

**Last Updated:** January 2025  
**Prepared for:** ZBK Limo Tours & Transportation Services  
**Contact:** zbklimo@gmail.com  
**Website:** https://www.zbktransportservices.com







