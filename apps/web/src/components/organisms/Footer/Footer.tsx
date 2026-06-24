import Container from "@/components/atoms/Container";
import FooterBrand from "@/components/molecules/FooterBrand";
import FooterLinkColumn from "@/components/molecules/FooterLinkColumn";

const footerSections = [
  {
    title: "Producto",
    links: [
      { label: "Caracter\u00edsticas", href: "#features" },
      { label: "Seguridad de Datos", href: "#features" },
      { label: "Casos de \u00c9xito", href: "#stats" },
      { label: "API para Desarrolladores", href: "#footer" },
    ],
  },
  {
    title: "Tecnolog\u00eda",
    links: [
      { label: "Modelos Predictivos", href: "#features" },
      { label: "Machine Learning Cloud", href: "#features" },
      { label: "Integraci\u00f3n LMS", href: "#features" },
      { label: "Infraestructura", href: "#stats" },
    ],
  },
  {
    title: "Soporte",
    links: [
      { label: "Documentaci\u00f3n", href: "#footer" },
      { label: "Centro de Ayuda", href: "#footer" },
      { label: "Webinars", href: "#footer" },
      { label: "Contacto", href: "#footer" },
    ],
  },
];

const legalLinks = [
  { label: "Privacidad", href: "#footer" },
  { label: "T\u00e9rminos", href: "#footer" },
  { label: "Cookies", href: "#footer" },
];

export default function Footer() {
  return (
    <footer
      id="footer"
      className="
        bg-blue-950
        text-white
      "
    >
      <Container className="py-14 sm:py-16">
        <div
          className="
            grid
            gap-10
            md:grid-cols-2
            lg:grid-cols-[1.2fr_repeat(3,1fr)]
          "
        >
          <FooterBrand />

          {footerSections.map((section) => (
            <FooterLinkColumn
              key={section.title}
              title={section.title}
              links={section.links}
            />
          ))}
        </div>

        <div
          className="
            mt-16
            border-t
            border-white/15
            pt-7
            text-center
            text-sm
            text-blue-100/80
          "
        >
          <p>&copy; 2024 MentoraPredict S.A. Todos los derechos reservados.</p>

          <nav
            aria-label="Legal"
            className="
              mt-2
              flex
              flex-wrap
              justify-center
              gap-x-8
              gap-y-2
            "
          >
            {legalLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                className="transition-colors hover:text-white"
              >
                {link.label}
              </a>
            ))}
          </nav>
        </div>
      </Container>
    </footer>
  );
}
