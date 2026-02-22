import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Phone, Shield, Gift, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@/components/ui/input-otp';
import { useToast } from '@/hooks/use-toast';

const Login = () => {
  const [step, setStep] = useState<'phone' | 'otp'>('phone');
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSendOTP = () => {
    if (phone.length < 10) {
      toast({ title: 'Invalid phone number', description: 'Please enter a valid phone number', variant: 'destructive' });
      return;
    }
    toast({ title: 'OTP Sent!', description: 'A 6-digit code has been sent to your phone' });
    setStep('otp');
  };

  const handleVerifyOTP = () => {
    if (otp.length < 6) {
      toast({ title: 'Invalid OTP', description: 'Please enter the complete 6-digit OTP', variant: 'destructive' });
      return;
    }
    toast({ title: 'Welcome back!', description: 'Login successful' });
    navigate('/dashboard');
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Header */}
      <div className="gradient-primary px-6 pt-12 pb-16 text-primary-foreground">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary-foreground/20 mb-4">
            <Gift className="w-8 h-8" />
          </div>
          <h1 className="text-2xl font-bold">RewardHub</h1>
          <p className="text-primary-foreground/80 mt-1">Scan. Earn. Redeem.</p>
        </motion.div>
      </div>

      {/* Form Card */}
      <div className="flex-1 -mt-8 px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-card rounded-2xl shadow-xl p-6 max-w-md mx-auto"
        >
          <h2 className="text-xl font-semibold text-card-foreground mb-1">Welcome Back</h2>
          <p className="text-muted-foreground text-sm mb-6">Login with your phone number</p>

          {step === 'phone' ? (
            <div className="space-y-4">
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Enter phone number"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="pl-10"
                  type="tel"
                />
              </div>
              <Button onClick={handleSendOTP} className="w-full gap-2">
                Send OTP <ArrowRight className="w-4 h-4" />
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                <Shield className="w-4 h-4" />
                <span>Enter the 6-digit code sent to {phone}</span>
              </div>
              <div className="flex justify-center">
                <InputOTP maxLength={6} value={otp} onChange={setOtp}>
                  <InputOTPGroup>
                    <InputOTPSlot index={0} />
                    <InputOTPSlot index={1} />
                    <InputOTPSlot index={2} />
                    <InputOTPSlot index={3} />
                    <InputOTPSlot index={4} />
                    <InputOTPSlot index={5} />
                  </InputOTPGroup>
                </InputOTP>
              </div>
              <Button onClick={handleVerifyOTP} className="w-full gap-2">
                Verify & Login <ArrowRight className="w-4 h-4" />
              </Button>
              <button
                onClick={() => setStep('phone')}
                className="w-full text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                Change phone number
              </button>
            </div>
          )}

          <div className="mt-6 pt-4 border-t text-center text-sm text-muted-foreground">
            Don't have an account?{' '}
            <Link to="/signup" className="text-primary font-medium hover:underline">
              Sign Up
            </Link>
          </div>
        </motion.div>

        {/* Admin link */}
        <div className="text-center mt-6">
          <Link to="/admin" className="text-sm text-muted-foreground hover:text-primary transition-colors">
            Admin Login →
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Login;
