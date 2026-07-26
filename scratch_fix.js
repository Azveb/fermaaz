const fs = require('fs');

['messages/az.json', 'messages/en.json', 'messages/ru.json'].forEach(file => {
  if (fs.existsSync(file)) {
    let content = fs.readFileSync(file, 'utf8');
    // Strip single line comments
    content = content.replace(/\/\/.*$/gm, '');
    try {
      let obj = JSON.parse(content);
      fs.writeFileSync(file, JSON.stringify(obj, null, 2));
      console.log(`Fixed ${file}`);
    } catch (e) {
      console.error(`Failed to parse ${file} after stripping comments:`, e.message);
    }
  }
});
