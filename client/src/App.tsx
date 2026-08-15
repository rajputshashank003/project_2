import React, { lazy, Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Analytics } from '@vercel/analytics/react';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import { useAuth } from './context/AuthContext';

// Lazy-loaded screens
const Home = lazy(() => import('./screens/Home/Home'));
const Login = lazy(() => import('./screens/Login/Login'));
const Donate = lazy(() => import('./screens/Donate/Donate'));
const IDGenerate = lazy(() => import('./screens/IDGenerate/IDGenerate'));
const CertificateView = lazy(() => import('./screens/CertificateView/CertificateView'));
const IDCardView = lazy(() => import('./screens/IDCardView/IDCardView'));
const Events = lazy(() => import('./screens/Events/Events'));
const About = lazy(() => import('./screens/About/About'));
const AdminRequestIdCard = lazy(() => import('./screens/AdminRequestIdCard/AdminRequestIdCard'));
const AdminRequestDonation = lazy(() => import('./screens/AdminRequestDonation/AdminRequestDonation'));
const AdminUsers = lazy(() => import('./screens/AdminUsers/AdminUsers'));
const AdminNoticeboard = lazy(() => import('./screens/AdminNoticeboard/AdminNoticeboard'));
const AdminGallery = lazy(() => import('./screens/AdminGallery/AdminGallery'));
const AdminEvents = lazy(() => import('./screens/AdminEvents/AdminEvents'));
const AdminTeam = lazy(() => import('./screens/AdminTeam/AdminTeam'));
const AdminSettings = lazy(() => import('./screens/AdminSettings/AdminSettings'));
const UserProfile = lazy(() => import('./screens/UserProfile/UserProfile'));

const LoadingFallback = () => (
    <div className="flex-1 flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-4">
            <div className="h-10 w-10 rounded-full border-4 border-emerald-200 border-t-emerald-600 animate-spin" />
            <span className="text-sm text-slate-500">Loading…</span>
        </div>
    </div>
);

// Protected route wrapper
const ProtectedRoute = ({ children, adminOnly = false }: { children: React.ReactNode; adminOnly?: boolean }) => {
    const { isAuthenticated, isAdmin, isLoading } = useAuth();
    if (isLoading) return <LoadingFallback />;
    if (!isAuthenticated) return <Navigate to="/login" replace />;
    if (adminOnly && !isAdmin) return <Navigate to="/" replace />;
    return <React.Fragment>{children}</React.Fragment>;
};

function App() {
    return (
        <div className="flex flex-col min-h-screen bg-slate-50">
            {/* Vercel analytics */}
            <Analytics />

            {/* Navbar */}
            <Navbar />

            {/* Main content */}
            <main className="flex-1">
                <Suspense fallback={<LoadingFallback />}>
                    <Routes>
                        {/* Public routes */}
                        <Route path="/" element={<Home />} />
                        <Route path="/login" element={<Login />} />
                        <Route path="/events" element={<Events />} />
                        <Route path="/about" element={<About />} />

                        {/* Auth-required routes */}
                        <Route path="/profile" element={<ProtectedRoute><UserProfile /></ProtectedRoute>} />
                        <Route path="/donate" element={<ProtectedRoute><Donate /></ProtectedRoute>} />
                        <Route path="/id-generate" element={<ProtectedRoute><IDGenerate /></ProtectedRoute>} />
                        <Route path="/certificate/:id" element={<ProtectedRoute><CertificateView /></ProtectedRoute>} />
                        <Route path="/id-card/:id" element={<ProtectedRoute><IDCardView /></ProtectedRoute>} />

                        {/* Admin-only routes */}
                        <Route path="/admin/request/id-card" element={<ProtectedRoute adminOnly><AdminRequestIdCard /></ProtectedRoute>} />
                        <Route path="/admin/request/donation" element={<ProtectedRoute adminOnly><AdminRequestDonation /></ProtectedRoute>} />
                        <Route path="/admin/users" element={<ProtectedRoute adminOnly><AdminUsers /></ProtectedRoute>} />
                        <Route path="/admin/noticeboard" element={<ProtectedRoute adminOnly><AdminNoticeboard /></ProtectedRoute>} />
                        <Route path="/admin/gallery" element={<ProtectedRoute adminOnly><AdminGallery /></ProtectedRoute>} />
                        <Route path="/admin/events" element={<ProtectedRoute adminOnly><AdminEvents /></ProtectedRoute>} />
                        <Route path="/admin/team" element={<ProtectedRoute adminOnly><AdminTeam /></ProtectedRoute>} />
                        <Route path="/admin/settings" element={<ProtectedRoute adminOnly><AdminSettings /></ProtectedRoute>} />

                        {/* Fallback */}
                        <Route path="*" element={<Navigate to="/" replace />} />
                    </Routes>
                </Suspense>
            </main>

            <Footer />
        </div>
    );
}

export default App;
