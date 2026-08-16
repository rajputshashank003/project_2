import React, { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { updateMyProfile } from "../../utils/api_request/auth";
import { User, Mail, ShieldCheck, ArrowRight, HeartPulse } from "lucide-react";
import toast from "react-hot-toast";

const BLOOD_GROUPS = [
    "A+",
    "A-",
    "B+",
    "B-",
    "AB+",
    "AB-",
    "O+",
    "O-",
    "Unknown",
];

export const ProfileCompletionModal: React.FC = () => {
    const { isAuthenticated, isProfileComplete, user, updateUser } = useAuth();
    const [name, setName] = useState(user?.name || "");
    const [email, setEmail] = useState(user?.email || "");
    const [bloodGroup, setBloodGroup] = useState(user?.bloodGroup || "");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [errors, setErrors] = useState<{
        name?: string;
        email?: string;
        bloodGroup?: string;
    }>({});

    // Only show if user is logged in but profile is incomplete (missing name, email, or bloodGroup)
    if (!isAuthenticated || isProfileComplete) {
        return null;
    }

    const validate = () => {
        const errs: { name?: string; email?: string; bloodGroup?: string } = {};
        if (!name.trim()) {
            errs.name = "Full name is required";
        }
        if (!email.trim()) {
            errs.email = "Email address is required";
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
            errs.email = "Please enter a valid email address";
        }
        if (!bloodGroup.trim()) {
            errs.bloodGroup = "Blood group is required";
        }
        setErrors(errs);
        return Object.keys(errs).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!validate()) return;

        setIsSubmitting(true);
        try {
            const updated = await updateMyProfile({
                name: name.trim(),
                email: email.trim().toLowerCase(),
                bloodGroup: bloodGroup.trim(),
            });
            updateUser({
                name: (updated?.name || name).trim(),
                email: (updated?.email || email).trim().toLowerCase(),
                bloodGroup: (updated?.bloodGroup || bloodGroup).trim(),
            });
            toast.success(
                "Profile completed successfully! Welcome to the portal.",
            );
        } catch (err: any) {
            toast.error(
                err?.response?.data?.error?.message ||
                    "Failed to update profile. Please try again.",
            );
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-sm animate-fade-in">
            <div className="bg-white rounded-3xl shadow-2xl border border-slate-100 w-full max-w-md overflow-hidden animate-scale-up">
                {/* Header decoration */}
                <div className="bg-gradient-to-r from-emerald-600 to-teal-700 p-6 text-white text-center relative">
                    <div className="mx-auto w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center mb-3">
                        <ShieldCheck className="h-6 w-6 text-white" />
                    </div>
                    <h2 className="text-xl font-bold">Complete Your Profile</h2>
                    <p className="text-emerald-100 text-xs mt-1">
                        Please provide your details to continue using the portal
                    </p>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    <div>
                        <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                            Full Name *
                        </label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                                <User className="h-4 w-4" />
                            </div>
                            <input
                                id="onboarding-name"
                                type="text"
                                placeholder="Enter your full name"
                                value={name}
                                onChange={(e) => {
                                    setName(e.target.value);
                                    if (errors.name)
                                        setErrors((prev) => ({
                                            ...prev,
                                            name: undefined,
                                        }));
                                }}
                                className={`form-input pl-10 ${errors.name ? "border-red-500 ring-1 ring-red-500" : ""}`}
                                autoFocus
                            />
                        </div>
                        {errors.name && (
                            <p className="text-xs text-red-500 mt-1">
                                {errors.name}
                            </p>
                        )}
                    </div>

                    <div>
                        <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                            Email Address *
                        </label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                                <Mail className="h-4 w-4" />
                            </div>
                            <input
                                id="onboarding-email"
                                type="email"
                                placeholder="name@example.com"
                                value={email}
                                onChange={(e) => {
                                    setEmail(e.target.value);
                                    if (errors.email)
                                        setErrors((prev) => ({
                                            ...prev,
                                            email: undefined,
                                        }));
                                }}
                                className={`form-input pl-10 ${errors.email ? "border-red-500 ring-1 ring-red-500" : ""}`}
                            />
                        </div>
                        {errors.email && (
                            <p className="text-xs text-red-500 mt-1">
                                {errors.email}
                            </p>
                        )}
                        <p className="text-[11px] text-slate-400 mt-1">
                            Your certificates, donation receipts, and ID cards
                            will be delivered here.
                        </p>
                    </div>

                    <div>
                        <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                            Blood Group *
                        </label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                                <HeartPulse className="h-4 w-4" />
                            </div>
                            <select
                                id="onboarding-blood-group"
                                value={bloodGroup}
                                onChange={(e) => {
                                    setBloodGroup(e.target.value);
                                    if (errors.bloodGroup)
                                        setErrors((prev) => ({
                                            ...prev,
                                            bloodGroup: undefined,
                                        }));
                                }}
                                className={`form-input pl-10 bg-white ${errors.bloodGroup ? "border-red-500 ring-1 ring-red-500" : ""}`}
                            >
                                <option value="">Select Blood Group</option>
                                {BLOOD_GROUPS.map((bg) => (
                                    <option key={bg} value={bg}>
                                        {bg}
                                    </option>
                                ))}
                            </select>
                        </div>
                        {errors.bloodGroup && (
                            <p className="text-xs text-red-500 mt-1">
                                {errors.bloodGroup}
                            </p>
                        )}
                    </div>

                    <div className="pt-2">
                        <button
                            id="onboarding-submit-btn"
                            type="submit"
                            disabled={isSubmitting}
                            className="btn-primary w-full py-3 flex items-center justify-center gap-2 shadow-emerald text-sm font-semibold"
                        >
                            {isSubmitting ? (
                                <React.Fragment>
                                    <span className="h-4 w-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                                    Saving Details...
                                </React.Fragment>
                            ) : (
                                <React.Fragment>
                                    Continue to Portal{" "}
                                    <ArrowRight className="h-4 w-4" />
                                </React.Fragment>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ProfileCompletionModal;
