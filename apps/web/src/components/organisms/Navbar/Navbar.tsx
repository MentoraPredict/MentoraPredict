import { useNavigate } from "react-router-dom";

import Button from "@/components/atoms/Button";
import Container from "@/components/atoms/Container";
import Logo from "@/components/atoms/Logo";
import NavItem from "@/components/molecules/NavItem";

export default function Navbar() {
  const navigate = useNavigate();

  return (
    <header
      className="
                sticky
                top-0
                z-[100]
                isolate
                border-b
                border-blue-900/10
                bg-[var(--color-app-background)]
                backdrop-blur
            "
    >
      <Container>
        <div
          className="
                        flex
                        h-[4.5rem]
                        items-center
                        justify-between
                    "
        >
          <Logo />

          <nav
            className="
                            hidden
                            gap-8
                            md:flex
                        "
          >
            <NavItem label="Inicio" href="#hero" />

            <NavItem label="Características" href="#features" />

            <NavItem label="Beneficios" href="#stats" />

            <NavItem label="Contacto" href="#footer" />
          </nav>

          <Button
            className="
                            rounded-lg
                            px-5
                            py-2.5
                            shadow-sm
                        "
            onClick={() => {
              navigate("/login");
            }}
          >
            Iniciar sesión
          </Button>
        </div>
      </Container>
    </header>
  );
}
