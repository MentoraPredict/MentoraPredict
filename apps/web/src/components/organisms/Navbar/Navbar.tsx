import { useNavigate } from "react-router-dom";

import Button from "@/components/atoms/Button";
import Container from "@/components/atoms/Container";
import Logo from "@/components/atoms/Logo";

import NavItem from "@/components/molecules/NavItem";



export default function Navbar() {
  const navigate = useNavigate();

  return (
    <header className="border-b border-gray-200">
      <Container>
        <div
          className="
            flex
            h-20
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
            <NavItem
              label="Inicio"
              href="#hero"
            />

            <NavItem
              label="Características"
              href="#features"
            />

            <NavItem
              label="Beneficios"
              href="#stats"
            />

            <NavItem
              label="Contacto"
              href="#footer"
            />
          </nav>

          <Button
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