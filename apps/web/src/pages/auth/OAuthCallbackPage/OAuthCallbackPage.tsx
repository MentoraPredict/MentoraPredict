import { useEffect, useRef, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

import Button from "@/components/atoms/Button";
import Heading from "@/components/atoms/Heading";
import Spinner from "@/components/atoms/Spinner";
import Text from "@/components/atoms/Text";
import AuthTemplate from "@/components/templates/AuthTemplate";
import { APP_PATHS } from "@/routes/paths";
import { useAuthStore } from "@/store/auth.store";

export default function OAuthCallbackPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const loginWithTokens = useAuthStore((state) => state.loginWithTokens);
  const [error, setError] = useState<string>();
  const hasRun = useRef(false);

  useEffect(() => {
    if (hasRun.current) return;
    hasRun.current = true;

    const oauthError = searchParams.get("error");
    if (oauthError) {
      setError("No se pudo iniciar sesion con Microsoft. Intenta nuevamente.");
      return;
    }

    const accessToken = searchParams.get("accessToken");
    const refreshToken = searchParams.get("refreshToken");
    const expiresIn = Number(searchParams.get("expiresIn"));

    if (!accessToken || !refreshToken) {
      setError("No se pudo iniciar sesion con Microsoft. Intenta nuevamente.");
      return;
    }

    loginWithTokens({
      accessToken,
      refreshToken,
      expiresIn,
      tokenType: "Bearer",
    })
      .then(() => {
        navigate(APP_PATHS.shared.redirect, { replace: true });
      })
      .catch(() => {
        setError("No se pudo iniciar sesion con Microsoft. Intenta nuevamente.");
      });
  }, [loginWithTokens, navigate, searchParams]);

  return (
    <AuthTemplate>
      <section className="flex flex-col items-center justify-center gap-4 p-8 text-center">
        {error ? (
          <>
            <Heading as="h2">No se pudo iniciar sesion</Heading>
            <Text className="max-w-sm text-gray-600">{error}</Text>
            <Button onClick={() => navigate(APP_PATHS.public.login)}>
              Volver al inicio de sesion
            </Button>
          </>
        ) : (
          <>
            <Spinner size={32} className="text-blue-700" />
            <Text className="text-gray-600">
              Conectando con tu cuenta de Microsoft...
            </Text>
          </>
        )}
      </section>
    </AuthTemplate>
  );
}
