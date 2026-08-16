import React, { useState, useEffect } from "react";
import { Leaf } from "lucide-react";
import { useLogin } from "./useLogin";
import { LoginContext } from "./context";
import { PhoneStep, OtpStep } from "./components/LoginSteps";
import { useApp } from "../../context/AppContext";

const LoginContent: React.FC = () => {
    const ctx = React.useContext(LoginContext);
    const { ngoConfig, isConfigLoading } = useApp();
    const [logoError, setLogoError] = useState(false);

    useEffect(() => {
        setLogoError(false);
    }, [ngoConfig.logoUrl]);

    if (!ctx) return null;

    return (
        <div className="min-h-[calc(100vh-64px)] flex items-center justify-center bg-radial from-emerald-50/60 via-slate-50/50 to-slate-100/70 px-4 py-10">
            <div className="w-full max-w-[420px]">
                {/* Main Card */}
                <div className="bg-white/95 backdrop-blur-md rounded-3xl shadow-card-lg border border-slate-200/80 p-7 sm:p-9 transition-all">
                    {/* Unified Branding Header */}
                    <div className="flex flex-col items-center text-center mb-6">
                        {isConfigLoading ? (
                            <div className="h-14 w-14 rounded-2xl bg-slate-100 animate-pulse mb-3" />
                        ) : ngoConfig.logoUrl && !logoError ? (
                            <div className="h-14 w-14 rounded-2xl overflow-hidden bg-white border border-slate-100 shadow-sm p-1 flex items-center justify-center mb-3">
                                <img
                                    src={ngoConfig.logoUrl}
                                    alt={ngoConfig.name}
                                    onError={() => setLogoError(true)}
                                    className="w-full h-full object-cover rounded-xl"
                                />
                            </div>
                        ) : (
                            <div className="h-14 w-14 rounded-2xl bg-emerald-600 flex items-center justify-center shadow-emerald mb-3">
                                <Leaf className="h-7 w-7 text-white" />
                            </div>
                        )}
                        <span className="text-xs font-bold uppercase tracking-wider text-emerald-800 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200/60">
                            {ngoConfig.name || "NGO Foundation"}
                        </span>
                    </div>

                    {/* Form Step */}
                    {ctx.step === "phone" ? <PhoneStep /> : <OtpStep />}
                </div>

                {/* Step Indicator */}
                <div className="flex items-center justify-center gap-2 mt-5">
                    <div
                        className={`h-1.5 rounded-full transition-all duration-300 ${
                            ctx.step === "phone"
                                ? "w-6 bg-emerald-600"
                                : "w-2 bg-slate-300"
                        }`}
                    />
                    <div
                        className={`h-1.5 rounded-full transition-all duration-300 ${
                            ctx.step === "otp"
                                ? "w-6 bg-emerald-600"
                                : "w-2 bg-slate-300"
                        }`}
                    />
                </div>
            </div>
        </div>
    );
};

const Login: React.FC = () => {
    const loginState = useLogin();
    return (
        <LoginContext.Provider value={loginState}>
            <LoginContent />
        </LoginContext.Provider>
    );
};

export default Login;
