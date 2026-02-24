import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Phone, KeyRound, User, Gift, ArrowRight, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@/components/ui/input-otp';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

const Signup = () => {
  const [step, setStep] = useState<'details' | 'otp'>('details');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [agentCode, setAgentCode] = useState('');
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

  const handleSubmitDetails = async () => {
    if (!name.trim() || phone.replace(/\D/g, '').length < 10 || !agentCode.trim()) {
      toast({ title: 'Missing information', description: 'Please fill all fields', variant: 'destructive' });
      return;
    }
    setLoading(true);

    // Validate agent code via secure RPC (prevents enumeration)
    const { data: isValid, error: codeError } = await supabase
      .rpc('validate_agent_code', { code_input: agentCode });

    if (codeError || !isValid) {
      setLoading(false);
      toast({ title: 'Invalid Agent Code', description: 'This code is not valid or already used', variant: 'destructive' });
      return;
    }

    // Send OTP
    const formattedPhone = formatPhone(phone);
    const { error } = await supabase.auth.signInWithOtp({
      phone: formattedPhone,
      options: { data: { name, agent_code: agentCode.toUpperCase() } }
    });
    setLoading(false);

    if (error) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
      return;
    }
    toast({ title: 'OTP Sent!', description: 'Verify your phone to complete registration' });
    setStep('otp');
  };

  const handleVerifyOTP = async () => {
    if (otp.length < 6) {
      toast({ title: 'Invalid OTP', description: 'Please enter the 6-digit OTP', variant: 'destructive' });
      return;
    }
    setLoading(true);
    const formattedPhone = formatPhone(phone);
    const { data, error } = await supabase.auth.verifyOtp({ phone: formattedPhone, token: otp, type: 'sms' });
    
    if (error) {
      setLoading(false);
      toast({ title: 'Verification failed', description: error.message, variant: 'destructive' });
      return;
    }

    // Mark agent code as used
    if (data.user) {
      await supabase.from('agent_codes').update({ 
        used: true, 
        used_by: data.user.id, 
        used_by_name: name 
      }).eq('code', agentCode.toUpperCase());
    }

    setLoading(false);
    toast({ title: 'Account Created! 🎉', description: 'Welcome to RewardHub!' });
    navigate('/dashboard');
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <div className="gradient-primary px-6 pt-12 pb-16 text-primary-foreground">
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary-foreground/20 mb-4">
            <Gift className="w-8 h-8" />
          </div>
          <h1 className="text-2xl font-bold">Join RewardHub</h1>
          <p className="text-primary-foreground/80 mt-1">Start earning rewards today</p>
        </motion.div>
      </div>

      <div className="flex-1 -mt-8 px-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-card rounded-2xl shadow-xl p-6 max-w-md mx-auto">
          <h2 className="text-xl font-semibold text-card-foreground mb-1">Create Account</h2>
          <p className="text-muted-foreground text-sm mb-6">You need an agent code to register</p>

          {step === 'details' ? (
            <div className="space-y-4">
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input placeholder="Full Name" value={name} onChange={(e) => setName(e.target.value)} className="pl-10" />
              </div>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input placeholder="Phone Number" value={phone} onChange={(e) => setPhone(e.target.value)} className="pl-10" type="tel" />
              </div>
              <div className="relative">
                <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input placeholder="Agent Code" value={agentCode} onChange={(e) => setAgentCode(e.target.value)} className="pl-10" />
              </div>
              <p className="text-xs text-muted-foreground">Agent code is a one-time code provided by your agent. Each code can only be used once.</p>
              <Button onClick={handleSubmitDetails} className="w-full gap-2" disabled={loading}>
                {loading ? 'Validating...' : 'Continue'} <ArrowRight className="w-4 h-4" />
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
                {loading ? 'Verifying...' : 'Verify & Create Account'} <ArrowRight className="w-4 h-4" />
              </Button>
              <button onClick={() => setStep('details')} className="w-full text-sm text-muted-foreground hover:text-foreground transition-colors">
                Go back
              </button>
            </div>
          )}

          <div className="mt-6 pt-4 border-t text-center text-sm text-muted-foreground">
            Already have an account?{' '}
            <Link to="/login" className="text-primary font-medium hover:underline">Login</Link>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Signup;
