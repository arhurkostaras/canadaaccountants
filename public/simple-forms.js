// Simple form handling for immediate use

function showCPAForm() {
    // For now, direct to phone call with analytics
    gtag('event', 'cpa_form_interest', {
        event_category: 'conversion',
        event_label: 'CPA Wants to Apply',
        value: 25
    });
    
    if (confirm('Ready to apply as a CPA? Click OK to call Arthur directly at 647.956.7290, or Cancel to email instead.')) {
        window.location.href = 'tel:6479567290';
    } else {
        window.location.href = 'mailto:arthur@negotiateandwin.com?subject=CPA Application Interest&body=Hi Arthur, I am interested in applying to join the CanadaAccountants CPA network. Please contact me to discuss the application process.';
    }
}

function showBusinessForm() {
    // For now, direct to phone call with analytics
    gtag('event', 'business_form_interest', {
        event_category: 'conversion',
        event_label: 'Business Wants CPA',
        value: 30
    });
    
    if (confirm('Ready to find your perfect CPA? Click OK to call Arthur directly at 647.956.7290, or Cancel to email instead.')) {
        window.location.href = 'tel:6479567290';
    } else {
        window.location.href = 'mailto:arthur@negotiateandwin.com?subject=Business Seeking CPA&body=Hi Arthur, I am interested in finding a CPA through CanadaAccountants. Please contact me to discuss my business needs.';
    }
}

// Add event listeners when page loads
document.addEventListener('DOMContentLoaded', function() {
    // Add CPA application button to header if it doesn't exist
    const header = document.querySelector('.cta-button');
    if (header && !document.querySelector('[onclick*="showCPAForm"]')) {
        const cpaButton = document.createElement('a');
        cpaButton.href = 'javascript:showCPAForm()';
        cpaButton.className = 'cta-button';
        cpaButton.style.marginLeft = '1rem';
        cpaButton.style.backgroundColor = '#28a745';
        cpaButton.textContent = 'Apply as CPA';
        header.parentNode.appendChild(cpaButton);
    }
});
