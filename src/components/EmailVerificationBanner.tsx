import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Mail, X } from "lucide-react";

const EmailVerificationBanner = () => {
  const { user, isEmailVerified, resendVerification } = useAuth();
  const [isResending, setIsResending] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);

  // Don't show banner if user is verified, not logged in, or dismissed
  if (!user || isEmailVerified || isDismissed) {
    return null;
  }

  const handleResendVerification = async () => {
    setIsResending(true);
    await resendVerification();
    setIsResending(false);
  };

  return (
    <Alert className="relative border-yellow-200 bg-yellow-50 text-yellow-800">
      <Mail className="h-4 w-4" />
      <AlertDescription className="flex items-center justify-between w-full">
        <div className="flex-1">
          <strong>Email verification required.</strong> Please check your email and click the verification link to access all features.
        </div>
        <div className="flex items-center gap-2 ml-4">
          <Button
            size="sm"
            variant="outline"
            onClick={handleResendVerification}
            disabled={isResending}
            className="text-yellow-800 border-yellow-300 hover:bg-yellow-100"
          >
            {isResending ? "Sending..." : "Resend"}
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => setIsDismissed(true)}
            className="text-yellow-800 hover:bg-yellow-100 p-1"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </AlertDescription>
    </Alert>
  );
};

export default EmailVerificationBanner;