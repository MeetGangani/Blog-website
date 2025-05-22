# 📝 MERN Blogging Platform

A full-featured blogging application built with the MERN stack. Users can create, edit, delete, and view blogs with a rich text editor. Includes user authentication, likes, comments, search, filters, and an admin panel.

---

## 🚀 Features

- 🧑‍💻 User Authentication (JWT based)
- 📝 Create, Edit, Delete Blog Posts
- ✍️ Rich Text Editor (React Quill)
- 💬 Comment System
- ❤️ Like Feature
- 🔍 Search & Filter Blogs by Category/Tags
- 👤 User Profile with authored blogs
- 🛡️ Admin Dashboard to manage posts/users
- 🌐 Fully Responsive UI with Tailwind CSS

---

## 🧑‍💻 Tech Stack

### 🔹 Frontend
- React.js
- React Quill
- Redux Toolkit (optional)
- Tailwind CSS

### 🔹 Backend
- Node.js
- Express.js
- MongoDB (with Mongoose)
- JWT for Auth
- Multer + Cloudinary (optional for image uploads)

### 🔹 Tools
- Git & GitHub
- Postman (API testing)
- Render (Backend Hosting)
- Netlify/Vercel (Frontend Hosting)

# 📋 Functional Requirements – MERN Blogging Platform

This document outlines the **functional requirements** for the MERN-based Blogging Platform project. It defines all core features and how users interact with the system across different roles.

---

## 📌 Overview

The blogging platform allows users to create, edit, and manage blog posts with rich formatting. It includes features like authentication, commenting, liking, and admin moderation. The platform is built using the MERN stack: **MongoDB, Express.js, React.js, Node.js**.

---

## 🔐 1. User Authentication

### 🔹 Description:
Allow users to securely register, log in, and maintain access to protected features.

### ✅ Functionalities:
- Register with username, email, and password.
- Log in with valid credentials and receive a JWT token.
- Authenticated users can:
  - Create/edit/delete blogs
  - Like and comment on posts
  - Access their profile
- Log out and invalidate session.

---

## 📝 2. Blog Management (CRUD)

### 🔹 Description:
Enable users to create, update, and delete blog posts using a rich text editor.

### ✅ Functionalities:
- Create blog posts with:
  - Title
  - Content (rich text)
  - Tags or category
  - Optional cover image
- Edit or delete own blog posts.
- View timestamp and author on every blog.

---

## 📃 3. Blog Display

### 🔹 Description:
Users can view a feed of blogs and read full content.

### ✅ Functionalities:
- Homepage lists all blogs (latest first).
- Blog detail page shows:
  - Full content
  - Author info
  - Likes & comments
- Responsive layout for desktop and mobile.

---

## 💬 4. Comments System

### 🔹 Description:
Support blog discussions and feedback through user comments.

### ✅ Functionalities:
- Authenticated users can comment on blogs.
- Each comment shows:
  - Comment text
  - Author and timestamp
- Comments update in real time or on refresh.

---

## ❤️ 5. Like Feature

### 🔹 Description:
Users can like/unlike blog posts to express appreciation.

### ✅ Functionalities:
- Toggle like on any blog post.
- Show number of likes on each post.
- Prevent multiple likes from the same user.

---

## 👤 6. User Profile

### 🔹 Description:
Allow users to manage and view their personal blog content.

### ✅ Functionalities:
- View profile with:
  - Username
  - Authored blogs
  - Option to edit/delete own posts
- Profile page accessible only to logged-in users.

---

## 🔍 7. Search and Filtering

### 🔹 Description:
Help users find content faster by keywords or categories.

### ✅ Functionalities:
- Search blogs by:
  - Title
  - Content
- Filter by:
  - Category
  - Tags

---

## 🛡️ 8. Admin Panel

### 🔹 Description:
Allow admin users to moderate content and users.

### ✅ Functionalities:
- View list of all users and posts.
- Delete any blog or user account.
- Admin-only dashboard route.
- Role management (admin vs. user).

---

## ☁️ 9. Image Uploads (Optional)

### 🔹 Description:
Support uploading blog cover images to external storage.

### ✅ Functionalities:
- Users can upload images using file input.
- Images stored via Cloudinary or other service.
- Blog cards and details show uploaded images.

---

## ⚠️ 10. Validation & Error Handling

### 🔹 Description:
Ensure a smooth and stable user experience.

### ✅ Functionalities:
- Validate all form fields (title/content required).
- Show alerts for:
  - Invalid login
  - Missing data
  - Unauthorized access
- Protect routes with authentication middleware.
- Handle server and API errors gracefully.

---

## 🌐 11. Deployment & Access

### 🔹 Description:
Make the platform publicly accessible.

### ✅ Functionalities:
- Backend hosted on Render/Railway.
- Frontend deployed on Netlify or Vercel.
- MongoDB hosted on MongoDB Atlas.
- Mobile responsive design.

---

## 🔒 Non-Functional Requirements (Summary)

| Requirement     | Description                                                  |
|-----------------|--------------------------------------------------------------|
| Security        | JWT-based auth, password hashing, HTTPS support              |
| Responsiveness  | Works on all screen sizes (mobile, tablet, desktop)          |
| Performance     | Fast page loads with optimized API calls                     |
| Scalability     | Ready to support many users and blog posts                   |
| Maintainability | Modular codebase using components, routes, controllers       |

---

## 📎 License

This document is part of the [MERN Blogging Platform](https://github.com/yourusername/mern-blogging-platform) and licensed under the MIT License.



