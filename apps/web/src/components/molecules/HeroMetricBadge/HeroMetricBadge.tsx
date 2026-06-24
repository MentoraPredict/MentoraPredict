import { ReactNode } from "react";

interface HeroMetricBadgeProps {
    icon: ReactNode;
    label: string;
    value: string;
}

export default function HeroMetricBadge({
    icon,
    label,
    value,
}: HeroMetricBadgeProps) {
    return (
        <div
            className="
                inline-flex
                items-center
                gap-3
                rounded-lg
                border
                border-white/70
                bg-white/90
                px-4
                py-3
                shadow-lg
                backdrop-blur
            "
        >
            <span
                className="
                    grid
                    size-9
                    place-items-center
                    rounded-full
                    bg-teal-600
                    text-white
                "
                aria-hidden="true"
            >
                {icon}
            </span>

            <span className="leading-tight">
                <span
                    className="
                        block
                        text-[0.65rem]
                        font-semibold
                        text-gray-500
                    "
                >
                    {label}
                </span>

                <strong
                    className="
                        block
                        text-sm
                        font-bold
                        text-gray-950
                    "
                >
                    {value}
                </strong>
            </span>
        </div>
    );
}
