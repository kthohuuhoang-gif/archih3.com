// Language is determined by the URL: /en/... pages are English, the rest Vietnamese.
// The VI/EN toggle navigates between the two URL versions so each language has
// crawlable pages; data-vi/data-en swapping remains as the rendering mechanism.
var pageLang = (location.pathname === '/en' || location.pathname.indexOf('/en/') === 0) ? 'en' : 'vi';
var currentLang = pageLang;

function counterpartURL(lang) {
    var p = location.pathname;
    if (lang === 'en') {
        return '/en' + (p === '/' ? '/' : p) + location.hash;
    }
    var stripped = p.replace(/^\/en(\/|$)/, '/');
    return stripped + location.hash;
}

function applyLang(lang) {
    currentLang = lang;
    document.documentElement.lang = lang;

    // Toggle active state for all lang buttons on the page
    document.querySelectorAll('.lang-toggle button').forEach(function (btn) {
        btn.classList.toggle('active', btn.textContent === lang.toUpperCase());
    });

    // Replace text content based on data-attributes
    document.querySelectorAll('[data-' + lang + ']').forEach(function (el) {
        var text = el.getAttribute('data-' + lang);
        if (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA') {
            el.placeholder = text;
        } else {
            el.innerHTML = text;
        }
    });
}

function setLang(lang) {
    localStorage.setItem('lang', lang);
    if (lang !== pageLang) {
        location.href = counterpartURL(lang);
        return;
    }
    applyLang(lang);
}

// Apply the URL's language when the page loads (fixes toggle state on /en/ pages)
window.addEventListener('DOMContentLoaded', function () {
    applyLang(pageLang);
});
