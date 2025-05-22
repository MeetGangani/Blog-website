import { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import Layout from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute';
import AdminRoute from './components/AdminRoute';
import GuestRoute from './components/GuestRoute';

// Lazy loaded pages
const HomePage = lazy(() => import('./pages/HomePage'));
const LoginPage = lazy(() => import('./pages/LoginPage'));
const RegisterPage = lazy(() => import('./pages/RegisterPage'));
const BlogsPage = lazy(() => import('./pages/BlogsPage'));
const BlogDetailPage = lazy(() => import('./pages/BlogDetailPage'));
const CreateBlogPage = lazy(() => import('./pages/CreateBlogPage'));
const EditBlogPage = lazy(() => import('./pages/EditBlogPage'));
const UserProfilePage = lazy(() => import('./pages/UserProfilePage'));
const EditProfilePage = lazy(() => import('./pages/EditProfilePage'));
const AdminDashboardPage = lazy(() => import('./pages/AdminDashboardPage'));
const AdminUserEditPage = lazy(() => import('./pages/AdminUserEditPage'));
const NotFoundPage = lazy(() => import('./pages/NotFoundPage'));
const LikedBlogs = lazy(() => import('./pages/LikedBlogs'));

function App() {
  return (
    <BrowserRouter>
      <ThemeProvider>
        <AuthProvider>
          <Suspense fallback={<div className="flex justify-center items-center h-screen">
          <div className="relative flex">
            <div className="h-12 w-12 rounded-full border-t-2 border-b-2 border-primary-600 animate-spin"></div>
            <div className="h-12 w-12 rounded-full border-t-2 border-b-2 border-secondary-500 animate-spin absolute" style={{animationDelay: '-0.2s'}}></div>
          </div>
        </div>}>
          <Routes>
            <Route path="/" element={<Layout />}>
              {/* Public routes */}
              <Route index element={<HomePage />} />
              <Route path="login" element={
                <GuestRoute>
                  <LoginPage />
                </GuestRoute>
              } />
              <Route path="register" element={
                <GuestRoute>
                  <RegisterPage />
                </GuestRoute>
              } />
              <Route path="blogs" element={<BlogsPage />} />
              <Route path="blogs/:id" element={<BlogDetailPage />} />
              <Route path="user/:username" element={<UserProfilePage />} />
              
              {/* Protected routes */}
              <Route path="create-blog" element={
                <ProtectedRoute>
                  <CreateBlogPage />
                </ProtectedRoute>
              } />
              <Route path="blogs/:id/edit" element={
                <ProtectedRoute>
                  <EditBlogPage />
                </ProtectedRoute>
              } />
              <Route path="profile" element={
                <ProtectedRoute>
                  <UserProfilePage />
                </ProtectedRoute>
              } />
              <Route path="profile/edit" element={
                <ProtectedRoute>
                  <EditProfilePage />
                </ProtectedRoute>
              } />
              <Route path="liked-blogs" element={
                <ProtectedRoute>
                  <LikedBlogs />
                </ProtectedRoute>
              } />
              
              {/* Admin routes */}
              <Route path="admin/dashboard" element={
                <AdminRoute>
                  <AdminDashboardPage />
                </AdminRoute>
              } />
              <Route path="admin/users/:id" element={
                <AdminRoute>
                  <AdminUserEditPage />
                </AdminRoute>
              } />
              
              {/* 404 */}
              <Route path="*" element={<NotFoundPage />} />
            </Route>
          </Routes>
        </Suspense>
      </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  );
}

export default App;
