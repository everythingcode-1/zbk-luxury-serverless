# Blog Image Upload Guide

## Masalah yang Sudah Diperbaiki

### Problem Sebelumnya:
- Konten blog menampilkan raw JSON dan base64 image data yang sangat panjang
- Base64 images membuat halaman blog tidak rapi dan lambat
- Content tidak ter-render dengan baik

### Solusi yang Diterapkan:

#### 1. **Image Renderer Filter**
File: `src/utils/editorjs-renderer.tsx`

Renderer sekarang akan:
- ✅ Skip base64 data URLs (terlalu besar)
- ✅ Tampilkan warning message untuk base64 images
- ✅ Hanya render image URLs yang proper

#### 2. **Image Upload API**
File: `src/app/api/upload-image/route.ts`

API endpoint baru untuk upload images:
- **Endpoint**: `POST /api/upload-image`
- **Max Size**: 5MB per image
- **Allowed Types**: All image types (jpg, png, gif, webp, etc.)
- **Upload Location**: `/public/uploads/blog/`
- **Response Format**:
  ```json
  {
    "success": 1,
    "file": {
      "url": "/uploads/blog/timestamp-filename.jpg"
    }
  }
  ```

#### 3. **Editor.js Image Tool Update**
File: `src/components/admin/EditorJSComponent.tsx`

Sekarang menggunakan `@editorjs/image` dengan proper upload configuration:
- ✅ Upload file ke server (bukan base64)
- ✅ Support drag & drop
- ✅ Support paste from clipboard
- ✅ Support URL input

---

## Cara Menggunakan (Untuk Admin)

### Upload Image di Blog Editor:

#### **Method 1: Drag & Drop**
1. Buka Blog Modal (Create/Edit Blog Post)
2. Drag image file dari komputer Anda
3. Drop ke editor area
4. Image akan otomatis ter-upload ke server

#### **Method 2: Click to Upload**
1. Click tombol "+" di editor
2. Pilih "Image"
3. Click "Select an Image"
4. Pilih file dari komputer
5. Image akan ter-upload

#### **Method 3: Paste URL**
1. Click tombol "+" di editor
2. Pilih "Image"
3. Paste image URL di field yang tersedia
4. Image akan di-fetch dan disimpan

#### **Method 4: Paste from Clipboard**
1. Copy image (dari browser atau screenshot)
2. Paste (Ctrl+V / Cmd+V) di editor
3. Image akan otomatis ter-upload

---

## Untuk Blog Post yang Sudah Ada

### Jika Blog Post Lama Masih Menampilkan Base64 Warning:

**Option 1: Re-upload Images**
1. Edit blog post yang bermasalah
2. Hapus image lama (yang base64)
3. Upload ulang image menggunakan method di atas
4. Save blog post

**Option 2: Manual Fix (Advanced)**
1. Simpan image base64 ke file terpisah
2. Upload via image tool
3. Replace image block dengan yang baru

---

## Technical Details

### File Structure:
```
src/
├── app/
│   └── api/
│       └── upload-image/
│           └── route.ts          # Image upload API
├── components/
│   └── admin/
│       └── EditorJSComponent.tsx # Editor with image upload
└── utils/
    └── editorjs-renderer.tsx     # Renderer with base64 filter

public/
└── uploads/
    └── blog/                     # Uploaded images stored here
        ├── 1738948234567-image1.jpg
        └── 1738948235678-image2.png
```

### Image Naming Convention:
- Format: `{timestamp}-{sanitized-filename}`
- Example: `1738948234567-my-blog-image.jpg`
- Sanitization: Special characters replaced with `_`

### Security Features:
- ✅ File type validation (images only)
- ✅ File size limit (5MB max)
- ✅ Filename sanitization
- ✅ Secure file storage in public/uploads/blog/

---

## Troubleshooting

### Image Not Uploading?
1. Check file size (max 5MB)
2. Check file type (must be image)
3. Check browser console for errors
4. Verify `/public/uploads/blog/` directory exists

### Image Not Displaying on Blog Page?
1. Check if image URL starts with `/uploads/blog/`
2. Verify file exists in `public/uploads/blog/`
3. Check browser network tab for 404 errors

### Still Seeing Base64 Warning?
- This means the blog post was created before the fix
- Solution: Edit the post and re-upload images

---

## Best Practices

### ✅ DO:
- Use optimized images (compress before upload)
- Use descriptive filenames
- Add captions to images for SEO
- Keep images under 1MB when possible

### ❌ DON'T:
- Don't upload very large images (>5MB)
- Don't use base64 images anymore
- Don't paste images from Word/Excel (may not work)
- Don't upload copyrighted images without permission

---

## Summary

**Sekarang blog Anda:**
- ✅ Render konten dengan clean HTML
- ✅ Images di-upload ke server (bukan base64)
- ✅ Fast loading times
- ✅ SEO-friendly
- ✅ Professional appearance

**Untuk blog post baru:**
- Gunakan image upload feature yang sudah diperbaiki
- Images akan otomatis ter-handle dengan baik

**Untuk blog post lama:**
- Edit dan re-upload images jika masih ada base64 warning
- Atau biarkan warning (tidak akan break halaman)
