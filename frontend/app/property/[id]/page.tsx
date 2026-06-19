import type { Metadata } from "next";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { PropertyDetailsClient } from "./property-details-client";
import { api } from "@/services/api";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://chainestate.com";

  try {
    const property = await api.getProperty(id);
    if (!property) {
      return {
        title: "Property Not Found | ChainEstate",
        description: "Verified blockchain property ownership. View property details, ownership verification, location, and agent information.",
      };
    }

    const title = `${property.title} | ChainEstate`;
    const description = `Verified blockchain property ownership. View property details for ${property.title} in ${property.location.city}, ownership verification, location, and agent information.`;

    return {
      title,
      description,
      alternates: {
        canonical: `${baseUrl}/property/${id}`,
      },
      openGraph: {
        title,
        description,
        url: `${baseUrl}/property/${id}`,
        type: "website",
        images: property.images.map((img) => ({
          url: img,
          alt: property.title,
        })),
      },
      twitter: {
        card: "summary_large_image",
        title,
        description,
        images: property.images.slice(0, 1),
      },
    };
  } catch (error) {
    return {
      title: "Property Details | ChainEstate",
      description: "Verified blockchain property ownership. View property details, ownership verification, location, and agent information.",
    };
  }
}

export default async function PropertyPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  let property = null;

  try {
    property = await api.getProperty(id);
  } catch (error) {
    console.warn("Failed to fetch property details on server", error);
  }

  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://chainestate.com";

  // Structured Data (JSON-LD)
  let jsonLdListing = null;
  let jsonLdResidence = null;
  let jsonLdAgent = null;

  if (property) {
    jsonLdListing = {
      "@context": "https://schema.org",
      "@type": "RealEstateListing",
      "name": property.title,
      "description": property.description,
      "datePosted": property.createdAt,
      "price": property.price,
      "priceCurrency": property.currency || "USD",
      "url": `${baseUrl}/property/${property.id}`,
      "image": property.images,
      "offers": {
        "@type": "Offer",
        "price": property.price,
        "priceCurrency": property.currency || "USD",
        "availability": "https://schema.org/InStock",
        "validFrom": property.createdAt,
      },
    };

    jsonLdResidence = {
      "@context": "https://schema.org",
      "@type": "Residence",
      "name": property.title,
      "description": property.description,
      "address": {
        "@type": "PostalAddress",
        "streetAddress": property.location.address,
        "addressLocality": property.location.city,
        "addressCountry": property.location.country,
      },
      "geo": {
        "@type": "GeoCoordinates",
        "latitude": property.location.lat,
        "longitude": property.location.lng,
      },
      "numberOfBedrooms": property.bedrooms,
      "numberOfBathroomsTotal": property.bathrooms,
      "floorSize": {
        "@type": "QuantitativeValue",
        "value": property.area,
        "unitCode": "FTK",
      },
    };

    if (property.agentWallet) {
      jsonLdAgent = {
        "@context": "https://schema.org",
        "@type": "Person",
        "name": `ChainEstate Verified Agent #${property.agentId || "991"}`,
        "description": "Authorized blockchain agent representing verified real estate properties.",
        "identifier": property.agentWallet,
        "jobTitle": "Real Estate Agent",
      };
    }
  }

  return (
    <div className="flex min-h-screen flex-col">
      {jsonLdListing && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdListing) }}
        />
      )}
      {jsonLdResidence && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdResidence) }}
        />
      )}
      {jsonLdAgent && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdAgent) }}
        />
      )}
      <Navbar />
      <main className="flex-1">
        <PropertyDetailsClient id={id} initialData={property} />
      </main>
      <Footer />
    </div>
  );
}
