import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { Toaster, ToastBar, toast } from "react-hot-toast";
import { X } from "lucide-react";
import { AuthProvider } from "./context/AuthContext";
import { AppProvider } from "./context/AppContext";
import "./index.css";
import App from "./App.tsx";

createRoot(document.getElementById("root")!).render(
    <BrowserRouter>
        <AuthProvider>
            <AppProvider>
                <App />
                <Toaster
                    position="top-right"
                    toastOptions={{
                        duration: 4000,
                        style: {
                            background: "#fff",
                            color: "#334155",
                            border: "1px solid #e2e8f0",
                            borderRadius: "12px",
                            fontSize: "14px",
                            boxShadow: "0 4px 6px -1px rgba(0,0,0,0.08)",
                        },
                        success: {
                            iconTheme: {
                                primary: "#059669",
                                secondary: "#fff",
                            },
                        },
                        error: {
                            iconTheme: {
                                primary: "#dc2626",
                                secondary: "#fff",
                            },
                        },
                    }}
                >
                    {(t) => (
                        <ToastBar toast={t}>
                            {({ icon, message }) => (
                                <div className="flex items-center gap-2 w-full">
                                    {icon}
                                    <div className="flex-1 text-sm font-medium">{message}</div>
                                    {t.type !== "loading" && (
                                        <button
                                            type="button"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                toast.dismiss(t.id);
                                            }}
                                            className="p-1 rounded-md text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors -mr-1"
                                            title="Close notification"
                                            aria-label="Close notification"
                                        >
                                            <X className="h-3.5 w-3.5" />
                                        </button>
                                    )}
                                </div>
                            )}
                        </ToastBar>
                    )}
                </Toaster>
            </AppProvider>
        </AuthProvider>
    </BrowserRouter>,
);
