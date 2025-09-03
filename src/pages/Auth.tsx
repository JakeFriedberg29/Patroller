import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { toast } from "sonner";
import { validatePassword, getPasswordStrengthColor, getPasswordStrengthText } from "@/utils/passwordValidation";

const Auth = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form states
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [passwordValidation, setPasswordValidation] = useState({ isValid: true, errors: [] });

  useEffect(() => {
    // Check if user is already authenticated
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        navigate("/");
      }
    };
    checkUser();
  }, [navigate]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const { error } = await supabase.auth.signInWithPassword({
      email: loginEmail,
      password: loginPassword,
    });

    if (error) {
      setError(error.message);
      toast.error(error.message);
    } else {
      toast.success("Welcome back!");
      navigate("/");
    }
    setLoading(false);
  };

  const handlePasswordChange = (password: string) => {
    setLoginPassword(password);
    const validation = validatePassword(password, loginEmail);
    setPasswordValidation(validation);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold">Your Mission Portal</CardTitle>
        </CardHeader>
        <CardContent>
          {error && (
            <Alert className="mb-4 border-destructive">
              <AlertDescription className="text-destructive">
                {error}
              </AlertDescription>
            </Alert>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="login-email">Email</Label>
              <Input
                id="login-email"
                type="email"
                value={loginEmail}
                onChange={(e) => setLoginEmail(e.target.value)}
                required
                disabled={loading}
                placeholder="Enter your email address"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="login-password">Password</Label>
              <Input
                id="login-password"
                type="password"
                value={loginPassword}
                onChange={(e) => handlePasswordChange(e.target.value)}
                required
                disabled={loading}
                placeholder="Enter your password"
                minLength={12}
              />
              
              {/* Password validation feedback */}
              {loginPassword && (
                <div className="space-y-2">
                  <div className={`text-sm font-medium ${getPasswordStrengthColor(passwordValidation.errors)}`}>
                    Password Strength: {getPasswordStrengthText(passwordValidation.errors)}
                  </div>
                  {passwordValidation.errors.length > 0 && (
                    <div className="text-sm space-y-1">
                      <p className="font-medium text-muted-foreground">Password Requirements:</p>
                      <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                        <li className={passwordValidation.errors.some(e => e.includes('12 characters')) ? 'text-red-600' : 'text-green-600'}>
                          Minimum 12 characters
                        </li>
                        <li className={passwordValidation.errors.some(e => e.includes('uppercase')) ? 'text-red-600' : 'text-green-600'}>
                          At least 1 uppercase letter (A-Z)
                        </li>
                        <li className={passwordValidation.errors.some(e => e.includes('lowercase')) ? 'text-red-600' : 'text-green-600'}>
                          At least 1 lowercase letter (a-z)
                        </li>
                        <li className={passwordValidation.errors.some(e => e.includes('number')) ? 'text-red-600' : 'text-green-600'}>
                          At least 1 number (0-9)
                        </li>
                        <li className={passwordValidation.errors.some(e => e.includes('special character')) ? 'text-red-600' : 'text-green-600'}>
                          At least 1 special character
                        </li>
                        <li className={passwordValidation.errors.some(e => e.includes('repeated')) ? 'text-red-600' : 'text-green-600'}>
                          No more than 2 repeated characters in a row
                        </li>
                      </ul>
                    </div>
                  )}
                </div>
              )}
            </div>
            
            <Button 
              type="submit" 
              className="w-full" 
              disabled={loading || !passwordValidation.isValid}
            >
              {loading ? "Signing in..." : "Sign In"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default Auth;