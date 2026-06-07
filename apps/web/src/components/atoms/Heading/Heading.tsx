import { ReactNode } from "react";

type HeadingLevel =
    | "h1"
    | "h2"
    | "h3"
    | "h4";

interface HeadingProps {
    children: ReactNode;
    as?: HeadingLevel;
    className?: string;
}

export default function Heading({
    children,
    as = "h2",
    className = "",
}: HeadingProps) {
    const Component = as;

    const variants = {
        h1: "text-5xl font-bold",
        h2: "text-4xl font-bold",
        h3: "text-3xl font-semibold",
        h4: "text-2xl font-semibold",
    };

    return (
        <Component
            className={`${variants[as]} ${className}`}
        >
            {children}
        </Component>
    );
}