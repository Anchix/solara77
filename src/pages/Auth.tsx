import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { Mail, Eye, EyeOff } from "lucide-react";

const Auth = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [loginForm, setLoginForm] = useState({ email: "", password: "" });
  const [signupForm, setSignupForm] = useState({ email: "", password: "", name: "", phone: "" });

  useEffect(() => {
    supabase.auth.onAuthStateChange((event, session) => {
      if (session) navigate("/");
    });
  }, [navigate]);

  const handleEmailLogin = async () => {
    if (!loginForm.email || !loginForm.password) { toast.error("Please fill all fields"); return; }
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email: loginForm.email, password: loginForm.password });
    if (error) toast.error(error.message);
    else { toast.success("Welcome back!"); navigate("/"); }
    setLoading(false);
  };

  const handleEmailSignup = async () => {
    if (!signupForm.email || !signupForm.password || !signupForm.name) { toast.error("Please fill all fields"); return; }
    setLoading(true);
    const { error } = await supabase.auth.signUp({
      email: signupForm.email,
      password: signupForm.password,
      options: { data: { full_name: signupForm.name, phone: signupForm.phone } },
    });
    if (error) toast.error(error.message);
    else { toast.success("Account created! Welcome to Solura ✨"); navigate("/"); }
    setLoading(false);
  };

  const handlePhoneOtp = async () => {
    if (!phoneLogin.phone) { toast.error("Enter phone number"); return; }
    setLoading(true);
    const phone = phoneLogin.phone.startsWith("+") ? phoneLogin.phone : `+91${phoneLogin.phone}`;
    const { error } = await supabase.auth.signInWithOtp({ phone });
    if (error) toast.error(error.message);
    else { setOtpSent(true); toast.success("OTP sent!"); }
    setLoading(false);
  };

  const handleVerifyOtp = async () => {
    setLoading(true);
    const phone = phoneLogin.phone.startsWith("+") ? phoneLogin.phone : `+91${phoneLogin.phone}`;
    const { error } = await supabase.auth.verifyOtp({ phone, token: phoneLogin.otp, type: "sms" });
    if (error) toast.error(error.message);
    else { toast.success("Welcome!"); navigate("/"); }
    setLoading(false);
  };

  const handleGoogleLogin = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: window.location.origin },
    });
    if (error) toast.error(error.message);
  };

  return (
    <div className="min-h-screen flex items-center justify-center py-12">
      <div className="w-full max-w-md mx-auto px-6">
        <div className="text-center mb-8">
          <h1 className="font-display text-4xl font-semibold text-primary mb-2">SOLURA</h1>
          <p className="text-muted-foreground">Sign in to track orders & get exclusive deals</p>
        </div>

        <div className="bg-card border border-border rounded-lg p-6 space-y-6">
          <Tabs defaultValue="login">
            <TabsList className="w-full">
              <TabsTrigger value="login" className="flex-1">Login</TabsTrigger>
              <TabsTrigger value="signup" className="flex-1">Sign Up</TabsTrigger>
            </TabsList>

            <TabsContent value="login" className="space-y-4 mt-4">
              <div>
                <Label>Email</Label>
                <Input type="email" value={loginForm.email} onChange={(e) => setLoginForm({ ...loginForm, email: e.target.value })} className="mt-1" placeholder="you@example.com" />
              </div>
              <div>
                <Label>Password</Label>
                <div className="relative">
                  <Input type={showPassword ? "text" : "password"} value={loginForm.password} onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })} className="mt-1 pr-10" />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>
              <Button className="w-full gap-2" onClick={handleEmailLogin} disabled={loading}>
                <Mail className="h-4 w-4" /> {loading ? "Signing in..." : "Sign In with Email"}
              </Button>
            </TabsContent>

            <TabsContent value="signup" className="space-y-4 mt-4">
              <div>
                <Label>Full Name</Label>
                <Input value={signupForm.name} onChange={(e) => setSignupForm({ ...signupForm, name: e.target.value })} className="mt-1" placeholder="Your name" />
              </div>
              <div>
                <Label>Email</Label>
                <Input type="email" value={signupForm.email} onChange={(e) => setSignupForm({ ...signupForm, email: e.target.value })} className="mt-1" placeholder="you@example.com" />
              </div>
              <div>
                <Label>Phone (optional)</Label>
                <Input type="tel" value={signupForm.phone} onChange={(e) => setSignupForm({ ...signupForm, phone: e.target.value.replace(/\D/g, "") })} className="mt-1" placeholder="9876543210" />
              </div>
              <div>
                <Label>Password</Label>
                <Input type="password" value={signupForm.password} onChange={(e) => setSignupForm({ ...signupForm, password: e.target.value })} className="mt-1" placeholder="Min 6 characters" />
              </div>
              <Button className="w-full" onClick={handleEmailSignup} disabled={loading}>
                {loading ? "Creating account..." : "Create Account"}
              </Button>
            </TabsContent>
          </Tabs>

          <div className="relative">
            <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-border" /></div>
            <div className="relative flex justify-center text-xs"><span className="bg-card px-3 text-muted-foreground">or continue with</span></div>
          </div>

          <div className="space-y-3">
            <Button variant="outline" className="w-full gap-2" onClick={handleGoogleLogin}>
              <svg className="h-4 w-4" viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
              Continue with Google
            </Button>

            <div className="space-y-2">
              <p className="text-xs text-center text-muted-foreground">Or login with phone number</p>
              <div className="flex gap-2">
                <Input type="tel" placeholder="Phone number" value={phoneLogin.phone} onChange={(e) => setPhoneLogin({ ...phoneLogin, phone: e.target.value.replace(/\D/g, "") })} className="flex-1" />
                {!otpSent ? (
                  <Button variant="outline" size="sm" onClick={handlePhoneOtp} disabled={loading}>
                    <Phone className="h-4 w-4 mr-1" /> Send OTP
                  </Button>
                ) : (
                  <>
                    <Input type="text" placeholder="OTP" value={phoneLogin.otp} onChange={(e) => setPhoneLogin({ ...phoneLogin, otp: e.target.value })} className="w-24" />
                    <Button size="sm" onClick={handleVerifyOtp} disabled={loading}>Verify</Button>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Auth;
