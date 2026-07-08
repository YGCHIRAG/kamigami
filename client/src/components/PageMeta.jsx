import React from "react";
import { Helmet } from "react-helmet-async";

/**
 * Reusable SEO component to handle document head elements like titles and meta tags.
 * 
 * @param {Object} props
 * @param {string} props.title - The specific title of the page.
 * @param {string} [props.description] - Meta description for SEO (140-160 chars).
 * @param {string} [props.keywords] - Meta keywords for SEO.
 * @param {string} [props.image] - Custom image URL for social media cards.
 * @param {string} [props.canonicalPath] - Custom path for the canonical URL link.
 */
const PageMeta = ({ title, description, keywords, image, canonicalPath }) => {
  const defaultTitle = "Kamigami | Japanese Streetwear & Luxury Fashion";
  const formattedTitle = title ? `${title} | Kamigami` : defaultTitle;

  const defaultDescription = 
    "Kamigami is a premium Japanese streetwear and luxury fashion brand. Explore our exclusive collections of graphic hoodies, tees, and high-fashion apparel.";
  
  const defaultKeywords = 
    "kamigami, Japanese streetwear, luxury fashion, graphic hoodies, oversized tees, streetwear brand, premium apparel, street style";

  const siteUrl = "https://kamigami.in";
  const canonicalUrl = `${siteUrl}${canonicalPath || (typeof window !== "undefined" ? window.location.pathname : "")}`;

  return (
    <Helmet>
      {/* Title */}
      <title>{formattedTitle}</title>

      {/* Meta Tags */}
      <meta name="description" content={description || defaultDescription} />
      <meta name="keywords" content={keywords || defaultKeywords} />

      {/* Canonical URL */}
      <link rel="canonical" href={canonicalUrl} />

      {/* Open Graph / Facebook */}
      <meta property="og:type" content="website" />
      <meta property="og:title" content={formattedTitle} />
      <meta property="og:description" content={description || defaultDescription} />
      <meta property="og:image" content={image || "/banner.jpg"} />
      <meta property="og:url" content={canonicalUrl} />

      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={formattedTitle} />
      <meta name="twitter:description" content={description || defaultDescription} />
      <meta name="twitter:image" content={image || "/banner.jpg"} />
    </Helmet>
  );
};

export default PageMeta;
