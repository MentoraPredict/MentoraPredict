import { useState } from "react";
import { useNavigate } from "react-router-dom";

import { APP_PATHS } from "@/routes/paths";
import { useAuthStore } from "@/store/auth.store";

export default function useLogout() {
  const navigate = useNavigate();
  const logout = useAuthStore((state) => state.logout);

  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = async () => {
    setIsLoggingOut(true);

    try {
      await logout();
    } finally {
      setIsLoggingOut(false);

      navigate(APP_PATHS.public.login, {
        replace: true,
      });
    }
  };

  return {
    isLoggingOut,
    handleLogout,
  };
}
