const fs = require('fs');
const path = require('path');
const dir = 'C:\\AH3 Tools\\Web_archih3\\archih3.com';
const treePath = path.join(dir, 'tree.html');
let content = fs.readFileSync(treePath, 'utf8');

content = content.replace(/viewBox="0 0 400 400"/, 'viewBox="0 -50 400 450"');

fs.writeFileSync(treePath, content, 'utf8');
console.log('Fixed SVG ViewBox overflow');
