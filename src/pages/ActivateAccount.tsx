import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Input } from "@/components/ui/input";
import { Loader2, CheckCircle, XCircle } from "lucide-react";
import { useUserManagement } from "@/hooks/useUserManagement";

const ActivateAccount = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { activateUser } = useUserManagement();
  
  const [status, setStatus] = useState<'loading' | 'form' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('');
  const [credentials, setCredentials] = useState<{email: string, password: string} | null>(null);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [token, setToken] = useState<string | null>(null);
  const passwordsValid = password.length > 0 && confirmPassword.length > 0 && password === confirmPassword;

  useEffect(() => {
    const t = searchParams.get('token');
    setToken(t);
    if (!t) {
      setStatus('error');
      setMessage('Invalid activation link. No token provided.');
      return;
    }
    setStatus('form');
  }, [searchParams]);

  const activateAccount = async (token: string) => {
    try {
      const useChosenPassword = password && confirmPassword && password === confirmPassword;
      const result = await activateUser(token, useChosenPassword ? password : undefined);
      
      if (result.success) {
        setStatus('success');
        setMessage('Your account has been activated successfully!');
        if (result.credentials) {
          setCredentials(result.credentials);
        }
      } else {
        setStatus('error');
        setMessage(result.error || 'Failed to activate account. The link may be invalid or expired.');
      }
    } catch (error) {
      setStatus('error');
      setMessage('An unexpected error occurred while activating your account.');
    }
  };

  const handleContinue = () => {
    navigate('/auth');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold">Account Activation</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {status === 'loading' && (
            <div className="flex flex-col items-center space-y-4">
              <Loader2 className="h-12 w-12 animate-spin text-primary" />
              <p className="text-center text-muted-foreground">
                Activating your account...
              </p>
            </div>
          )}

          {status === 'form' && (
            <div className="space-y-4">
              <Alert>
                <AlertDescription>
                  Create your password to activate your account. Your password must meet your organization's policy.
                </AlertDescription>
              </Alert>
              <div className="space-y-2">
                <label htmlFor="password" className="text-sm font-medium">Password</label>
                <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Enter a password" />
              </div>
              <div className="space-y-2">
                <label htmlFor="confirm-password" className="text-sm font-medium">Confirm Password</label>
                <Input id="confirm-password" type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder="Re-enter your password" />
              </div>
              {!passwordsValid && (
                <p className="text-sm text-destructive">Passwords must be non-empty and match.</p>
              )}
              <Button className="w-full" onClick={() => token && passwordsValid && activateAccount(token)} disabled={!token || !passwordsValid}>
                Activate Account
              </Button>
            </div>
          )}

          {status === 'success' && (
            <div className="flex flex-col items-center space-y-4">
              <CheckCircle className="h-12 w-12 text-green-600" />
              <Alert className="border-green-200 bg-green-50">
                <AlertDescription className="text-green-800">
                  {message}
                </AlertDescription>
              </Alert>
              
              {credentials && (
                <div className="w-full space-y-3">
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <h4 className="font-semibold text-blue-900 mb-2">Your Temporary Login Credentials:</h4>
                    <div className="space-y-2 text-sm">
                      <div>
                        <span className="font-medium text-blue-800">Email:</span>
                        <div className="bg-white border rounded px-2 py-1 mt-1 font-mono text-blue-900">
                          {credentials.email}
                        </div>
                      </div>
                      <div>
                        <span className="font-medium text-blue-800">Temporary Password:</span>
                        <div className="bg-white border rounded px-2 py-1 mt-1 font-mono text-blue-900">
                          {credentials.password}
                        </div>
                      </div>
                    </div>
                    <p className="text-xs text-blue-700 mt-2">
                      You'll be prompted to change this password on your first login.
                    </p>
                  </div>
                </div>
              )}
              
              <Button onClick={handleContinue} className="w-full">
                Continue to Sign In
              </Button>
            </div>
          )}

          {status === 'error' && (
            <div className="flex flex-col items-center space-y-4">
              <XCircle className="h-12 w-12 text-red-600" />
              <Alert className="border-red-200 bg-red-50">
                <AlertDescription className="text-red-800">
                  {message}
                </AlertDescription>
              </Alert>
              <div className="space-y-2 w-full">
                <Button onClick={handleContinue} variant="outline" className="w-full">
                  Go to Sign In
                </Button>
                <p className="text-center text-sm text-muted-foreground">
                  Contact your administrator if you continue to have issues.
                </p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ActivateAccount;