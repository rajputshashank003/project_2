import React, { useContext } from "react";
import { ArrowLeft, ArrowRight, RotateCcw, ShieldCheck } from "lucide-react";
import { LoginContext } from "../context";

export const PhoneStep: React.FC = () => {
    const ctx = useContext(LoginContext);
    if (!ctx) return null;
    const { phone, phoneError, isLoading, handlePhoneChange, handleSendOtp } =
        ctx;

    return (
        <div className="animate-fade-in space-y-6">
            <div className="text-center space-y-1.5">
                <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
                    Welcome Back
                </h1>
                <p className="text-slate-500 text-sm leading-relaxed max-w-xs mx-auto">
                    Enter your mobile number to receive a verification code on
                    WhatsApp
                </p>
            </div>

            <div className="space-y-1.5">
                <label
                    htmlFor="phone-input"
                    className="block text-xs font-bold uppercase tracking-wider text-slate-600"
                >
                    Mobile Number
                </label>
                <div
                    className={`flex items-center rounded-2xl border transition-all duration-200 overflow-hidden bg-slate-50/70 focus-within:bg-white focus-within:ring-4 ${
                        phoneError
                            ? "border-red-400 focus-within:border-red-500 focus-within:ring-red-500/10"
                            : "border-slate-200 focus-within:border-emerald-500 focus-within:ring-emerald-500/10"
                    }`}
                >
                    <div className="flex items-center gap-1.5 px-3.5 py-3.5 border-r border-slate-200 bg-slate-100/70 text-slate-700 font-semibold text-sm select-none shrink-0">
                        <span className="text-base leading-none">🇮🇳</span>
                        <span>+91</span>
                    </div>
                    <input
                        id="phone-input"
                        type="tel"
                        inputMode="numeric"
                        maxLength={10}
                        placeholder="Enter 10-digit number"
                        value={phone}
                        onChange={(e) =>
                            handlePhoneChange(e.target.value.replace(/\D/g, ""))
                        }
                        onKeyDown={(e) => e.key === "Enter" && handleSendOtp()}
                        className="w-full px-3.5 py-3.5 bg-transparent text-slate-900 placeholder:text-slate-400 font-medium text-base tracking-wide outline-none"
                        autoFocus
                    />
                </div>
                {phoneError && (
                    <p className="text-red-500 text-xs font-medium pl-1">
                        {phoneError}
                    </p>
                )}
            </div>

            <button
                id="send-otp-btn"
                onClick={handleSendOtp}
                disabled={isLoading || phone.length < 10}
                className="btn-primary w-full py-3.5 text-base rounded-2xl font-bold flex items-center justify-center gap-2 shadow-emerald hover:shadow-emerald-lg transition-all duration-200 active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed"
            >
                {isLoading ? (
                    <span className="flex items-center gap-2">
                        <span className="h-4 w-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                        Sending OTP…
                    </span>
                ) : (
                    <span className="flex items-center gap-2">
                        Get OTP <ArrowRight className="h-4 w-4" />
                    </span>
                )}
            </button>

            <div className="flex items-center justify-center gap-1.5 text-[11px] sm:text-xs text-slate-500 text-center pt-1 whitespace-nowrap">
                <ShieldCheck className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-emerald-600 shrink-0" />
                <span>Instant verification delivered via WhatsApp</span>
            </div>
        </div>
    );
};

export const OtpStep: React.FC = () => {
    const ctx = useContext(LoginContext);
    if (!ctx) return null;
    const {
        phone,
        otp,
        isLoading,
        resendTimer,
        handleOtpChange,
        handleOtpKeyDown,
        handleVerifyOtp,
        handleResendOtp,
        handleBackToPhone,
    } = ctx;

    return (
        <div className="animate-fade-in space-y-6">
            <div>
                <button
                    onClick={handleBackToPhone}
                    className="inline-flex items-center gap-1 text-xs font-semibold text-slate-500 hover:text-emerald-700 bg-slate-100 hover:bg-emerald-50 px-2.5 py-1.5 rounded-lg transition-colors mb-3"
                >
                    <ArrowLeft className="h-3.5 w-3.5" />
                    Change Number
                </button>

                <div className="text-center space-y-1.5">
                    <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
                        Verify OTP
                    </h1>
                    <p className="text-slate-500 text-sm leading-relaxed">
                        Enter the 6-digit code sent on WhatsApp to{" "}
                        <span className="inline-block font-bold text-slate-800 bg-slate-100 px-2 py-0.5 rounded-md text-xs sm:text-sm">
                            +91 {phone}
                        </span>
                    </p>
                </div>
            </div>

            <div className="flex items-center justify-center gap-2 sm:gap-2.5">
                {otp.map((digit, i) => (
                    <input
                        key={i}
                        id={`otp-${i}`}
                        type="text"
                        inputMode="numeric"
                        maxLength={1}
                        value={digit}
                        onChange={(e) =>
                            handleOtpChange(
                                i,
                                e.target.value.replace(/\D/g, ""),
                            )
                        }
                        onKeyDown={(e) => handleOtpKeyDown(i, e)}
                        className="w-11 h-13 sm:w-12 sm:h-14 text-center text-xl font-bold text-slate-900 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 outline-none transition-all"
                        autoFocus={i === 0}
                    />
                ))}
            </div>

            <button
                id="verify-otp-btn"
                onClick={handleVerifyOtp}
                disabled={isLoading || otp.join("").length < 6}
                className="btn-primary w-full py-3.5 text-base rounded-2xl font-bold flex items-center justify-center gap-2 shadow-emerald hover:shadow-emerald-lg transition-all duration-200 active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed"
            >
                {isLoading ? (
                    <span className="flex items-center gap-2">
                        <span className="h-4 w-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                        Verifying…
                    </span>
                ) : (
                    "Verify & Sign In"
                )}
            </button>

            <div className="text-center pt-1">
                {resendTimer > 0 ? (
                    <p className="text-xs text-slate-500 flex items-center justify-center gap-1.5">
                        <span>Didn't receive code? Resend in</span>
                        <span className="font-bold text-emerald-700 font-mono">
                            {resendTimer}s
                        </span>
                    </p>
                ) : (
                    <button
                        onClick={handleResendOtp}
                        className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-700 hover:text-emerald-800 transition-colors"
                    >
                        <RotateCcw className="h-3.5 w-3.5" />
                        Resend Code on WhatsApp
                    </button>
                )}
            </div>
        </div>
    );
};
