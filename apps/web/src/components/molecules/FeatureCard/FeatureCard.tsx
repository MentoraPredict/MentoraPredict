import { ReactNode } from "react";

import Heading from "@/components/atoms/Heading";
import Text from "@/components/atoms/Text";

interface FeatureCardProps {
    icon: ReactNode;
    title: string;
    description: string;
}

export default function FeatureCard({
    icon,
    title,
    description,
}: FeatureCardProps) {
    return (
        <article
            className="
        rounded-2xl
        bg-white
        p-6
        shadow-md
        transition-transform
        hover:-translate-y-1
      "
        >
            <div className="mb-4 text-3xl text-blue-700">
                {icon}
            </div>

            <Heading as="h4">
                {title}
            </Heading>

            <Text className="mt-2">
                {description}
            </Text>
        </article>
    );
}