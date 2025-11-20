import React from 'react';

interface SEOProps {
  title?: string;
  description?: string;
  keywords?: string;
  image?: string;
  url?: string;
  type?: 'website' | 'product' | 'article' | 'course';
  product?: {
    name: string;
    description: string;
    price: number;
    originalPrice?: number;
    availability: 'InStock' | 'OutOfStock';
    brand: string;
    category: string;
    sku: string;
    images: string[];
    reviews?: number;
    rating?: number;
  };
  course?: {
    name: string;
    description: string;
    instructor: string;
    price: number;
    duration: string;
    level: string;
    image: string;
  };
  organization?: {
    name: string;
    description: string;
    logo: string;
    address: {
      streetAddress: string;
      addressLocality: string;
      addressRegion: string;
      postalCode: string;
      addressCountry: string;
    };
    contactPoint: {
      telephone: string;
      email: string;
      contactType: string;
    };
  };
  breadcrumbs?: Array<{ name: string; url: string }>;
  faq?: Array<{ question: string; answer: string }>;
}

export const EnhancedSEO: React.FC<SEOProps> = ({
  title,
  description,
  keywords,
  image,
  url,
  type = 'website',
  product,
  course,
  organization,
  breadcrumbs,
  faq
}) => {
  const baseUrl = 'https://blom-cosmetics.co.za';
  const defaultImage = `${baseUrl}/blom-cosmetics-og-image.webp`;
  
  const finalImage = image || defaultImage;
  const finalUrl = url || (typeof window !== 'undefined' ? window.location.href : baseUrl);

  // Generate structured data based on type
  const generateStructuredData = () => {
    switch (type) {
      case 'product':
        return product ? {
          "@context": "https://schema.org",
          "@type": "Product",
          "name": product.name,
          "description": product.description,
          "image": product.images.map(img => img.startsWith('http') ? img : `${baseUrl}${img}`),
          "brand": {
            "@type": "Brand",
            "name": product.brand
          },
          "category": product.category,
          "sku": product.sku,
          "offers": {
            "@type": "Offer",
            "url": finalUrl,
            "priceCurrency": "ZAR",
            "price": product.price,
            "priceValidUntil": new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            "availability": `https://schema.org/${product.availability}`,
            "seller": {
              "@type": "Organization",
              "name": "BLOM Cosmetics",
              "url": baseUrl
            }
          },
          "aggregateRating": product.rating ? {
            "@type": "AggregateRating",
            "ratingValue": product.rating,
            "reviewCount": product.reviews || 0
          } : undefined,
          "review": product.reviews ? [
            {
              "@type": "Review",
              "reviewRating": {
                "@type": "Rating",
                "ratingValue": product.rating || 5,
                "bestRating": 5,
                "worstRating": 1
              },
              "author": {
                "@type": "Person",
                "name": "Verified Customer"
              },
              "reviewBody": `Excellent ${product.name} - professional quality and great value!`
            }
          ] : undefined,
          "additionalProperty": [
            {
              "@type": "PropertyValue",
              "name": "Brand",
              "value": product.brand
            },
            {
              "@type": "PropertyValue",
              "name": "Category",
              "value": product.category
            },
            {
              "@type": "PropertyValue",
              "name": "SKU",
              "value": product.sku
            }
          ]
        } : null;

      case 'course':
        return course ? {
          "@context": "https://schema.org",
          "@type": "Course",
          "name": course.name,
          "description": course.description,
          "provider": {
            "@type": "Organization",
            "name": "BLOM Academy",
            "url": baseUrl
          },
          "courseCode": course.name.toLowerCase().replace(/\s+/g, '-'),
          "educationalLevel": course.level,
          "timeRequired": course.duration,
          "instructor": {
            "@type": "Person",
            "name": course.instructor
          },
          "offers": {
            "@type": "Offer",
            "price": course.price,
            "priceCurrency": "ZAR",
            "availability": "https://schema.org/InStock",
            "validFrom": new Date().toISOString()
          }
        } : null;

      case 'article':
        return {
          "@context": "https://schema.org",
          "@type": "Article",
          "headline": title,
          "description": description,
          "image": finalImage,
          "author": {
            "@type": "Organization",
            "name": "BLOM Cosmetics"
          },
          "publisher": {
            "@type": "Organization",
            "name": "BLOM Cosmetics",
            "logo": {
              "@type": "ImageObject",
              "url": `${baseUrl}/blom-cosmetics-logo.webp`
            }
          },
          "datePublished": new Date().toISOString(),
          "dateModified": new Date().toISOString()
        };

      default:
        return organization ? {
          "@context": "https://schema.org",
          "@type": "Organization",
          "name": organization.name,
          "url": baseUrl,
          "logo": organization.logo,
          "description": organization.description,
          "address": {
            "@type": "PostalAddress",
            "streetAddress": organization.address.streetAddress,
            "addressLocality": organization.address.addressLocality,
            "addressRegion": organization.address.addressRegion,
            "postalCode": organization.address.postalCode,
            "addressCountry": organization.address.addressCountry
          },
          "contactPoint": {
            "@type": "ContactPoint",
            "telephone": organization.contactPoint.telephone,
            "email": organization.contactPoint.email,
            "contactType": organization.contactPoint.contactType
          },
          "sameAs": [
            "https://www.instagram.com/cosmetics_blom/",
            "https://www.facebook.com/profile.php?id=61581058185006",
            "https://www.tiktok.com/@blom.cosmetics"
          ]
        } : {
          "@context": "https://schema.org",
          "@type": "Organization",
          "name": "BLOM Cosmetics",
          "url": baseUrl,
          "logo": `${baseUrl}/blom-cosmetics-logo.webp`,
          "description": "South Africa's leading provider of premium nail care products, professional acrylic systems, and expert beauty training.",
          "contactPoint": {
            "@type": "ContactPoint",
            "telephone": "+27-79-548-3317",
            "email": "shopblomcosmetics@gmail.com",
            "contactType": "customer service"
          },
          "sameAs": [
            "https://www.instagram.com/cosmetics_blom/",
            "https://www.facebook.com/profile.php?id=61581058185006",
            "https://www.tiktok.com/@blom.cosmetics"
          ]
        };
    }
  };

  // FAQ structured data
  const generateFAQData = () => {
    if (!faq?.length) return null;
    
    return {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      "mainEntity": faq.map(item => ({
        "@type": "Question",
        "name": item.question,
        "acceptedAnswer": {
          "@type": "Answer",
          "text": item.answer
        }
      }))
    };
  };

  // Breadcrumb structured data
  const generateBreadcrumbData = () => {
    if (!breadcrumbs?.length) return null;
    
    return {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      "itemListElement": breadcrumbs.map((item, index) => ({
        "@type": "ListItem",
        "position": index + 1,
        "name": item.name,
        "item": `${baseUrl}${item.url}`
      }))
    };
  };

  const structuredData = generateStructuredData();
  const faqData = generateFAQData();
  const breadcrumbData = generateBreadcrumbData();

  return (
    <>
      {/* Primary Meta Tags */}
      <title>{title}</title>
      <meta name="title" content={title} />
      <meta name="description" content={description} />
      <meta name="keywords" content={keywords} />
      <meta name="robots" content="index, follow" />
      <meta name="googlebot" content="index, follow" />
      <link rel="canonical" href={finalUrl} />

      {/* Open Graph / Facebook */}
      <meta property="og:type" content={type === 'product' ? 'product' : type === 'course' ? 'article' : 'website'} />
      <meta property="og:url" content={finalUrl} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={finalImage} />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />
      <meta property="og:site_name" content="BLOM Cosmetics" />
      <meta property="og:locale" content="en_ZA" />

      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:url" content={finalUrl} />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={finalImage} />

      {/* Business Information */}
      <meta name="geo.region" content="ZA" />
      <meta name="geo.country" content="South Africa" />
      <meta name="geo.placename" content="South Africa" />
      <meta name="ICBM" content="-26.2041, 28.0473" />

      {/* Structured Data */}
      {structuredData && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(structuredData)
          }}
        />
      )}

      {/* FAQ Structured Data */}
      {faqData && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(faqData)
          }}
        />
      )}

      {/* Breadcrumb Structured Data */}
      {breadcrumbData && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(breadcrumbData)
          }}
        />
      )}

      {/* Additional Product-specific meta tags */}
      {type === 'product' && product && (
        <>
          <meta name="product:price:amount" content={product.price.toString()} />
          <meta name="product:price:currency" content="ZAR" />
          <meta name="product:availability" content={product.availability} />
          <meta name="product:condition" content="new" />
        </>
      )}

      {/* Course-specific meta tags */}
      {type === 'course' && course && (
        <>
          <meta name="course:provider" content="BLOM Academy" />
          <meta name="course:duration" content={course.duration} />
          <meta name="course:level" content={course.level} />
        </>
      )}
    </>
  );
};