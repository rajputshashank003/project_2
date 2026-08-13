import React, { useContext } from 'react';
import { ArrowLeft, ArrowRight, RotateCcw, Phone } from 'lucide-react';
import { LoginContext } from '../context';

export const PhoneStep: React.FC = () => {
  const ctx = useContext(LoginContext);
  if (!ctx) return null;
  const { phone, phoneError, isLoading, handlePhoneChange, handleSendOtp } = ctx;

  return (
    <div className="animate-fade-in">
      <div className="flex items-center justify-center h-14 w-14 rounded-2xl bg-emerald-100 mx-auto mb-6">
        <Phone className="h-7 w-7 text-emerald-600" />
      </div>
      <h1 className="text-2xl font-bold text-slate-900 text-center mb-1">Welcome Back</h1>
      <p className="text-slate-500 text-center text-sm mb-8">
        Enter your mobile number to receive a one-time password
      </p>

      <div className="mb-6">
        <label htmlFor="phone-input" className="form-label">Mobile Number</label>
        <div className="relative">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 text-sm font-medium select-none">+91</span>
          <input
            id="phone-input"
            type="tel"
            inputMode="numeric"
            maxLength={10}
            placeholder="9000000000"
            value={phone}
            onChange={(e) => handlePhoneChange(e.target.value.replace(/\D/g, ''))}
            onKeyDown={(e) => e.key === 'Enter' && handleSendOtp()}
            className={`form-input pl-14 ${phoneError ? 'border-red-400 focus:border-red-400' : ''}`}
            autoFocus
          />
        </div>
        {phoneError && <p className="text-red-500 text-xs mt-1.5">{phoneError}</p>}
      </div>

      <button
        id="send-otp-btn"
        onClick={handleSendOtp}
        disabled={isLoading || !phone}
        className="btn-primary w-full py-3 text-base"
      >
        {isLoading ? (
          <span className="flex items-center gap-2 justify-center">
            <span className="h-4 w-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
            Sending OTP…
          </span>
        ) : (
          <span className="flex items-center gap-2 justify-center">
            Get OTP <ArrowRight className="h-4 w-4" />
          </span>
        )}
      </button>

      <p className="text-xs text-slate-400 text-center mt-4">
        By continuing you agree to our terms. OTP will be sent via SMS.
      </p>
    </div>
  );
};

export const OtpStep: React.FC = () => {
  const ctx = useContext(LoginContext);
  if (!ctx) return null;
  const { phone, otp, isLoading, resendTimer, handleOtpChange, handleOtpKeyDown, handleVerifyOtp, handleResendOtp, handleBackToPhone } = ctx;

  return (
    <div className="animate-fade-in">
      <button
        onClick={handleBackToPhone}
        className="flex items-center gap-1.5 text-slate-500 hover:text-slate-700 text-sm mb-6 transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        Back
      </button>

      <h1 className="text-2xl font-bold text-slate-900 mb-1">Verify OTP</h1>
      <p className="text-slate-500 text-sm mb-2">
        We've sent a 6-digit code to{' '}
        <span className="font-semibold text-slate-700">+91 {phone}</span>
      </p>
      <p className="text-xs text-slate-400 mb-8">(For demo, enter any 6 digits)</p>

      <div className="flex items-center justify-center gap-2 sm:gap-3 mb-8">
        {otp.map((digit, i) => (
          <input
            key={i}
            id={`otp-${i}`}
            type="text"
            inputMode="numeric"
            maxLength={1}
            value={digit}
            onChange={(e) => handleOtpChange(i, e.target.value.replace(/\D/g, ''))}
            onKeyDown={(e) => handleOtpKeyDown(i, e)}
            className="otp-input"
            autoFocus={i === 0}
          />
        ))}
      </div>

      <button
        id="verify-otp-btn"
        onClick={handleVerifyOtp}
        disabled={isLoading || otp.join('').length < 6}
        className="btn-primary w-full py-3 text-base mb-4"
      >
        {isLoading ? (
          <span className="flex items-center gap-2 justify-center">
            <span className="h-4 w-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
            Verifying…
          </span>
        ) : (
          'Verify & Login'
        )}
      </button>

      <div className="text-center">
        {resendTimer > 0 ? (
          <p className="text-sm text-slate-500">
            Resend OTP in <span className="font-semibold text-emerald-700">{resendTimer}s</span>
          </p>
        ) : (
          <button
            onClick={handleResendOtp}
            className="flex items-center gap-1.5 text-sm text-emerald-700 hover:text-emerald-800 font-medium transition-colors mx-auto"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            Resend OTP
          </button>
        )}
      </div>
    </div>
  );
};
