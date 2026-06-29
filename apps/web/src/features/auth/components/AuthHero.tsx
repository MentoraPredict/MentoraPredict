import mentoraPredictBanner from "@/assets/mentorapredict-banner.jpg";
import { Badge, Heading, Text } from "@/components/atoms";
import { LogoLink } from "@/components/molecules";
import { FaShieldAlt } from "react-icons/fa";

export default function AuthHero() {
  return (
    <section
      className="
        hidden
        bg-blue-950
        p-12
        text-white
        lg:flex
        lg:min-h-screen
        lg:flex-col
        lg:items-center
        lg:justify-between
      "
    >
      <div className="w-full mb-6 ">
        <LogoLink variant="light" />
      </div>

      <div className="flex w-full max-w-md flex-col items-center text-center">
        <div
          className="
            w-full
            rounded-xl
            border
            border-white/20
            bg-white/10
            p-6
            shadow-2xl
            shadow-blue-950/20
          "
        >
          <div
            className="
              aspect-[4/3]
              w-full
              overflow-hidden
              bg-white
            "
          >
            <img
              src={mentoraPredictBanner}
              alt="MentoraPredict"
              className="h-full w-full object-cover"
            />
          </div>
        </div>

        <div className="mt-9 space-y-4">
          <Heading as="h3" className="text-center text-3xl text-white">
            {
              "Plataforma Inteligente para Predicci\u00f3n de Riesgo Acad\u00e9mico"
            }
          </Heading>

          <Text className="mx-auto max-w-sm text-center text-sm leading-relaxed  text-white">
            {
              "Analiza patrones acad\u00e9micos, detecta riesgos tempranos y mejora la toma de decisiones."
            }
          </Text>
        </div>
      </div>

      <div className="w-full">
        <Badge
          className="
            w-fit
            gap-2
            px-3
            py-1.5
          "
        >
          <FaShieldAlt aria-hidden="true" />
          {"Conexi\u00f3n segura"}
        </Badge>
      </div>
    </section>
  );
}
