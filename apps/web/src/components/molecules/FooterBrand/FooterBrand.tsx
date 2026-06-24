import { FaAt, FaGithub, FaLink } from "react-icons/fa";

import Logo from "@/components/atoms/Logo";
import Text from "@/components/atoms/Text";
import SocialLink from "@/components/molecules/SocialLink";

const socialLinks = [
  {
    href: "https://github.com",
    label: "GitHub",
    icon: <FaGithub aria-hidden="true" />,
  },
  {
    href: "mailto:contacto@mentorapredict.com",
    label: "Correo",
    icon: <FaAt aria-hidden="true" />,
  },
  {
    href: "#hero",
    label: "Inicio",
    icon: <FaLink aria-hidden="true" />,
  },
];

export default function FooterBrand() {
  return (
    <div className="max-w-xs">
      <Logo variant="light" />

      <Text className="mt-6 font-medium leading-relaxed text-white">
        {
          "Liderando la revoluci\u00f3n de la anal\u00edtica acad\u00e9mica preventiva mediante inteligencia artificial \u00e9tica."
        }
      </Text>

      <div className="mt-6 flex gap-3">
        {socialLinks.map((socialLink) => (
          <SocialLink
            key={socialLink.label}
            href={socialLink.href}
            ariaLabel={socialLink.label}
            icon={socialLink.icon}
            className="
                            grid
                            size-8
                            place-items-center
                            rounded-full
                            bg-white/10
                            text-blue-100
                            hover:bg-white
                            hover:text-blue-700
                        "
          />
        ))}
      </div>
    </div>
  );
}
