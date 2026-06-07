import { FaBell } from "react-icons/fa";
import { FaBrain } from "react-icons/fa";
import { FaChartLine } from "react-icons/fa";

import Container from "@/components/atoms/Container";
import Heading from "@/components/atoms/Heading";
import Text from "@/components/atoms/Text";

import FeatureCard from "@/components/molecules/FeatureCard";

export default function FeaturesSection() {
    return (
        <section
            id="features"
            className="py-20"
        >
            <Container>
                <div className="text-center">
                    <Heading as="h2">
                        Características
                    </Heading>

                    <Text className="mt-4">
                        Herramientas impulsadas por IA.
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
                        description="Análisis avanzado del rendimiento."
                    />

                    <FeatureCard
                        icon={<FaBell />}
                        title="Alertas"
                        description="Detección temprana de riesgos."
                    />

                    <FeatureCard
                        icon={<FaChartLine />}
                        title="Recomendaciones"
                        description="Acciones personalizadas para mejorar resultados."
                    />
                </div>
            </Container>
        </section>
    );
}