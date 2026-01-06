import React from "react";
import { Helmet } from "react-helmet-async";

const SEO = ({ title, description, image, url, type = "website" }) => {
  const siteName = "Raahwaar.pk";
  const fullTitle = `Buy ${title} Shoes Online in Pakistan | ${siteName}`;
  const defaultDes =
    "Pakistan's most trusted store for premium imported footwear and thrift items.";

  return (
    <Helmet>
      <title>{fullTitle}</title>
      <meta name="description" content={description || defaultDes} />
      <link rel="stylesheet" href={url || window.location.href} />
      {/* Open Graph / Facebook (Social Media Preview) */}
      <meta property="og:type" content={type} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description || defaultDes} />
      <meta property="og:image" content={image || "logo.png"} />
      <meta property="og:url" content={window.location.href} />
      <meta property="og:site_name" content={siteName} />

      {/* Twitter Card */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description || defaultDes} />
      <meta name="twitter:image" content={image || "/logo.png"} />
    </Helmet>
  );
};

export default React.memo(SEO);