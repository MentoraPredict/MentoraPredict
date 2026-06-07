import { FaGithub } from "react-icons/fa";
import { FaLinkedin } from "react-icons/fa";

import Container from "@/components/atoms/Container";
import Logo from "@/components/atoms/Logo";
import Text from "@/components/atoms/Text";

import SocialLink from "@/components/molecules/SocialLink";

export default function Footer() {
  return (
    <footer
      id="footer"
      className="
        border-t
        border-gray-200
        py-10
      "
    >
      <Container>
        <div
          className="
            flex
            flex-col
            items-center
            gap-6
          "
        >
          <Logo />

          <div className="flex gap-4">
            <SocialLink
              href="#"
              icon={<FaGithub />}
            />

            <SocialLink
              href="#"
              icon={<FaLinkedin />}
            />
          </div>

          <Text variant="caption">
            © 2026 MentoraPredict
          </Text>
        </div>
      </Container>
    </footer>
  );
}