import React from 'react';
import { Leaf } from 'lucide-react';
import { useLogin } from './useLogin';
import { LoginContext } from './context';
import { PhoneStep, OtpStep } from './components/LoginSteps';

const LoginContent: React.FC = () => {
  const ctx = React.useContext(LoginContext);
  if (!ctx) return null;

  return (
    <div className="min-h-[calc(100vh-64px)] flex items-center justify-center bg-gradient-to-br from-emerald-50 via-white to-slate-50 px-4 py-12">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-3xl shadow-card-lg border border-slate-100 p-8 sm:p-10">
          <div className="flex justify-center mb-8">
            <div className="h-12 w-12 rounded-2xl bg-emerald-600 flex items-center justify-center shadow-emerald">
              <Leaf className="h-6 w-6 text-white" />
            </div>
          </div>
          {ctx.step === 'phone' ? <PhoneStep /> : <OtpStep />}
        </div>

        <div className="flex items-center justify-center gap-2 mt-6">
          <div className={`h-2 rounded-full transition-all duration-300 ${ctx.step === 'phone' ? 'w-6 bg-emerald-600' : 'w-2 bg-slate-300'}`} />
          <div className={`h-2 rounded-full transition-all duration-300 ${ctx.step === 'otp' ? 'w-6 bg-emerald-600' : 'w-2 bg-slate-300'}`} />
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
