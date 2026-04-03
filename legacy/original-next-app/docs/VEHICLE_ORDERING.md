# 🚗 Vehicle Ordering System - ZBK Limo

## 📋 Overview

Sistem ordering kendaraan di ZBK Limo menggunakan field `carouselOrder` untuk menentukan urutan tampilan kendaraan di seluruh website, termasuk hero section dan fleet section.

---

## 🎯 Urutan Kendaraan Saat Ini

| Order | Vehicle | Model | Display Position |
|-------|---------|-------|------------------|
| **1️⃣** | **Toyota Alphard** | ALPHARD | Pertama (Hero & Fleet) |
| **2️⃣** | **Toyota Noah** | NOAH | Kedua |
| **3️⃣** | **Toyota Hiace Combi** | HIACE | Ketiga |

---

## 🔧 Implementasi Teknis

### 1. Database Schema

**Field**: `carouselOrder Int?` (Optional)

```prisma
model Vehicle {
  id            String  @id @default(cuid())
  name          String
  model         String
  // ... other fields ...
  carouselOrder Int?    // Optional: 1, 2, 3, etc.
  // ... other fields ...
}
```

**Location**: `prisma/schema.prisma` line 80

### 2. API Endpoints dengan Sorting

#### A. `/api/vehicles/route.ts`

```typescript
const vehicles = await prisma.vehicle.findMany({
  orderBy: [
    { carouselOrder: 'asc' },   // Priority 1: Carousel order
    { createdAt: 'desc' }        // Priority 2: Creation date
  ]
})
```

**Used by**: 
- FleetSection component
- Admin dashboard
- General vehicle listings

#### B. `/api/public/vehicles/route.ts`

```typescript
const vehicles = await prisma.vehicle.findMany({
  where: whereClause,
  orderBy: [
    { carouselOrder: 'asc' },
    { name: 'asc' }
  ]
})
```

**Used by**:
- Public website
- Customer-facing pages
- Vehicle search

#### C. `/api/admin/vehicles/route.ts`

```typescript
const vehicles = await prisma.vehicle.findMany({
  where,
  orderBy: [
    { carouselOrder: 'asc' },
    { createdAt: 'desc' }
  ]
})
```

**Used by**:
- Admin panel
- Vehicle management
- Dashboard statistics

### 3. Frontend Components

#### A. FleetSection.tsx ✅

**Location**: `src/components/organisms/FleetSection.tsx`

**Implementation**:
```typescript
const fetchVehicles = async () => {
  const response = await fetch('/api/vehicles')
  const result = await response.json()
  const availableVehicles = result.data.filter(v => v.status === 'AVAILABLE')
  setVehicles(availableVehicles) // Already sorted by API
}
```

**Usage**:
- Homepage hero section
- Fleet page
- Vehicle showcase

**Display Logic**:
- Homepage: Shows first 4 vehicles (in carousel order)
- Fleet page: Shows all vehicles (in carousel order)

#### B. VehicleSelection.tsx ✅

**Location**: `src/components/molecules/VehicleSelection.tsx`

**Implementation**:
```typescript
const fetchVehicles = async () => {
  const response = await fetch('/api/public/vehicles')
  // Vehicles already sorted by carouselOrder from API
  setVehicles(result.data || [])
}
```

**Usage**:
- Booking form
- Vehicle selection modal
- Search & filter

#### C. Hero Section ✅

**Location**: `src/components/organisms/Hero.tsx`

**Implementation**:
- Uses `FleetSection` component
- Inherits sorting from FleetSection
- Displays vehicles in carousel order

---

## 📐 Layout Logic

### Homepage (FleetSection with showAll=false)

```typescript
const vehiclesToShow = showAll ? vehicles : vehicles.slice(0, 4)
```

**Display**:
- Shows first 4 vehicles from sorted array
- Urutan: Alphard → Noah → Combi → (if exists)

### Fleet Page (FleetSection with showAll=true)

```typescript
const vehiclesToShow = showAll ? vehicles : vehicles.slice(0, 4)
```

**Display**:
- Shows all available vehicles
- Maintains carousel order for all vehicles

### Grid Layout

