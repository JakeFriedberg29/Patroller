import { useState } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Mail, Loader2 } from "lucide-react";
import { useEmailService } from "@/hooks/useEmailService";
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
  const {
    sendActivationEmail
  } = useEmailService();
  const handleResendActivation = async () => {
    setIsLoading(true);
    try {
      const result = await sendActivationEmail({
        userId,
        email,
        fullName,
        isResend: true,
        organizationName: 'Emergency Management Platform'
      });
      if (!result.success) {
        toast.error(result.error || 'Failed to resend activation email');
        return;
      }
      toast.success(`Activation email resent successfully via ${result.provider}!`);
    } catch (error) {
      console.error('Error resending activation email:', error);
      toast.error('Failed to resend activation email');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button
      onClick={handleResendActivation}
      disabled={isLoading}
      variant={variant}
      size={size}
      className={className}
    >
      {isLoading ? (
        <>
          <Loader2 className="h-4 w-4 animate-spin" />
          Sending...
        </>
      ) : (
        <>
          <Mail className="h-4 w-4" />
          Resend
        </>
      )}
    </Button>
  );
};