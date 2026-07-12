import { Helmet } from "react-helmet-async";

export default function SEO({
    title = "KAMIGAMI | Premium Anime Clothing",
    description = "Discover premium anime-inspired oversized t-shirts, hoodies and apparel from KAMIGAMI.",
    keywords = "anime clothing, anime t shirts, oversized tshirts, anime hoodies, kamigami",
    url = "https://kamigami.in",
    image = "https://kamigami.in/logo.png",
}) {
    return (
        <Helmet>
            <title>{title}</title>

            <meta name="description" content={description} />
            <meta name="keywords" content={keywords} />
            <meta name="author" content="KAMIGAMI" />
            <meta name="robots" content="index,follow" />
            <meta name="theme-color" content="#0d0d0d" />

            <link rel="canonical" href={url} />

            {/* Open Graph */}
            <meta property="og:type" content="website" />
            <meta property="og:title" content={title} />
            <meta property="og:description" content={description} />
            <meta property="og:image" content={image} />
            <meta property="og:url" content={url} />
            <meta property="og:site_name" content="KAMIGAMI" />

            {/* Twitter */}
            <meta name="twitter:card" content="summary_large_image" />
            <meta name="twitter:title" content={title} />
            <meta name="twitter:description" content={description} />
            <meta name="twitter:image" content={image} />


            <script type="application/ld+json">
                {JSON.stringify({
                    "@context": "https://schema.org",
                    "@type": "WebSite",
                    name: "KAMIGAMI",
                    url: "https://kamigami.in",
                    potentialAction: {
                        "@type": "SearchAction",
                        target: "https://kamigami.in/shop?search={search_term_string}",
                        "query-input": "required name=search_term_string"
                    }
                })}
            </script>
            <script type="application/ld+json">
                {JSON.stringify({
                    "@context": "https://schema.org",
                    "@type": "Organization",
                    name: "KAMIGAMI",
                    url: "https://kamigami.in",
                    logo: "https://kamigami.in/logo.png",
                    sameAs: [
                        "https://instagram.com/kamigami.in",
                        "https://facebook.com/kamigami.in"
                    ]
                })}
            </script>
        </Helmet>
    );
}