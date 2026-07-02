import { FaBell } from "react-icons/fa";
import { FaBrain } from "react-icons/fa";
import { FaChartLine } from "react-icons/fa";

import Container from "@/components/atoms/Container";
import Heading from "@/components/atoms/Heading";
import Text from "@/components/atoms/Text";

import FeatureCard from "@/components/molecules/FeatureCard";

export default function FeaturesSection() {
  return (
    <section id="features" className="scroll-mt-20 py-20">
      <Container>
        <div className="text-center">
          <Heading as="h2">Características</Heading>

          <Text className="mt-4">
            Nuestra tecnología combina machine learning con pedagogía moderna
            para ofrecer una visión 360 del ecosistema estudiantil.
          </Text>
        </div>

        <div
          className="
            mt-12
            grid
            gap-6
            md:grid-cols-3
          "
        >
          <FeatureCard
            icon={<FaBrain />}
            title="AI Analysis"
            description="Algoritmos de red neuronal que analizan
            patrones de comportamiento, asistencia y
            calificaciones para detectar anomalías antes
            de que ocurran."
          />

          <FeatureCard
            icon={<FaBell />}
            title="Alertas"
            description="Sistema de notificaciones inteligentes para
            docentes y directivos cuando un estudiante
            cruza umbrales críticos de riesgo académico."
          />

          <FeatureCard
            icon={<FaChartLine />}
            title="Recomendaciones"
            description="Sugerencias personalizadas de intervención
            basadas en perfiles psicopedagógicos para
            mejorar la tutoría y el acompañamiento."
          />
        </div>
      </Container>
    </section>
  );
}