**For 3 vehicles** (current state):
```
┌─────────┬─────────┬─────────┐
│ Alphard │  Noah   │  Combi  │
│   #1    │   #2    │   #3    │
└─────────┴─────────┴─────────┘
```

**For 4 vehicles**:
```
┌─────────┬─────────┐
│ Alphard │  Noah   │
│   #1    │   #2    │
├─────────┼─────────┤
│  Combi  │ Vehicle │
│   #3    │   #4    │
└─────────┴─────────┘
```

**For 5 vehicles**:
```
┌─────────┬─────────┬─────────┐
│ Alphard │  Noah   │  Combi  │
│   #1    │   #2    │   #3    │
└─────────┴─────────┴─────────┘
    ┌─────────┬─────────┐
    │ Vehicle │ Vehicle │
    │   #4    │   #5    │
    └─────────┴─────────┘
```

---

## 🔄 Cara Mengubah Urutan

### Option 1: Via Database (Recommended)

**SQL Query**:
```sql
-- Set Alphard as #1
UPDATE vehicles 
SET "carouselOrder" = 1 
WHERE model = 'ALPHARD';

-- Set Noah as #2
UPDATE vehicles 
SET "carouselOrder" = 2 
WHERE model = 'NOAH';

-- Set Combi as #3
UPDATE vehicles 
SET "carouselOrder" = 3 
WHERE model = 'HIACE';
```

**Via Prisma Studio**:
1. Run: `npm run db:studio`
2. Navigate to `vehicles` table
3. Edit `carouselOrder` field
4. Save changes
5. Refresh website

### Option 2: Via Admin Dashboard (Future Feature)

**TODO**: Implement drag-and-drop ordering in admin panel

```typescript
// Future implementation
const updateVehicleOrder = async (vehicleId: string, newOrder: number) => {
  await fetch(`/api/admin/vehicles/${vehicleId}`, {
    method: 'PATCH',
    body: JSON.stringify({ carouselOrder: newOrder })
  })
}
```

### Option 3: Via Seeder

**File**: `prisma/seed-complete.ts` or `prisma/seed-vehicles.ts`

```typescript
const alphard = await prisma.vehicle.upsert({
  where: { plateNumber: 'SGX-ALPHARD-001' },
  update: { carouselOrder: 1 },
  create: {
    // ... vehicle data ...
    carouselOrder: 1
  }
})
```

Then run:
```bash
npm run db:seed:vehicles
```

---

## ✅ Verification Steps

### 1. Check Database Order

```sql
SELECT id, name, model, "carouselOrder" 
FROM vehicles 
ORDER BY "carouselOrder" ASC NULLS LAST;
```

**Expected Result**:
```
id  | name                      | model   | carouselOrder
----|---------------------------|---------|---------------
xxx | TOYOTA ALPHARD            | ALPHARD | 1
yyy | TOYOTA NOAH               | NOAH    | 2
zzz | TOYOTA HIACE COMBI        | HIACE   | 3
```

### 2. Check API Response

```bash
curl http://localhost:3000/api/vehicles | jq '.data[] | {name, carouselOrder}'
```

**Expected Output**:
```json
[
  { "name": "TOYOTA ALPHARD", "carouselOrder": 1 },
  { "name": "TOYOTA NOAH", "carouselOrder": 2 },
  { "name": "TOYOTA HIACE COMBI", "carouselOrder": 3 }
]
```

### 3. Check Website Display

**Homepage**:
1. Open: `http://localhost:3000`
2. Scroll to "Our Premium Fleet" section
3. Verify order: Alphard → Noah → Combi

**Fleet Page**:
1. Open: `http://localhost:3000/fleet`
2. Verify order: Alphard → Noah → Combi

### 4. Check Browser DevTools

**Open Network Tab**:
1. F12 → Network → Fetch/XHR
2. Look for `/api/vehicles` request
3. Check response array order

---

## 🎨 Customization Guide

### Adding New Vehicle

**Step 1**: Add to database with carousel order

```typescript
const newVehicle = await prisma.vehicle.create({
  data: {
    name: 'TOYOTA VELLFIRE',
    model: 'VELLFIRE',
    carouselOrder: 2, // Insert between Alphard and Noah
    // ... other fields ...
  }
})
```

**Step 2**: Update existing vehicles

