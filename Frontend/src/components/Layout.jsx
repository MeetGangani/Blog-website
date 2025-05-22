import { Suspense } from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';
import Footer from './Footer';
import { Toaster } from 'react-hot-toast';

const Layout = () => {
  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-b from-neutral-50 to-white">
      <Navbar />
      <main className="flex-grow pt-16">
        <Suspense fallback={
          <div className="flex items-center justify-center min-h-[70vh]">
            <div className="relative flex">
              <div className="h-12 w-12 rounded-full border-t-2 border-b-2 border-primary-600 animate-spin"></div>
              <div className="h-12 w-12 rounded-full border-t-2 border-b-2 border-secondary-500 animate-spin absolute" style={{animationDelay: '-0.2s'}}></div>
            </div>
          </div>
        }>
          <Outlet />
        </Suspense>
      </main>
      <Footer />
      <Toaster
        position="bottom-right"
        toastOptions={{
          style: {
            background: '#262626',
            color: '#fff',
            borderRadius: '8px',
            paddingLeft: '16px',
            paddingRight: '16px',
          },
          success: {
            style: {
              background: '#0c4a6e',
              border: '1px solid #0369a1',
            },
          },
          error: {
            style: {
              background: '#881337',
              border: '1px solid #9f1239',
            },
          },
          duration: 4000,
        }}
      />
    </div>
  );
};

export default Layout; 