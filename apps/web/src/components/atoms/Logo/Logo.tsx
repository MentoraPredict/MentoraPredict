import { FaChartBar } from "react-icons/fa";

interface LogoProps {
    variant?: "default" | "light";
}

export default function Logo({
    variant = "default",
}: LogoProps) {
    const textColor = variant === "light" ? "text-white" : "text-blue-700";

    return (
        <div className="flex items-center gap-3">
            <span
                className="
                    grid
                    size-8
                    place-items-center
                    rounded-lg
                    bg-blue-700
                    text-white
                    shadow-sm
                "
            >
                <FaChartBar
                    size={15}
                    aria-hidden="true"
                />
            </span>

            <span className={`text-xl font-bold ${textColor}`}>
                MentoraPredict
            </span>
        </div>
    );
}
