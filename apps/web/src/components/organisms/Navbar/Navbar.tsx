import Button from "@/components/atoms/Button";
import Container from "@/components/atoms/Container";
import Logo from "@/components/atoms/Logo";

import NavItem from "@/components/molecules/NavItem";

export default function Navbar() {
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

          <Button>
            Iniciar sesión
          </Button>
        </div>
      </Container>
    </header>
  );
}