import { MetadataRoute } from "next";
import { api } from "@/services/api";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://chainestate.com";

  // Base static routes
  const routes = ["", "/faq", "/cookie-policy", "/login", "/register"].map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: "daily" as const,
    priority: route === "" ? 1.0 : 0.8,
  }));

  // Dynamic property pages (fetched from database via API)
  let propertyRoutes: MetadataRoute.Sitemap = [];
  try {
    const properties = await api.getProperties();
    propertyRoutes = properties.map((property) => ({
      url: `${baseUrl}/property/${property.id}`,
      lastModified: new Date(property.createdAt || new Date()),
      changeFrequency: "weekly" as const,
      priority: 0.9,
    }));
  } catch (error) {
    console.warn("Sitemap generation: Could not fetch dynamic properties, using static fallback routes.", error);
  }

  return [...routes, ...propertyRoutes];
}
