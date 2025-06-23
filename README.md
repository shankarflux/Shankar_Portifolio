My Professional Portfolio Website
This is a personal portfolio website designed to showcase my skills as a Full Stack Web Developer and UI/UX Designer. It features dynamic content, engaging animations, and an admin panel for easy content management, built with React, Tailwind CSS, and Firebase.

Features:
Dynamic Home Page: Profile picture with a circular mask, and changing quotes with typing animation.

Projects Page: Displays a layout of all projects. Clicking a project reveals a modal with detailed information (description, technologies, image/video URLs, live link).

Courses & Certifications Page: Similar to projects, showcasing completed courses and certifications with detailed modals.

Contact Page: A submission form for user inquiries.

About Page: Displays personal and professional details.

Admin Panel (Secured by Firebase Authentication):

Content Management: Administrators can add, edit, and delete projects and courses directly from the website.

About Page Editing: Administrators can update their personal details on the 'About Me' page.

Contact Notifications: Administrators can view, mark as read/unread, and delete contact form submissions.

Responsive Design: Optimized for various screen sizes (mobile, tablet, desktop) using Tailwind CSS.

Attractive UI/UX: Designed with a professional dark theme, vibrant accent colors, and subtle, engaging animations.

Data Persistence: Utilizes Firebase Firestore to store projects, courses, about details, and contact requests, ensuring data is saved across sessions.

Technologies Used:
Frontend: React.js, Tailwind CSS, Lucide React (for icons)

Backend/Database: Firebase (Authentication, Firestore)

Build Tool: Vite

Setup and Running Locally:
Clone the repository:

git clone https://github.com/your-repo/my-portfolio.git
cd my-portfolio

(Replace https://github.com/your-repo/my-portfolio.git with your actual repository URL after you push the code.)

Install dependencies:

npm install

Firebase Configuration (CRITICAL):
This application uses Firebase for data storage and authentication. You must set up a Firebase project:

Go to console.firebase.google.com and create a new project.

Add a Web App to your Firebase project.

Enable Firestore Database: In your Firebase project, navigate to "Build" > "Firestore Database" and create a database (start in production mode).

Enable Email/Password Authentication: Go to "Build" > "Authentication" > "Sign-in method" and enable "Email/Password."

Create an Admin User: In the Authentication tab, go to "Users" and manually add a new user. For testing purposes, create a user with email admin@example.com and password password123.

Deploy Firestore Security Rules: Copy and deploy the following security rules in your Firebase project (under "Firestore Database" > "Rules"). Replace your-app-id-here with the appId from your Firebase Console's Project settings.

rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Public data: Anyone authenticated (even anonymously) can read
    match /artifacts/{appId}/public/data/{collection}/{document} {
      allow read: if request.auth != null;
      // Admin only for write/update/delete
      allow write: if request.auth != null && request.auth.token.email == 'admin@example.com';
    }

    // Specific rule for about details - readable by all, writable by admin
    match /artifacts/{appId}/public/data/about/main {
      allow read: if request.auth != null;
      allow write: if request.auth != null && request.auth.token.email == 'admin@example.com';
    }

    // Contact requests: readable/writable by admin only (for notifications)
    match /artifacts/{appId}/public/data/contact_requests/{document} {
        allow read: if request.auth != null && request.auth.token.email == 'admin@example.com';
        // Allow any authenticated user to create a new request (submit form)
        allow create: if request.auth != null;
        // Admin only for update/delete
        allow update, delete: if request.auth != null && request.auth.token.email == 'admin@example.com';
    }

    // Private user data (not directly used in this app, but good practice)
    match /artifacts/{appId}/users/{userId}/{documents=**} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
  }
}

Add Your Profile Picture:

Place your profile image (e.g., my-profile-pic.jpg) into the src/assets/ directory.

Open src/App.jsx and update the src attribute of the <img> tag in the "Home" section to point to your image:

<img
  src="/src/assets/my-profile-pic.jpg" // Change this to your image path!
  alt="Kosuri Gowry Sankar Profile"
  // ... rest of the attributes
/>

Start the development server:

npm run dev

This will typically start the app on http://localhost:5173/. Open this URL in your browser.

Admin Access:
Click "Admin Login" in the header.

Use email: admin@example.com

Password: password123 (or whatever you set in Firebase)

Once logged in, you will see "Add New Project/Course" buttons and "Edit/Delete" options on project/course cards. You can also click the "Notifications" link to see contact requests and "Edit About Details" on the About page.

Important Note on Image/Video Hosting:
Directly embedding large image or video files within Firestore documents is not recommended due to Firestore's document size limits (1MB).

When adding/editing projects or courses, you will provide URLs for images and videos. You should upload your media files to a dedicated storage service like Firebase Storage (part of Firebase, recommended), AWS S3, Cloudinary, or any other media hosting service, and then paste the generated URLs into the input fields in the admin forms.

Enjoy your new portfolio website!