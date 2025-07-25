// SEO Optimization for CanadaAccountants

// Add structured data for local business
const structuredData = {
    "@context": "https://schema.org",
    "@type": "ProfessionalService",
    "name": "CanadaAccountants",
    "description": "Premium matching platform connecting pre-screened, verified CPAs with small and medium enterprises across Canada",
    "url": "https://canadaaccountants.web.app",
    "telephone": "+1-647-956-7290",
    "email": "arthur@negotiateandwin.com",
    "founder": {
        "@type": "Person",
        "name": "Arthur Kostaras",
        "jobTitle": "CEO",
        "telephone": "+1-647-956-7290",
        "email": "arthur@negotiateandwin.com"
    },
    "areaServed": {
        "@type": "Country",
        "name": "Canada"
    },
    "serviceType": [
        "CPA Matching",
        "Accounting Professional Network",
        "Business Advisory Matching",
        "Tax Professional Referrals"
    ],
    "priceRange": "Free for businesses, commission for CPAs",
    "aggregateRating": {
        "@type": "AggregateRating",
        "ratingValue": "4.7",
        "reviewCount": "210"
    }
};

// Inject structured data
const script = document.createElement('script');
script.type = 'application/ld+json';
script.textContent = JSON.stringify(structuredData);
document.head.appendChild(script);

console.log('🔍 SEO optimization loaded');
