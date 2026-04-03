# 📤 Upload Configuration Guide for Production

## 🚨 Problem
File uploads menggunakan file system (`fs/promises`) **tidak bekerja di production** karena serverless environment seperti Vercel memiliki file system yang **read-only**.

## ✅ Solutions

### Option 1: Cloudinary (Recommended - FREE)

Cloudinary menawarkan free tier yang sangat baik untuk image hosting.

#### 1. Sign up for Cloudinary
- Visit: https://cloudinary.com/users/register_free
- Get your credentials: **Cloud Name**, **API Key**, **API Secret**

#### 2. Install Cloudinary Package
```bash
npm install cloudinary
```

#### 3. Add Environment Variables
Tambahkan di `.env.local` (development) dan Vercel Environment Variables (production):

```env
# Cloudinary Configuration
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

#### 4. Create Upload API with Cloudinary
File akan otomatis terupdate untuk menggunakan Cloudinary di production.

---

### Option 2: Vercel Blob Storage

Jika Anda menggunakan Vercel Pro, Anda bisa menggunakan Vercel Blob.

#### 1. Enable Vercel Blob
```bash
npm install @vercel/blob
```

#### 2. Add to Environment Variables
```env
BLOB_READ_WRITE_TOKEN=your_token_from_vercel
```

---

### Option 3: AWS S3 (More Complex)

Untuk aplikasi enterprise, AWS S3 adalah pilihan terbaik.

#### 1. Install AWS SDK
```bash
npm install @aws-sdk/client-s3 @aws-sdk/s3-request-presigner
```

#### 2. Configure AWS Credentials
```env
AWS_ACCESS_KEY_ID=your_access_key
AWS_SECRET_ACCESS_KEY=your_secret_key
AWS_REGION=ap-southeast-1
AWS_S3_BUCKET=your-bucket-name
```

---

## 🔧 Current Status

**Development**: ✅ Works (file system)  
**Production**: ❌ Requires cloud storage setup

## 📝 Next Steps

1. Choose a storage provider (Cloudinary recommended for ease of use)
2. Sign up and get credentials
3. Add environment variables to Vercel
4. Deploy updated code

## 🆘 Need Help?

Contact your developer or refer to:
- Cloudinary Docs: https://cloudinary.com/documentation
- Vercel Blob Docs: https://vercel.com/docs/storage/vercel-blob
- AWS S3 Docs: https://docs.aws.amazon.com/s3/












