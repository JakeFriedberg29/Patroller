import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";
import { useAuthRedirect } from "@/hooks/useAuthRedirect";
import { AuthBrandingPane } from "@/components/AuthBrandingPane";
import authHeroImage from "@/assets/auth-hero-new.jpg";
import { Shield } from "lucide-react";
const Auth = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [redirecting, setRedirecting] = useState(false);

  // Form states
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const {
    user
  } = useAuth();
  useAuthRedirect();
  useEffect(() => {
    // Check if user is already authenticated
    const checkUser = async () => {
      const {
        data: {
          session
        }
      } = await supabase.auth.getSession();
      if (session) {
        setRedirecting(true);
      }
    };
    checkUser();
  }, []);
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const {
      error
    } = await supabase.auth.signInWithPassword({
      email: loginEmail,
      password: loginPassword
    });
    if (error) {
      setError(error.message);
      toast.error(error.message);
    } else {
      // Log successful login
      try {
        await supabase.rpc('log_user_action', {
          p_action: 'LOGIN',
          p_resource_type: 'session',
          p_resource_id: null,
          p_metadata: {
            email: loginEmail,
            login_method: 'email_password',
            timestamp: new Date().toISOString()
          }
        });
      } catch (logError) {
        console.log('Failed to log login action:', logError);
      }
      toast.success("Welcome back!");
      setRedirecting(true);
      // Redirect will be handled by useAuthRedirect hook
    }
    setLoading(false);
  };
  const handlePasswordChange = (password: string) => {
    setLoginPassword(password);
  };
  if (redirecting) {
    return <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-muted-foreground">Redirecting to your dashboard...</p>
        </div>
      </div>;
  }
  return <div className="min-h-screen flex">
      {/* Left Pane - Sign In Form */}
      <div className="flex-1 flex items-center justify-center bg-background p-4 lg:p-8">
        <div className="w-full max-w-md">
          <Card className="p-8">
            <CardContent className="p-0">
              <div className="text-center mb-8">
                {/* Placeholder Logo */}
                <div className="flex justify-center mb-6">
                  <div className="w-16 h-16 bg-[#B53A3A] rounded-full flex items-center justify-center">
                    <Shield className="w-8 h-8 text-white" />
                  </div>
                </div>
                <h1 className="text-3xl font-bold text-foreground mb-2">Welcome Back</h1>
                <p className="text-muted-foreground">Sign in to access your Patroller Console</p>
              </div>

              {error && <Alert className="mb-4 border-destructive">
                  <AlertDescription className="text-destructive">
                    {error}
                  </AlertDescription>
                </Alert>}

              <form onSubmit={handleLogin} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="login-email">Email</Label>
                  <Input id="login-email" type="email" value={loginEmail} onChange={e => setLoginEmail(e.target.value)} required disabled={loading} placeholder="Enter your email address" className="bg-slate-50 rounded-2xl border border-black" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="login-password">Password</Label>
                  <Input id="login-password" type="password" value={loginPassword} onChange={e => handlePasswordChange(e.target.value)} required disabled={loading} placeholder="Enter your password" minLength={12} className="bg-slate-50 rounded-2xl border border-black" />
                </div>
                
                <Button type="submit" disabled={loading} className="w-full rounded-2xl border border-black">
                  {loading ? "Signing in..." : "Sign In"}
                </Button>

                <div className="text-center">
                  <button type="button" onClick={async () => {
                  if (loginEmail) {
                    const {
                      error
                    } = await supabase.auth.resetPasswordForEmail(loginEmail, {
                      redirectTo: `${window.location.origin}/reset-password`
                    });
                    if (error) {
                      toast.error("Failed to send password reset email");
                    } else {
                      toast.success("Password reset email sent! Check your inbox.");
                    }
                  } else {
                    toast.error("Please enter your email address first.");
                  }
                }} className="text-sm text-primary hover:underline">
                    Forgot your password?
                  </button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Right Pane - Branding */}
      <div className="hidden lg:block lg:flex-1">
        <AuthBrandingPane image={authHeroImage} className="h-full" />
      </div>
    </div>;
};
export default Auth;