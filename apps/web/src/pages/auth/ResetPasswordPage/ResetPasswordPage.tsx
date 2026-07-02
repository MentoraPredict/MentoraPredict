import AuthTemplate from "@/components/templates/AuthTemplate";
import { ResetPasswordForm } from "@/features/auth/components";

export default function ResetPasswordPage() {
  return (
    <AuthTemplate>
      <ResetPasswordForm />
    </AuthTemplate>
  );
}
