# MERN Blog Backend

This is the backend API for the MERN Blogging Platform.

## Setup Instructions

1. Install dependencies:
   ```
   npm install
   ```

2. Create a `.env` file in the root of the backend directory with the following variables:
   ```
   PORT=5000
   MONGO_URI=mongodb://localhost:27017/mern_blog
   JWT_SECRET=your_jwt_secret_key
   CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
   CLOUDINARY_API_KEY=your_cloudinary_api_key
   CLOUDINARY_API_SECRET=your_cloudinary_secret
   ```

3. Start the development server:
   ```
   npm run dev
   ```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login a user
- `GET /api/auth/profile` - Get user profile (protected)
- `PUT /api/auth/profile` - Update user profile (protected)

### Blogs
- `GET /api/blogs` - Get all blogs with pagination and filters
- `POST /api/blogs` - Create a new blog (protected)
- `GET /api/blogs/:id` - Get a single blog
- `PUT /api/blogs/:id` - Update a blog (protected)
- `DELETE /api/blogs/:id` - Delete a blog (protected)
- `PUT /api/blogs/:id/like` - Like or unlike a blog (protected)
- `GET /api/blogs/user/:userId` - Get blogs by user

### Comments
- `GET /api/blogs/:blogId/comments` - Get all comments for a blog
- `POST /api/blogs/:blogId/comments` - Create a comment (protected)
- `GET /api/comments/:id` - Get a single comment
- `PUT /api/comments/:id` - Update a comment (protected)
- `DELETE /api/comments/:id` - Delete a comment (protected)
- `POST /api/comments/:id/replies` - Add reply to comment (protected)

### Admin
- `GET /api/admin/stats` - Get admin dashboard stats (admin only)
- `GET /api/admin/users` - Get all users (admin only)
- `GET /api/admin/users/:id` - Get a single user (admin only)
- `PUT /api/admin/users/:id` - Update a user (admin only)
- `DELETE /api/admin/users/:id` - Delete a user (admin only) 