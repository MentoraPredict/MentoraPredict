import { useNavigate } from "react-router-dom";

import Badge from "@/components/atoms/Badge";
import Button from "@/components/atoms/Button";
import Container from "@/components/atoms/Container";
import Heading from "@/components/atoms/Heading";
import Text from "@/components/atoms/Text";

export default function HeroSection() {
  const navigate = useNavigate();

  return (
    <section
      id="hero"
      className="py-24"
    >
      <Container>
        <div
          className="
            mx-auto
            max-w-4xl
            text-center
          "
        >
          <Badge>
            IA PARA EDUCACIÓN
          </Badge>

          <Heading
            as="h1"
            className="mt-6"
          >
            Predicción inteligente del
            rendimiento académico
          </Heading>

          <Text
            className="
              mx-auto
              mt-6
              max-w-2xl
            "
          >
            MentoraPredict ayuda a
            identificar riesgos
            académicos y generar
            recomendaciones basadas en
            inteligencia artificial.
          </Text>

          <div
            className="
              mt-8
              flex
              justify-center
            "
          >
            <Button
              onClick={() => {
                navigate("/login");
              }}
            >
              Comenzar ahora
            </Button>
          </div>
        </div>
      </Container>
    </section>
  );
}