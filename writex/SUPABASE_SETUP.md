# Supabase Integration Setup Guide

## Overview
This guide will help you set up Supabase for image uploads in your Writex blog application. Images will be uploaded to Supabase Storage and the URLs will be stored in your blog posts.

## Prerequisites
- A Supabase project (create one at [supabase.com](https://supabase.com))
- Node.js and npm installed
- Your Writex project set up

## Step 1: Create a Supabase Project

1. Go to [Supabase Console](https://supabase.com/dashboard)
2. Click "New Project"
3. Choose your organization
4. Enter a project name (e.g., "writex-blog")
5. Enter a database password (save this!)
6. Choose a region close to your users
7. Click "Create new project"

## Step 2: Get Supabase Configuration

1. In your Supabase project dashboard, go to "Settings" → "API"
2. Copy the following values:
   - Project URL
   - Anon (public) key

## Step 3: Set Environment Variables

Create a `.env` file in the `writex` directory with your Supabase configuration:

```env
# Supabase Configuration
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key_here

# Your existing API configuration
VITE_API_BASE_URL=http://localhost:5000
```

## Step 4: Configure Supabase Storage

1. In Supabase Console, go to "Storage" in the left sidebar
2. Click "Create a new bucket"
3. Name it `Write-x-img` (or use your preferred bucket name)
4. Set it as "Public" (so images can be accessed without authentication)
5. Click "Create bucket"

## Step 5: Set Storage Policies

1. In the Storage section, click on the `Write-x-img` bucket
2. Go to "Policies" tab
3. Click "New Policy"
4. Choose "Create a policy from scratch"
5. Set the following policies:

### For SELECT (read access):
```sql
-- Allow public read access to all images
CREATE POLICY "Public Access" ON storage.objects FOR SELECT USING (bucket_id = 'Write-x-img');
```

### For INSERT (upload access):
```sql
-- Allow authenticated users to upload images
CREATE POLICY "Authenticated users can upload" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'Write-x-img' AND auth.role() = 'authenticated');
```

### For DELETE (delete access):
```sql
-- Allow authenticated users to delete their own images
CREATE POLICY "Users can delete own images" ON storage.objects FOR DELETE USING (bucket_id = 'Write-x-img' AND auth.role() = 'authenticated');
```

## Step 6: Test the Integration

1. Start your backend server: `cd Backend && npm start`
2. Start your frontend: `npm run dev`
3. Go to the Write Blog page
4. Click the image upload button in the toolbar
5. Select an image file
6. The image should upload to Supabase and appear in the editor
7. The first uploaded image will automatically become the main image for the blog post

## How It Works

### Frontend Flow:
1. User clicks image upload button in TipTap editor
2. File picker opens
3. User selects an image file
4. Image is uploaded to Supabase Storage via `uploadImageToSupabase()`
5. Supabase returns a public URL
6. Image is inserted into the editor
7. First image becomes the main image for the blog post

### Backend Flow:
1. When publishing, the `mainImage` URL is sent to the backend
2. Backend stores the Supabase Storage URL in the blog post
3. The URL points directly to Supabase Storage

## File Structure

```
writex/
├── src/
│   ├── lib/
│   │   ├── supabase.ts              # Supabase initialization
│   │   ├── supabase-storage.ts      # Storage utility functions
│   │   └── new-tiptap-utils.ts     # Updated TipTap image upload
│   └── components/
│       └── tiptap-templates/
│           └── simple/
│               └── simple-editor.tsx # TipTap editor with Supabase integration
├── .env                              # Environment variables (create this)
└── SUPABASE_SETUP.md                 # This file
```

## Troubleshooting

### Common Issues:

1. **"Missing Supabase environment variables"**
   - Check your `.env` file exists and has the correct variables
   - Make sure the `.env` file is in the correct location

2. **"Storage bucket not found"**
   - Verify your bucket name is `Write-x-img`
   - Make sure the bucket is created in Supabase

3. **"Unauthorized" errors**
   - Check your storage policies
   - Make sure the bucket is set to public
   - Verify your anon key is correct

4. **Images not uploading**
   - Check browser console for errors
   - Verify Supabase configuration values
   - Check if the image file is under 5MB

### Debug Steps:
1. Open browser developer tools
2. Check the Console tab for error messages
3. Check the Network tab to see if requests are being made
4. Verify your Supabase project is active

## Security Notes

- Supabase Storage policies control access to images
- File size is limited to 5MB
- Images are publicly readable (adjust policies if you need private images)
- Consider implementing authentication for more secure uploads

## Next Steps

After successful setup, you can:
1. Add image deletion functionality
2. Implement image optimization
3. Add image galleries
4. Implement user authentication with Supabase Auth
5. Add image metadata storage in Supabase Database
6. Set up real-time subscriptions for collaborative editing

## Support

If you encounter issues:
1. Check the Supabase Console for any error messages
2. Verify your configuration values
3. Check the browser console for detailed error logs
4. Ensure your Supabase project has Storage enabled
5. Check the [Supabase Documentation](https://supabase.com/docs)

## Migration from Firebase

This setup replaces Firebase with Supabase. The main differences are:
- Supabase uses PostgreSQL instead of Firestore
- Storage policies are more flexible and SQL-based
- Authentication is built on top of PostgreSQL
- Real-time subscriptions are PostgreSQL-based
- Pricing is generally more predictable
