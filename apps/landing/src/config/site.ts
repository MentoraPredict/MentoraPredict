export const SITE_CONFIG = {
  webAppUrl: import.meta.env.PUBLIC_WEB_APP_URL || "http://localhost:5173",
  contactEmail: "contacto@mentorapredict.com",
} as const;

export interface DownloadLink {
  label: string;
  href: string;
  platforms: readonly string[];
  available: boolean;
}

export interface DownloadConfig {
  desktop: DownloadLink;
  mobile: DownloadLink;
}

export const DOWNLOAD_CONFIG: DownloadConfig = {
  desktop: {
    label: "Download for Desktop",
    href: "#",
    platforms: ["Windows", "macOS", "Linux"] as const,
    available: false,
  },
  mobile: {
    label: "Download for Mobile",
    href: "#",
    platforms: ["Android", "iOS"] as const,
    available: false,
  },
} as const;
