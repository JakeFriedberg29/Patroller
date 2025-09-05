import { useState } from "react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Mail, Loader2 } from "lucide-react";

interface ResendActivationButtonProps {
  userId: string;
  email: string;
  fullName: string;
  variant?: "default" | "outline" | "ghost";
  size?: "default" | "sm" | "lg";
  className?: string;
}

export const ResendActivationButton = ({
  userId,
  email,
  fullName,
  variant = "outline",
  size = "sm",
  className
}: ResendActivationButtonProps) => {
  const [isLoading, setIsLoading] = useState(false);

  const handleResendActivation = async () => {
    setIsLoading(true);
    
    try {
      const { data, error } = await supabase.functions.invoke('send-activation-email', {
        body: {
          userId,
          email,
          fullName,
          isResend: true
        }
      });

      if (error) {
        console.error('Error resending activation email:', error);
        toast.error('Failed to send invitation email');
        return;
      }

      if (data?.success) {
        toast.success(`Invitation email sent to ${email}!`, {
          description: 'They will receive an email with activation instructions.'
        });
      } else {
        toast.error(data?.error || 'Failed to send invitation email');
      }
    } catch (error) {
      console.error('Error generating activation link:', error);
      toast.error('Failed to send invitation email');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button
      variant={variant}
      size={size}
      onClick={handleResendActivation}
      disabled={isLoading}
      className={className}
    >
      {isLoading ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <Mail className="h-4 w-4" />
      )}
      {isLoading ? 'Sending...' : 'Resend Invitation'}
    </Button>
  );
};