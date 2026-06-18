import AuthTemplate from "@/components/templates/AuthTemplate";
import LoginForm from "@/features/auth/components/LoginForm";

export default function App() {
    return (
        <AuthTemplate>
            <LoginForm />
        </AuthTemplate>
    );
}
