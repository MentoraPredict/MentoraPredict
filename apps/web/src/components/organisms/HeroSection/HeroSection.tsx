import { FaArrowRight, FaBolt, FaDownload } from "react-icons/fa";
import { useNavigate } from "react-router-dom";

import Button from "@/components/atoms/Button";
import Container from "@/components/atoms/Container";
import LandingHeroVisual from "@/components/organisms/LandingHeroVisual";

export default function HeroSection() {
  const navigate = useNavigate();

  return (
    <section
      id="hero"
      className="
                overflow-hidden
                scroll-mt-20
                bg-[var(--color-app-background)]
                py-16
                sm:py-20
                lg:py-24
            "
    >
      <Container>
        <div
          className="
                        grid
                        items-center
                        gap-12
                        lg:grid-cols-[0.86fr_1.14fr]
                        lg:gap-16
                    "
        >
          <div className="max-w-xl">
            <span
              className="
                                inline-flex
                                items-center
                                gap-2
                                rounded-full
                                bg-blue-100/80
                                px-3
                                py-1.5
                                text-[0.68rem]
                                font-extrabold
                                uppercase
                                tracking-[0.08em]
                                text-blue-900
                            "
            >
              <FaBolt size={10} aria-hidden="true" />
              Novedad: modelos GPT-4o integrados
            </span>

            <h1
              className="
                                mt-6
                                max-w-[12ch]
                                text-4xl
                                font-extrabold
                                leading-[1.08]
                                text-gray-950
                                sm:text-5xl
                            "
            >
              Predicción inteligente para prevenir el{" "}
              <span className="text-blue-700">fracaso académico.</span>
            </h1>

            <p
              className="
                                mt-6
                                max-w-md
                                text-sm
                                leading-6
                                text-[var(--color-text-muted)]
                                sm:text-base
                            "
            >
              Transformamos tus datos educativos en estrategias accionables.
              MentoraPredict utiliza IA avanzada para identificar estudiantes en
              riesgo y optimizar el éxito académico.
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              <Button
                className="
                                  gap-2
                                  rounded-lg
                                  bg-blue-700
                                  px-7
                                  shadow-[var(--shadow-primary)]
                              "
                onClick={() => {
                  navigate("/login");
                }}
              >
                Empecemos
                <FaArrowRight size={13} aria-hidden="true" />
              </Button>

              <Button
                variant="outline"
                className="gap-2 rounded-lg px-7"
                onClick={() => {
                  document
                    .getElementById("downloads")
                    ?.scrollIntoView({ behavior: "smooth" });
                }}
              >
                <FaDownload size={13} aria-hidden="true" />
                Descargar App
              </Button>
            </div>
          </div>

          <LandingHeroVisual />
        </div>
      </Container>
    </section>
  );
}
