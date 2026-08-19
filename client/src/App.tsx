import React, { lazy, Suspense } from "react";
import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import { Analytics } from "@vercel/analytics/react";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import ProfileCompletionModal from "./components/ProfileCompletionModal";
import { useAuth } from "./context/AuthContext";

// Helper to retry lazy import or force reload on deployment chunk mismatches
const lazyWithRetry = <T extends React.ComponentType<any>>(
    factory: () => Promise<{ default: T }>,
) =>
    lazy(async () => {
        try {
            const component = await factory();
            window.sessionStorage.removeItem("chunk-reload-retry");
            return component;
        } catch (error) {
            const hasRetried =
                window.sessionStorage.getItem("chunk-reload-retry");
            if (!hasRetried) {
                window.sessionStorage.setItem("chunk-reload-retry", "true");
                window.location.reload();
                return new Promise<{ default: T }>(() => {});
            }
            throw error;
        }
    });

// Lazy-loaded screens
const Home = lazyWithRetry(() => import("./screens/Home/Home"));
const Login = lazyWithRetry(() => import("./screens/Login/Login"));
const Donate = lazyWithRetry(() => import("./screens/Donate/Donate"));
const IDGenerate = lazyWithRetry(
    () => import("./screens/IDGenerate/IDGenerate"),
);
const CertificateView = lazyWithRetry(
    () => import("./screens/CertificateView/CertificateView"),
);
const IDCardView = lazyWithRetry(
    () => import("./screens/IDCardView/IDCardView"),
);
const Events = lazyWithRetry(() => import("./screens/Events/Events"));
const Gallery = lazyWithRetry(() => import("./screens/Gallery/Gallery"));
const About = lazyWithRetry(() => import("./screens/About/About"));
const AdminRequestIdCard = lazyWithRetry(
    () => import("./screens/AdminRequestIdCard/AdminRequestIdCard"),
);
const AdminRequestDonation = lazyWithRetry(
    () => import("./screens/AdminRequestDonation/AdminRequestDonation"),
);
const AdminUsers = lazyWithRetry(
    () => import("./screens/AdminUsers/AdminUsers"),
);
const AdminNoticeboard = lazyWithRetry(
    () => import("./screens/AdminNoticeboard/AdminNoticeboard"),
);
const AdminGallery = lazyWithRetry(
    () => import("./screens/AdminGallery/AdminGallery"),
);
const AdminEvents = lazyWithRetry(
    () => import("./screens/AdminEvents/AdminEvents"),
);
const AdminTeam = lazyWithRetry(() => import("./screens/AdminTeam/AdminTeam"));
const AdminSettings = lazyWithRetry(
    () => import("./screens/AdminSettings/AdminSettings"),
);
const UserProfile = lazyWithRetry(
    () => import("./screens/UserProfile/UserProfile"),
);

const LoadingFallback = () => (
    <div className="flex-1 flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-4">
            <div className="h-10 w-10 rounded-full border-4 border-emerald-200 border-t-emerald-600 animate-spin" />
            <span className="text-sm text-slate-500">Loading…</span>
        </div>
    </div>
);

// Protected route wrapper
const ProtectedRoute = ({
    children,
    adminOnly = false,
}: {
    children: React.ReactNode;
    adminOnly?: boolean;
}) => {
    const { isAuthenticated, isAdmin, isLoading } = useAuth();
    const location = useLocation();
    if (isLoading) return <LoadingFallback />;
    if (!isAuthenticated)
        return <Navigate to="/login" state={{ from: location }} replace />;
    if (adminOnly && !isAdmin) return <Navigate to="/" replace />;
    return <React.Fragment>{children}</React.Fragment>;
};

function App() {
    return (
        <div className="flex flex-col min-h-screen bg-slate-50">
            {/* Vercel analytics */}
            <Analytics />

            {/* Profile Completion Onboarding Modal */}
            <ProfileCompletionModal />

            {/* Navbar  */}
            <Navbar />

            {/* Main content */}
            <main className="flex-1">
                <Suspense fallback={<LoadingFallback />}>
                    <Routes>
                        {/* Public routes */}
                        <Route path="/" element={<Home />} />
                        <Route path="/login" element={<Login />} />
                        <Route path="/events" element={<Events />} />
                        <Route path="/gallery" element={<Gallery />} />
                        <Route path="/about" element={<About />} />

                        {/* Auth-required routes */}
                        <Route
                            path="/profile"
                            element={
                                <ProtectedRoute>
                                    <UserProfile />
                                </ProtectedRoute>
                            }
                        />
                        <Route
                            path="/donate"
                            element={
                                <ProtectedRoute>
                                    <Donate />
                                </ProtectedRoute>
                            }
                        />
                        <Route
                            path="/id-generate"
                            element={
                                <ProtectedRoute>
                                    <IDGenerate />
                                </ProtectedRoute>
                            }
                        />
                        <Route
                            path="/certificate/:id"
                            element={
                                <ProtectedRoute>
                                    <CertificateView />
                                </ProtectedRoute>
                            }
                        />
                        <Route
                            path="/id-card/:id"
                            element={
                                <ProtectedRoute>
                                    <IDCardView />
                                </ProtectedRoute>
                            }
                        />

                        {/* Admin-only routes */}
                        <Route
                            path="/admin/request/id-card"
                            element={
                                <ProtectedRoute adminOnly>
                                    <AdminRequestIdCard />
                                </ProtectedRoute>
                            }
                        />
                        <Route
                            path="/admin/request/donation"
                            element={
                                <ProtectedRoute adminOnly>
                                    <AdminRequestDonation />
                                </ProtectedRoute>
                            }
                        />
                        <Route
                            path="/admin/users"
                            element={
                                <ProtectedRoute adminOnly>
                                    <AdminUsers />
                                </ProtectedRoute>
                            }
                        />
                        <Route
                            path="/admin/noticeboard"
                            element={
                                <ProtectedRoute adminOnly>
                                    <AdminNoticeboard />
                                </ProtectedRoute>
                            }
                        />
                        <Route
                            path="/admin/gallery"
                            element={
                                <ProtectedRoute adminOnly>
                                    <AdminGallery />
                                </ProtectedRoute>
                            }
                        />
                        <Route
                            path="/admin/events"
                            element={
                                <ProtectedRoute adminOnly>
                                    <AdminEvents />
                                </ProtectedRoute>
                            }
                        />
                        <Route
                            path="/admin/team"
                            element={
                                <ProtectedRoute adminOnly>
                                    <AdminTeam />
                                </ProtectedRoute>
                            }
                        />
                        <Route
                            path="/admin/settings"
                            element={
                                <ProtectedRoute adminOnly>
                                    <AdminSettings />
                                </ProtectedRoute>
                            }
                        />

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
