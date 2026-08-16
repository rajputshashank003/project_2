import { useState, useEffect, useCallback } from "react";
import { useNavigate, useLocation, useSearchParams } from "react-router-dom";
import toast from "react-hot-toast";
import { sendOtp, verifyOtp } from "../../utils/api_request/auth";
import { useAuth } from "../../context/AuthContext";
import { isValidPhone, isLoginAllowedForPhone } from "../../utils/helpers";
import { OTP_RESEND_SECONDS } from "../../utils/constants";

type Step = "phone" | "otp";

export const useLogin = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [searchParams] = useSearchParams();
    const { login } = useAuth();

    const [step, setStep] = useState<Step>("phone");
    const [phone, setPhone] = useState("");
    const [otp, setOtp] = useState(["", "", "", "", "", ""]);
    const [isLoading, setIsLoading] = useState(false);
    const [phoneError, setPhoneError] = useState("");
    const [resendTimer, setResendTimer] = useState(0);

    useEffect(() => {
        if (resendTimer <= 0) return;
        const id = setInterval(() => setResendTimer((t) => t - 1), 1000);
        return () => clearInterval(id);
    }, [resendTimer]);

    const handlePhoneChange = (value: string) => {
        setPhone(value);
        if (phoneError) setPhoneError("");
    };

    const handleSendOtp = useCallback(async () => {
        const cleaned = phone.replace(/\s+/g, "");
        if (!isValidPhone(cleaned)) {
            setPhoneError("Please enter a valid 10-digit mobile number");
            return;
        }

        if (!isLoginAllowedForPhone(cleaned)) {
            toast.error("Feature under maintenance");
            return;
        }

        setIsLoading(true);
        try {
            await sendOtp(cleaned);
            toast.success(`OTP sent on WhatsApp to +91 ${cleaned}`);
            setStep("otp");
            setResendTimer(OTP_RESEND_SECONDS);
        } catch {
            // error toast already shown by axiosInstance interceptor
        } finally {
            setIsLoading(false);
        }
    }, [phone]);

    const handleOtpChange = (index: number, value: string) => {
        if (value.length > 1) return;
        const updated = [...otp];
        updated[index] = value;
        setOtp(updated);
        if (value && index < 5) {
            const next = document.getElementById(`otp-${index + 1}`);
            next?.focus();
        }
    };

    const handleOtpKeyDown = (
        index: number,
        e: React.KeyboardEvent<HTMLInputElement>,
    ) => {
        if (e.key === "Backspace" && !otp[index] && index > 0) {
            const prev = document.getElementById(`otp-${index - 1}`);
            prev?.focus();
        }
    };

    const handleVerifyOtp = useCallback(async () => {
        const otpString = otp.join("");
        if (otpString.length < 6) {
            toast.error("Please enter all 6 digits");
            return;
        }
        setIsLoading(true);
        try {
            const res = await verifyOtp(phone.replace(/\s+/g, ""), otpString);
            login({
                ...res.user,
                email: res.user.email,
                token: res.token,
                role: res.user.role as "admin" | "user",
                designation: res.user.designation as
                    | "member"
                    | "admin"
                    | "president"
                    | "secretary"
                    | "volunteer",
            });
            toast.success("Logged in successfully");

            const redirectParam = searchParams.get("redirect");
            const fromState = (location.state as any)?.from?.pathname;
            const destination = redirectParam || fromState || "/";
            navigate(destination, { replace: true });
        } catch {
            // error toast already shown by axiosInstance interceptor
        } finally {
            setIsLoading(false);
        }
    }, [otp, phone, login, navigate, location.state, searchParams]);

    const handleResendOtp = useCallback(async () => {
        if (resendTimer > 0) return;
        const cleaned = phone.replace(/\s+/g, "");
        if (!isLoginAllowedForPhone(cleaned)) {
            toast.error("Feature under maintenance");
            return;
        }
        setIsLoading(true);
        try {
            await sendOtp(cleaned);
            toast.success("OTP resent");
            setResendTimer(OTP_RESEND_SECONDS);
            setOtp(["", "", "", "", "", ""]);
        } catch {
            // error toast already shown by axiosInstance interceptor
        } finally {
            setIsLoading(false);
        }
    }, [phone, resendTimer]);

    const handleBackToPhone = () => {
        setStep("phone");
        setOtp(["", "", "", "", "", ""]);
    };

    return {
        step,
        phone,
        otp,
        isLoading,
        phoneError,
        resendTimer,
        handlePhoneChange,
        handleSendOtp,
        handleOtpChange,
        handleOtpKeyDown,
        handleVerifyOtp,
        handleResendOtp,
        handleBackToPhone,
    };
};

export type ReturnTypeOfUseLogin = ReturnType<typeof useLogin>;
