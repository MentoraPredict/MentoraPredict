import Container from "@/components/atoms/Container";

import StatCard from "@/components/molecules/StatCard";

export default function StatsSection() {
  return (
    <section id="stats" className="scroll-mt-20 bg-blue-950 py-20">
      <Container>
        <div
          className="
            grid
            gap-6
            md:grid-cols-2
            lg:grid-cols-4
          "
        >
          <StatCard value="+25%" label="Retención académica" />

          <StatCard value="92%" label="Precisión predictiva" />

          <StatCard value="+500" label="Estudiantes analizados" />

          <StatCard value="24/7" label="Monitoreo continuo" />
        </div>
      </Container>
    </section>
  );
}
