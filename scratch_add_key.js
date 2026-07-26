const fs = require('fs');

const data = {
  'messages/az.json': 'Kampaniyalar',
  'messages/en.json': 'Campaigns',
  'messages/ru.json': 'Кампании'
};

Object.entries(data).forEach(([file, value]) => {
  if (fs.existsSync(file)) {
    const obj = JSON.parse(fs.readFileSync(file, 'utf8'));
    obj['campaigns'] = value;
    fs.writeFileSync(file, JSON.stringify(obj, null, 2));
    console.log(`Added campaigns to ${file}`);
  }
});