```sql
-- Shift Noah to #3
UPDATE vehicles SET "carouselOrder" = 3 WHERE model = 'NOAH';

-- Shift Combi to #4
UPDATE vehicles SET "carouselOrder" = 4 WHERE model = 'HIACE';
```

**New Order**:
1. Alphard (#1)
2. Vellfire (#2) ← New
3. Noah (#3)
4. Combi (#4)

### Removing Vehicle from Display

**Option 1**: Set carouselOrder to NULL
```sql
UPDATE vehicles 
SET "carouselOrder" = NULL 
WHERE model = 'HIACE';
```
→ Vehicle will appear last (sorted by createdAt)

**Option 2**: Change status
```sql
UPDATE vehicles 
SET status = 'MAINTENANCE' 
WHERE model = 'HIACE';
```
→ Vehicle won't show in "AVAILABLE" filters

---

## 🚨 Troubleshooting

### Issue: Vehicles not in correct order

**Check**:
1. Database has correct carouselOrder values
2. API endpoint returns sorted data
3. Frontend doesn't re-sort data
4. Cache is cleared (Ctrl+Shift+R)

**Solution**:
```bash
# Verify database
npm run db:studio

# Check carouselOrder field
# If missing, run migration:
npm run db:migrate

# Re-seed data:
npm run db:seed:vehicles
```

### Issue: New vehicle appears at wrong position

**Check**:
1. carouselOrder was set during creation
2. Other vehicles' orders are correct
3. No duplicate carouselOrder values

**Solution**:
```sql
-- Check for duplicates
SELECT "carouselOrder", COUNT(*) 
FROM vehicles 
GROUP BY "carouselOrder" 
HAVING COUNT(*) > 1;

-- Fix duplicates by reassigning
UPDATE vehicles SET "carouselOrder" = X WHERE id = 'vehicle-id';
```

### Issue: Hero section shows different order than Fleet page

**This should NOT happen** if implementation is correct.

**Check**:
1. Both use same API endpoint
2. No hardcoded vehicle order in components
3. No client-side sorting overriding API order

**Solution**: Review component code to ensure no array manipulation

---

## 📊 Best Practices

### 1. Consistent Ordering
- ✅ All components use API data (already sorted)
- ✅ No client-side re-sorting
- ✅ Single source of truth (database)

### 2. Flexible System
- ✅ carouselOrder is optional (Int?)
- ✅ Vehicles without order appear last
- ✅ Easy to add/remove vehicles

### 3. Performance
- ✅ Sorting done at database level
- ✅ Indexed carouselOrder field (recommended)
- ✅ Minimal frontend processing

### 4. Maintainability
- ✅ Clear documentation
- ✅ Consistent API structure
- ✅ Easy to debug

---

## 🔮 Future Enhancements

### 1. Admin UI for Ordering
```typescript
// Drag-and-drop interface
<DragDropContext onDragEnd={handleReorder}>
  <Droppable droppableId="vehicles">
    {vehicles.map((vehicle, index) => (
      <Draggable 
        key={vehicle.id} 
        draggableId={vehicle.id} 
        index={index}
      >
        {/* Vehicle card */}
      </Draggable>
    ))}
  </Droppable>
</DragDropContext>
```

### 2. Multiple Display Orders
```prisma
model Vehicle {
  carouselOrder     Int? // Homepage order
  fleetPageOrder    Int? // Fleet page order
  categoryOrder     Int? // Order within category
}
```

### 3. A/B Testing
```typescript
// Different orders for different user segments
const getVehicleOrder = (userSegment: string) => {
  if (userSegment === 'business') {
    return 'businessPriority'
  }
  return 'default'
}
```

---

## 📝 Summary

**Current Status**: ✅ **FULLY IMPLEMENTED**

- ✅ Database field: `carouselOrder`
- ✅ API endpoints: All sorted correctly
- ✅ Frontend components: Use API data
- ✅ Hero section: Shows correct order
- ✅ Fleet section: Shows correct order
- ✅ Seeder: Populates with correct order

**Vehicle Order**: **Alphard (#1) → Noah (#2) → Combi (#3)**

**Consistency**: **100%** across all pages and components

---

**Last Updated**: December 2024  
**Version**: 1.0.0  
**Status**: Production Ready ✅














