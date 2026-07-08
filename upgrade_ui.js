const fs = require('fs');
const path = require('path');

const dir = 'C:\\AH3 Tools\\Web_archih3\\archih3.com';

function processHtml(filePath) {
    let content = fs.readFileSync(filePath, 'utf8');
    
    // Remove all onclick="alert(...);"
    content = content.replace(/\s*onclick="alert\([^)]+\);\s*return false;"/g, '');
    content = content.replace(/\s*onclick="alert\([^)]+\);"/g, '');
    
    // Add AOS CSS
    if (!content.includes('aos.css')) {
        content = content.replace('</head>', '    <!-- AOS CSS -->\n    <link href="https://unpkg.com/aos@2.3.1/dist/aos.css" rel="stylesheet">\n</head>');
    }
    
    // Add AOS JS
    if (!content.includes('aos.js')) {
        content = content.replace('</body>', '    <!-- AOS JS -->\n    <script src="https://unpkg.com/aos@2.3.1/dist/aos.js"></script>\n    <script>\n        document.addEventListener("DOMContentLoaded", function() {\n            AOS.init({\n                duration: 800,\n                once: true,\n                offset: 100\n            });\n        });\n    </script>\n</body>');
    }
    
    // Add data-aos="fade-up" to interesting elements
    content = content.replace(/(class="product-card(?![^"]*data-aos)[^"]*")/g, '$1 data-aos="fade-up"');
    content = content.replace(/(class="stat-card(?![^"]*data-aos)[^"]*")/g, '$1 data-aos="fade-up"');
    content = content.replace(/(class="feature-card(?![^"]*data-aos)[^"]*")/g, '$1 data-aos="fade-up"');
    content = content.replace(/(class="premium-card-large(?![^"]*data-aos)[^"]*")/g, '$1 data-aos="fade-up"');
    content = content.replace(/(class="workflow-step(?![^"]*data-aos)[^"]*")/g, '$1 data-aos="fade-up"');
    content = content.replace(/(class="price-card(?![^"]*data-aos)[^"]*")/g, '$1 data-aos="fade-up"');
    
    fs.writeFileSync(filePath, content, 'utf8');
    console.log('Processed', filePath);
}

processHtml(path.join(dir, 'index.html'));
processHtml(path.join(dir, 'hub.html'));
