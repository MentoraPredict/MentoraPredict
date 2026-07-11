import { contentfulClient } from "./contentful";

interface ContentfulImage {
  fields: {
    file: {
      url: string;
      details?: {
        image?: {
          width: number;
          height: number;
        };
      };
    };
    title?: string;
  };
}

interface HeroEntry {
  fields: {
    badgeText: unknown;
    headline: unknown;
    subtext: unknown;
    ctaPrimaryText: unknown;
    ctaPrimaryLink: unknown;
    ctaSecondaryText?: unknown;
    ctaSecondaryLink?: unknown;
    image: ContentfulImage;
    imageAlt: unknown;
  };
}

interface StatEntry {
  fields: {
    value: unknown;
    label: unknown;
    order: number;
  };
}

interface FeatureEntry {
  fields: {
    title: unknown;
    description: unknown;
    icon: unknown;
    order: number;
  };
}

interface DownloadOptionEntry {
  fields: {
    platformType: unknown;
    label: unknown;
    platforms: unknown;
    downloadUrl?: unknown;
    available: boolean;
    order: number;
  };
}

export interface HeroData {
  badgeText: string;
  headline: string;
  subtext: string;
  ctaPrimaryText: string;
  ctaPrimaryLink: string;
  ctaSecondaryText: string;
  ctaSecondaryLink: string;
  imageUrl: string;
  imageAlt: string;
}

export interface StatData {
  value: string;
  label: string;
}

export interface FeatureData {
  title: string;
  description: string;
  icon: string;
}

export interface DownloadOptionData {
  platformType: string;
  label: string;
  platforms: string[];
  downloadUrl: string;
  available: boolean;
}

function extractPlainText(value: unknown): string {
  if (typeof value === "string") return value;

  if (!value || typeof value !== "object") return "";

  const doc = value as {
    nodeType?: string;
    content?: Array<{ nodeType?: string; content?: Array<{ value?: string }> }>;
  };

  if (doc.nodeType === "text" && typeof doc.value === "string") {
    return doc.value;
  }

  if (doc.nodeType !== "document" || !Array.isArray(doc.content)) {
    return String(value);
  }

  return doc.content
    .flatMap((node) => {
      if (node.nodeType === "text" && typeof node.value === "string") {
        return node.value;
      }
      return (node.content ?? [])
        .filter((inline) => inline.nodeType === "text")
        .map((inline) => inline.value ?? "");
    })
    .join("");
}

function resolveImageUrl(image: ContentfulImage): string {
  const url = image?.fields?.file?.url;

  if (!url) {
    return "";
  }

  return url.startsWith("//") ? `https:${url}` : url;
}

export async function getHero(): Promise<HeroData> {
  const fallback: HeroData = {
    badgeText: "New: GPT-4o models integrated",
    headline: "Intelligent prediction to prevent academic failure.",
    subtext:
      "We transform your educational data into actionable strategies. MentoraPredict uses advanced AI to identify at-risk students and optimize academic success.",
    ctaPrimaryText: "Get Started",
    ctaPrimaryLink: "/login",
    ctaSecondaryText: "Download App",
    ctaSecondaryLink: "#downloads",
    // Site is served under the /landing base path (astro.config.mjs) — a
    // plain "/images/..." string escapes that prefix and 404s against the
    // web app instead, since it isn't run through Astro's asset pipeline.
    imageUrl: `${import.meta.env.BASE_URL}images/landing-analytics-dashboard.png`,
    imageAlt: "MentoraPredict analytics dashboard preview",
  };

  if (!contentfulClient) return fallback;

  try {
    const entries = await contentfulClient.getEntries<HeroEntry>({
      content_type: "hero",
      limit: 1,
    });

    const entry = entries.items[0];
    if (!entry) return fallback;

    const { fields } = entry;

    return {
      badgeText: extractPlainText(fields.badgeText),
      headline: extractPlainText(fields.headline),
      subtext: extractPlainText(fields.subtext),
      ctaPrimaryText: extractPlainText(fields.ctaPrimaryText),
      ctaPrimaryLink: extractPlainText(fields.ctaPrimaryLink),
      ctaSecondaryText: extractPlainText(fields.ctaSecondaryText),
      ctaSecondaryLink: extractPlainText(fields.ctaSecondaryLink) || "#downloads",
      imageUrl: fields.image
        ? resolveImageUrl(fields.image)
        : `${import.meta.env.BASE_URL}images/landing-analytics-dashboard.png`,
      imageAlt: extractPlainText(fields.imageAlt),
    };
  } catch {
    return fallback;
  }
}

export async function getStats(): Promise<StatData[]> {
  const fallback: StatData[] = [
    { value: "+25%", label: "Academic retention" },
    { value: "92%", label: "Predictive accuracy" },
    { value: "+500", label: "Students analyzed" },
    { value: "24/7", label: "Continuous monitoring" },
  ];

  if (!contentfulClient) return fallback;

  try {
    const entries = await contentfulClient.getEntries<StatEntry>({
      content_type: "stat",
      order: ["fields.order"],
    });

    if (entries.items.length === 0) return fallback;

    return entries.items.map((item) => ({
      value: extractPlainText(item.fields.value),
      label: extractPlainText(item.fields.label),
    }));
  } catch {
    return fallback;
  }
}

export async function getFeatures(): Promise<FeatureData[]> {
  const fallback: FeatureData[] = [
    {
      title: "AI Analysis",
      description:
        "Neural network algorithms analyze behavioral patterns, attendance, and grades to detect anomalies before they occur.",
      icon: "brain",
    },
    {
      title: "Alerts",
      description:
        "Intelligent notification system for teachers and administrators when a student crosses critical academic risk thresholds.",
      icon: "bell",
    },
    {
      title: "Recommendations",
      description:
        "Personalized intervention suggestions based on psycho-pedagogical profiles to improve tutoring and student support.",
      icon: "chart",
    },
  ];

  if (!contentfulClient) return fallback;

  try {
    const entries = await contentfulClient.getEntries<FeatureEntry>({
      content_type: "feature",
      order: ["fields.order"],
    });

    if (entries.items.length === 0) return fallback;

    return entries.items.map((item) => ({
      title: extractPlainText(item.fields.title),
      description: extractPlainText(item.fields.description),
      icon: extractPlainText(item.fields.icon),
    }));
  } catch {
    return fallback;
  }
}

export async function getDownloadOptions(): Promise<DownloadOptionData[]> {
  const fallback: DownloadOptionData[] = [
    {
      platformType: "desktop",
      label: "Download for Desktop",
      platforms: ["Windows", "macOS", "Linux"],
      downloadUrl: "#",
      available: false,
    },
    {
      platformType: "mobile",
      label: "Download for Mobile",
      platforms: ["Android", "iOS"],
      downloadUrl: "#",
      available: false,
    },
  ];

  if (!contentfulClient) return fallback;

  try {
    const entries = await contentfulClient.getEntries<DownloadOptionEntry>({
      content_type: "downloadOption",
      order: ["fields.order"],
    });

    if (entries.items.length === 0) return fallback;

    return entries.items.map((item) => ({
      platformType: extractPlainText(item.fields.platformType),
      label: extractPlainText(item.fields.label),
      platforms: extractPlainText(item.fields.platforms)
        .split(",")
        .map((p) => p.trim())
        .filter(Boolean),
      downloadUrl: extractPlainText(item.fields.downloadUrl) || "#",
      available: item.fields.available,
    }));
  } catch {
    return fallback;
  }
}
