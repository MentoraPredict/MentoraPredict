import { ReactNode } from "react";

interface SocialLinkProps {
    href: string;
    icon: ReactNode;
    ariaLabel?: string;
    className?: string;
}

export default function SocialLink({
    href,
    icon,
    ariaLabel,
    className = "",
}: SocialLinkProps) {
    const isExternalLink = href.startsWith("http");

    return (
        <a
            href={href}
            aria-label={ariaLabel}
            target={isExternalLink ? "_blank" : undefined}
            rel={isExternalLink ? "noreferrer" : undefined}
            className={`
                text-gray-500
                transition-colors
                hover:text-blue-700
                ${className}
            `}
        >
            {icon}
        </a>
    );
}
