import { FaMicrosoft } from "react-icons/fa";

import Button from "@/components/atoms/Button";
import { getMicrosoftLoginUrl } from "@/services/auth.service";

interface MicrosoftSignInButtonProps {
    label?: string;
}

export default function MicrosoftSignInButton({
    label = "Continuar con Microsoft",
}: MicrosoftSignInButtonProps) {
    return (
        <Button
            type="button"
            variant="outline"
            className="w-full gap-2"
            onClick={() => {
                window.location.href = getMicrosoftLoginUrl();
            }}
        >
            <FaMicrosoft size={16} />
            {label}
        </Button>
    );
}
