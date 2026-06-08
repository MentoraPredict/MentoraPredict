import { FiGlobe } from "react-icons/fi";

export default function AuthFooter() {
    return (
        <div
            className="
                flex
                items-center
                justify-between
                text-sm
                text-gray-500
            "
        >
            <div
                className="
                    flex
                    items-center
                    gap-2
                "
            >
                <FiGlobe />

                <span>
                    Español
                </span>
            </div>

            <button
                type="button"
                className="
                    hover:text-blue-700
                "
            >
                Ayuda y soporte
            </button>
        </div>
    );
}