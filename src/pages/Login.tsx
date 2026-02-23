import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Phone, Shield, Gift, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@/components/ui/input-otp';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

const Login = () => {
  const [step, setStep] = useState<'phone' | 'otp'>('phone');
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const formatPhone = (p: string) => {
    const digits = p.replace(/\D/g, '');
    if (digits.startsWith('91') && digits.length >= 12) return '+' + digits;
    if (digits.length === 10) return '+91' + digits;
    return '+' + digits;
  };

  const handleSendOTP = async () => {
    if (phone.replace(/\D/g, '').length < 10) {
      toast({ title: 'Invalid phone number', description: 'Please enter a valid phone number', variant: 'destructive' });
      return;
    }
    setLoading(true);
    const formattedPhone = formatPhone(phone);
    const { error } = await supabase.auth.signInWithOtp({ phone: formattedPhone });
    setLoading(false);
    if (error) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
      return;
    }
    toast({ title: 'OTP Sent!', description: 'A 6-digit code has been sent to your phone' });
    setStep('otp');
  };

  const handleVerifyOTP = async () => {
    if (otp.length < 6) {
      toast({ title: 'Invalid OTP', description: 'Please enter the complete 6-digit OTP', variant: 'destructive' });
      return;
    }
    setLoading(true);
    const formattedPhone = formatPhone(phone);
    const { data, error } = await supabase.auth.verifyOtp({ phone: formattedPhone, token: otp, type: 'sms' });
    setLoading(false);
    if (error) {
      toast({ title: 'Verification failed', description: error.message, variant: 'destructive' });
      return;
    }
    
    // Check if user is admin
    if (data.user) {
      const { data: roles } = await supabase.from('user_roles').select('role').eq('user_id', data.user.id);
      const isAdmin = roles?.some(r => r.role === 'admin');
      toast({ title: 'Welcome back!', description: 'Login successful' });
      navigate(isAdmin ? '/admin' : '/dashboard');
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <div className="gradient-primary px-6 pt-12 pb-16 text-primary-foreground">
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary-foreground/20 mb-4">
            <Gift className="w-8 h-8" />
          </div>
          <h1 className="text-2xl font-bold">RewardHub</h1>
          <p className="text-primary-foreground/80 mt-1">Scan. Earn. Redeem.</p>
        </motion.div>
      </div>

      <div className="flex-1 -mt-8 px-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-card rounded-2xl shadow-xl p-6 max-w-md mx-auto">
          <h2 className="text-xl font-semibold text-card-foreground mb-1">Welcome Back</h2>
          <p className="text-muted-foreground text-sm mb-6">Login with your phone number</p>

          {step === 'phone' ? (
            <div className="space-y-4">
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input placeholder="Enter phone number" value={phone} onChange={(e) => setPhone(e.target.value)} className="pl-10" type="tel" />
              </div>
              <Button onClick={handleSendOTP} className="w-full gap-2" disabled={loading}>
                {loading ? 'Sending...' : 'Send OTP'} <ArrowRight className="w-4 h-4" />
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
              <Button onClick={handleVerifyOTP} className="w-full gap-2" disabled={loading}>
                {loading ? 'Verifying...' : 'Verify & Login'} <ArrowRight className="w-4 h-4" />
              </Button>
              <button onClick={() => setStep('phone')} className="w-full text-sm text-muted-foreground hover:text-foreground transition-colors">
                Change phone number
              </button>
            </div>
          )}

          <div className="mt-6 pt-4 border-t text-center text-sm text-muted-foreground">
            Don't have an account?{' '}
            <Link to="/signup" className="text-primary font-medium hover:underline">Sign Up</Link>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Login;
