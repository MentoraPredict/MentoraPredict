import { FaGraduationCap } from "react-icons/fa";

export default function Logo() {
    return (
        <div className="flex items-center gap-2">
            <FaGraduationCap
                size={24}
                className="text-blue-700"
            />

            <span className="text-xl font-bold">
                MentoraPredict
            </span>
        </div>
    );
}