import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, CheckCircle, XCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { validatePassword, getPasswordStrengthColor, getPasswordStrengthText } from "@/utils/passwordValidation";

const ResetPassword = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [status, setStatus] = useState<'idle' | 'validating' | 'ready' | 'submitting' | 'success' | 'error'>('validating');
  const [message, setMessage] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [confirmPassword, setConfirmPassword] = useState<string>("");
  const [errors, setErrors] = useState<string[]>([]);

  useEffect(() => {
    // Supabase sends links with type=recovery and an access_token
    const type = searchParams.get('type');
    const accessToken = searchParams.get('access_token');

    if (type !== 'recovery' || !accessToken) {
      setStatus('error');
      setMessage('Invalid or missing recovery token. Please request a new password reset email.');
      return;
    }

    // Exchange the access_token for a session so updateUser can proceed
    const exchangeToken = async () => {
      try {
        const { data, error } = await supabase.auth.setSession({
          access_token: accessToken,
          refresh_token: searchParams.get('refresh_token') || ''
        });

        if (error || !data?.session) {
          setStatus('error');
          setMessage('Your recovery link is invalid or expired. Please request a new one.');
          return;
        }
        setStatus('ready');
      } catch (e) {
        setStatus('error');
        setMessage('Failed to validate recovery link. Please try again.');
      }
    };

    exchangeToken();
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors([]);

    const validation = validatePassword(password);
    const newErrors = [...validation.errors];

    if (password !== confirmPassword) {
      newErrors.push('Passwords do not match');
    }

    if (newErrors.length > 0) {
      setErrors(newErrors);
      return;
    }

    setStatus('submitting');
    try {
      const { error } = await supabase.auth.updateUser({ password });
      if (error) {
        setStatus('error');
        setMessage(error.message || 'Failed to update password.');
        return;
      }

      setStatus('success');
      setMessage('Your password has been reset successfully. You can now sign in.');
    } catch (e: any) {
      setStatus('error');
      setMessage(e?.message || 'Unexpected error updating password.');
    }
  };

  const handleContinue = () => {
    navigate('/auth');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold">Reset Password</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {status === 'validating' && (
            <div className="flex flex-col items-center space-y-4">
              <Loader2 className="h-12 w-12 animate-spin text-primary" />
              <p className="text-center text-muted-foreground">Validating your recovery link...</p>
            </div>
          )}

          {status === 'error' && (
            <div className="flex flex-col items-center space-y-4">
              <XCircle className="h-12 w-12 text-red-600" />
              <Alert className="border-red-200 bg-red-50">
                <AlertDescription className="text-red-800">{message}</AlertDescription>
              </Alert>
              <Button variant="outline" onClick={() => navigate('/auth')} className="w-full">Back to Sign In</Button>
            </div>
          )}

          {(status === 'ready' || status === 'submitting') && (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="new-password" className="text-sm font-medium">New Password</label>
                <Input id="new-password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Enter a new password" disabled={status==='submitting'} />
                {password && (
                  <p className={`text-xs ${getPasswordStrengthColor(errors)}`}>Strength: {getPasswordStrengthText(errors)}</p>
                )}
              </div>
              <div className="space-y-2">
                <label htmlFor="confirm-password" className="text-sm font-medium">Confirm Password</label>
                <Input id="confirm-password" type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder="Re-enter your new password" disabled={status==='submitting'} />
              </div>
              {errors.length > 0 && (
                <Alert className="border-destructive">
                  <AlertDescription>
                    <ul className="list-disc pl-5 space-y-1">
                      {errors.map((err, idx) => <li key={idx} className="text-sm">{err}</li>)}
                    </ul>
                  </AlertDescription>
                </Alert>
              )}
              <Button type="submit" className="w-full" disabled={status==='submitting'}>
                {status==='submitting' ? 'Updating...' : 'Update Password'}
              </Button>
            </form>
          )}

          {status === 'success' && (
            <div className="flex flex-col items-center space-y-4">
              <CheckCircle className="h-12 w-12 text-green-600" />
              <Alert className="border-green-200 bg-green-50">
                <AlertDescription className="text-green-800">{message}</AlertDescription>
              </Alert>
              <Button onClick={handleContinue} className="w-full">Continue to Sign In</Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ResetPassword;
