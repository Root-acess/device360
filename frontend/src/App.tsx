import './App.css';
import { useState } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Toaster } from 'sonner';
import { Layout } from './components/Layout';
import { HomePage } from './components/HomePage';
import { RepairFlow } from './components/RepairFlow';
import { Dashboard } from './components/Dashboard';
import { AdminDashboard } from './components/AdminDashboard';
import { Loader } from './components/Loader';
import { AdminLogin } from './admin/AdminLogin';
import { ProtectedRoute } from './components/ProtectedRoute';

function App() {
  const [loaded, setLoaded] = useState(false);

  return (
    <>
      {!loaded && <Loader onComplete={() => setLoaded(true)} />}

      <div
        style={{
          opacity: loaded ? 1 : 0,
          transition: 'opacity 0.5s ease',
          visibility: loaded ? 'visible' : 'hidden'
        }}
      >
        <BrowserRouter>
          <Layout>
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/repair" element={<RepairFlow />} />
              <Route path="/dashboard/:bookingId" element={<Dashboard />} />

              {/* ✅ NEW LOGIN ROUTE */}
              <Route path="/admin/login" element={<AdminLogin />} />

              {/* ✅ PROTECTED ADMIN */}
              <Route
                path="/admin"
                element={
                  <ProtectedRoute>
                    <AdminDashboard />
                  </ProtectedRoute>
                }
              />
            </Routes>
          </Layout>
        </BrowserRouter>

        <Toaster position="top-center" richColors />
      </div>
    </>
  );
}

export default App;