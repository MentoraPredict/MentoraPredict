interface FooterLink {
    label: string;
    href: string;
}

interface FooterLinkColumnProps {
    title: string;
    links: FooterLink[];
}

export default function FooterLinkColumn({
    title,
    links,
}: FooterLinkColumnProps) {
    return (
        <nav aria-label={title}>
            <h3 className="text-xs font-bold uppercase tracking-wider text-white">
                {title}
            </h3>

            <ul className="mt-5 space-y-4">
                {links.map((link) => (
                    <li key={link.label}>
                        <a
                            href={link.href}
                            className="
                                text-sm
                                text-blue-100/80
                                transition-colors
                                hover:text-white
                            "
                        >
                            {link.label}
                        </a>
                    </li>
                ))}
            </ul>
        </nav>
    );
}
