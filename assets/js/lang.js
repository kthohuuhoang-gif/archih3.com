let currentLang = localStorage.getItem('lang') || 'vi';

function setLang(lang) {
    currentLang = lang;
    localStorage.setItem('lang', lang);
    document.documentElement.lang = lang;
    
    // Toggle active state for all lang buttons on the page
    document.querySelectorAll('.lang-toggle button').forEach(btn => {
        btn.classList.toggle('active', btn.textContent === lang.toUpperCase());
    });
    
    // Replace text content based on data-attributes
    document.querySelectorAll('[data-' + lang + ']').forEach(el => {
        const text = el.getAttribute('data-' + lang);
        if (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA') {
            el.placeholder = text;
        } else {
            el.innerHTML = text;
        }
    });
}

// Automatically apply the saved or default language when the page loads
window.addEventListener('DOMContentLoaded', () => {
    setLang(currentLang);
});
