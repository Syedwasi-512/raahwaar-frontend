import React from "react";
import { Helmet } from "react-helmet-async";

const SEO = ({ title, description, image, url }) => {
  const siteName = "Raahwaar.pk";
  const fullTitle = `Buy ${title} Shoes Online in Pakistan | ${siteName}`;
  const defaultDesc =
    "Pakistan's most trusted store for premium imported footwear and thrift items.";

  const shareImage = image || "https://your-vercel-link.app/default-logo.png";
  const fullUrl = url || window.location.href;

  const siteUrl = "https://raahwaar-pk.vercel.app";
  return (
    <Helmet>
      {/* Standard SEO */}
      <title>{fullTitle}</title>
      <meta name="description" content={description || defaultDesc} />

      {/* Open Graph (Facebook, WhatsApp, Instagram) */}
      <meta property="og:type" content="product" />
      <meta property="og:site_name" content={siteName} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description || defaultDesc} />
      <meta property="og:image" content={shareImage} />
      <meta property="og:url" content={fullUrl} />

      {/* Twitter Cards */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description || defaultDesc} />
      <meta name="twitter:image" content={shareImage} />

      {/* WhatsApp Specific (Security & Optimization) */}
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />
    </Helmet>
  );
};

export default React.memo(SEO);
