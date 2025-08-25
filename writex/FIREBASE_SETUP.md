# Firebase Storage Integration Setup Guide

## Overview
This guide will help you set up Firebase Storage for image uploads in your Writex blog application. Images will be uploaded directly to Firebase Storage and the URLs will be stored in your blog posts.

## Prerequisites
- A Firebase project (already created)
- Node.js and npm installed
- Your Writex project set up

## Step 1: Get Firebase Configuration

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project
3. Click the gear icon (⚙️) next to "Project Overview"
4. Select "Project settings"
5. Scroll down to "Your apps" section
6. If you don't have a web app, click the web icon (</>) to create one
7. Copy the configuration values from the `firebaseConfig` object

## Step 2: Set Environment Variables

Create or update your `.env` file in the `writex` directory with your Firebase configuration:

```env
# Firebase Configuration
VITE_FIREBASE_API_KEY=your_actual_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project_id.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
VITE_FIREBASE_APP_ID=your_app_id

# Your existing API configuration
VITE_API_BASE_URL=http://localhost:5000
```

## Step 3: Configure Firebase Storage Rules

1. In Firebase Console, go to "Storage" in the left sidebar
2. Click on "Rules" tab
3. Update the rules to allow image uploads:

```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    // Allow read access to all images
    match /blog-images/{imageId} {
      allow read: if true;
      allow write: if request.resource.size < 5 * 1024 * 1024 // 5MB limit
                   && request.resource.contentType.matches('image/.*');
    }
  }
}
```

## Step 4: Test the Integration

1. Start your backend server: `cd Backend && npm start`
2. Start your frontend: `npm run dev`
3. Go to the Write Blog page
4. Click the image upload button in the toolbar
5. Select an image file
6. The image should upload to Firebase and appear in the editor
7. The first uploaded image will automatically become the main image for the blog post

## How It Works

### Frontend Flow:
1. User clicks image upload button in TipTap editor
2. File picker opens
3. User selects an image file
4. Image is uploaded to Firebase Storage via `uploadImageToFirebase()`
5. Firebase returns a download URL
6. Image is inserted into the editor
7. First image becomes the main image for the blog post

### Backend Flow:
1. When publishing, the `mainImage` URL is sent to the backend
2. Backend stores the Firebase Storage URL in the blog post
3. The URL points directly to Firebase Storage

## File Structure

```
writex/
├── src/
│   ├── lib/
│   │   ├── firebase.ts              # Firebase initialization
│   │   ├── firebase-storage.ts      # Storage utility functions
│   │   └── new-tiptap-utils.ts     # Updated TipTap image upload
│   └── components/
│       └── tiptap-templates/
│           └── simple/
│               └── simple-editor.tsx # TipTap editor with Firebase integration
├── .env                              # Environment variables (create this)
└── FIREBASE_SETUP.md                 # This file
```

## Troubleshooting

### Common Issues:

1. **"Firebase: Error (auth/invalid-api-key)"**
   - Check your API key in the `.env` file
   - Make sure the `.env` file is in the correct location

2. **"Firebase: Error (storage/unauthorized)"**
   - Check your Firebase Storage rules
   - Make sure the rules allow image uploads

3. **"Firebase: Error (storage/bucket-not-found)"**
   - Verify your storage bucket name in the `.env` file
   - Make sure Firebase Storage is enabled in your project

4. **Images not uploading**
   - Check browser console for errors
   - Verify Firebase configuration values
   - Check if the image file is under 5MB

### Debug Steps:
1. Open browser developer tools
2. Check the Console tab for error messages
3. Check the Network tab to see if requests are being made
4. Verify your Firebase project is active and billing is set up

## Security Notes

- Firebase Storage rules are configured to only allow image uploads
- File size is limited to 5MB
- Only authenticated users can upload (if you implement auth later)
- Images are publicly readable (adjust rules if you need private images)

## Next Steps

After successful setup, you can:
1. Add image deletion functionality
2. Implement image optimization
3. Add image galleries
4. Implement user authentication with Firebase Auth
5. Add image metadata storage in Firestore

## Support

If you encounter issues:
1. Check the Firebase Console for any error messages
2. Verify your configuration values
3. Check the browser console for detailed error logs
4. Ensure your Firebase project has Storage enabled
