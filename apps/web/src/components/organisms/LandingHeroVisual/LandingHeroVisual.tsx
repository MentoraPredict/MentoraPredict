import { FaArrowTrendUp } from "react-icons/fa6";

import heroDashboard from "@/assets/landing-analytics-dashboard.png";
import HeroMetricBadge from "@/components/molecules/HeroMetricBadge";

export default function LandingHeroVisual() {
    return (
        <div
            className="
                relative
                pointer-events-none
                mx-auto
                w-full
                max-w-xl
                px-4
                pb-8
                pt-2
                lg:max-w-none
            "
        >
            <div
                className="
                    absolute
                    pointer-events-none
                    inset-x-8
                    top-10
                    h-3/4
                    rounded-full
                    bg-cyan-300/25
                    blur-3xl
                "
                aria-hidden="true"
            />

            <div
                className="
                    relative
                    pointer-events-none
                    rotate-2
                    overflow-hidden
                    rounded-lg
                    border
                    border-sky-300/50
                    bg-sky-100/40
                    p-2
                    shadow-[0_28px_70px_rgba(21,101,192,0.18)]
                    transition
                    duration-300
                    hover:rotate-1
                    hover:scale-[1.01]
                "
            >
                <img
                    src={heroDashboard}
                    alt="Panel predictivo con gráficas de rendimiento académico"
                    className="
                        aspect-[4/3]
                        h-full
                        w-full
                        rounded-md
                        object-cover
                    "
                />
            </div>

            <div
                className="
                    absolute
                    pointer-events-none
                    bottom-0
                    left-8
                    sm:left-12
                    lg:left-6
                "
            >
                <HeroMetricBadge
                    icon={<FaArrowTrendUp size={16} />}
                    label="Rendimiento estimado"
                    value="+18.4% este semestre"
                />
            </div>
        </div>
    );
}
