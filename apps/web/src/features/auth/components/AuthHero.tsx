import {
    Badge,
    Logo,
    Heading,
    Text,
} from "@/components/atoms";

export default function AuthHero() {
    return (
        <section
            className="
                hidden
                lg:flex
                flex-col
                justify-between
                bg-blue-700
                p-12
                text-white
            "
        >
            <div>
                <div className="mb-12">
                    <Logo />
                </div>

                <div className="space-y-6">
                    <Heading
                        as="h1"
                        className="text-white"
                    >
                        Plataforma Inteligente para PredicciÃ³n de Riesgo AcadÃ©mico
                    </Heading>

                    <Text className="text-blue-100">
                        Analiza patrones acadÃ©micos,
                        detecta riesgos tempranos
                        y mejora la toma de decisiones.
                    </Text>
                </div>
            </div>

            <Badge>
                ConexiÃ³n segura
            </Badge>
        </section>
    );
}
