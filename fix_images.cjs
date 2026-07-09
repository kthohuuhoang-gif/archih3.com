const fs = require('fs');
const path = require('path');

function walkDir(dir, callback) {
    fs.readdirSync(dir).forEach(f => {
        let dirPath = path.join(dir, f);
        let isDirectory = fs.statSync(dirPath).isDirectory();
        isDirectory ? walkDir(dirPath, callback) : callback(path.join(dir, f));
    });
}

walkDir('src/pages', function(filePath) {
    if (!filePath.endsWith('.astro')) return;
    
    let content = fs.readFileSync(filePath, 'utf8');
    
    let newContent = content.replace(/src="(?!\/|http)([^"]+\.(?:png|jpg|webp))"/g, 'src="/$1"');
    
    if (content !== newContent) {
        fs.writeFileSync(filePath, newContent);
        console.log(`Fixed images in ${filePath}`);
    }
});
