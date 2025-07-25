// Performance Optimization for CanadaAccountants

(function() {
    // Preload critical resources
    const preloadLinks = [
        { href: 'https://fonts.googleapis.com', rel: 'preconnect' },
        { href: 'https://www.google-analytics.com', rel: 'dns-prefetch' },
        { href: 'https://www.googletagmanager.com', rel: 'dns-prefetch' }
    ];
    
    preloadLinks.forEach(link => {
        const linkElement = document.createElement('link');
        linkElement.rel = link.rel;
        linkElement.href = link.href;
        if (link.rel === 'preconnect') linkElement.crossOrigin = 'anonymous';
        document.head.appendChild(linkElement);
    });
    
    // Lazy load images and optimize scrolling
    if ('IntersectionObserver' in window) {
        const imageObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    if (img.dataset.src) {
                        img.src = img.dataset.src;
                        img.classList.remove('lazy');
                        imageObserver.unobserve(img);
                    }
                }
            });
        });
        
        document.querySelectorAll('img[data-src]').forEach(img => {
            imageObserver.observe(img);
        });
    }
    
    // Critical CSS inlining optimization
    const criticalCSS = `
        .hero { background: linear-gradient(135deg, #FF0000 0%, #0066CC 100%); }
        .header { background: linear-gradient(135deg, #FF0000 0%, #0066CC 100%); position: fixed; z-index: 1000; }
        .cta-button { background: white; color: #FF0000; padding: 0.75rem 1.5rem; border-radius: 25px; }
    `;
    
    // Minimize layout shift
    document.documentElement.style.scrollBehavior = 'smooth';
    
    // Performance monitoring
    if ('performance' in window && 'navigation' in performance) {
        window.addEventListener('load', () => {
            setTimeout(() => {
                const perfData = performance.getEntriesByType('navigation')[0];
                if (perfData && typeof gtag !== 'undefined') {
                    gtag('event', 'page_load_time', {
                        event_category: 'performance',
                        event_label: 'Page Load Speed',
                        value: Math.round(perfData.loadEventEnd - perfData.loadEventStart)
                    });
                }
            }, 1000);
        });
    }
    
    console.log('⚡ Performance optimizations loaded');
})();
