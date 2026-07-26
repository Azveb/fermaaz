const fs = require('fs');
const path = require('path');

const srcDir = path.join(__dirname, 'src');
const appDir = path.join(srcDir, 'app');
const localeDir = path.join(appDir, '[locale]');
const messagesDir = path.join(__dirname, 'messages');
const i18nDir = path.join(srcDir, 'i18n');

// 1. Create Directories
if (!fs.existsSync(localeDir)) fs.mkdirSync(localeDir, { recursive: true });
if (!fs.existsSync(messagesDir)) fs.mkdirSync(messagesDir, { recursive: true });
if (!fs.existsSync(i18nDir)) fs.mkdirSync(i18nDir, { recursive: true });

// 2. Extract and create messages
const i18nLibPath = path.join(srcDir, 'lib', 'i18n.js');
if (fs.existsSync(i18nLibPath)) {
  const content = fs.readFileSync(i18nLibPath, 'utf8');
  // Hacky extraction since we know the structure
  const azMatch = content.match(/az:\s*({[\s\S]*?}),\s*en:/);
  const enMatch = content.match(/en:\s*({[\s\S]*?}),\s*ru:/);
  const ruMatch = content.match(/ru:\s*({[\s\S]*?})\s*};/);

  if (azMatch) {
    const azStr = azMatch[1].replace(/([a-zA-Z0-9_]+):/g, '"$1":').replace(/'/g, '"').replace(/,(\s*})/g, '$1');
    fs.writeFileSync(path.join(messagesDir, 'az.json'), azStr);
  }
  if (enMatch) {
    const enStr = enMatch[1].replace(/([a-zA-Z0-9_]+):/g, '"$1":').replace(/'/g, '"').replace(/,(\s*})/g, '$1');
    fs.writeFileSync(path.join(messagesDir, 'en.json'), enStr);
  }
  if (ruMatch) {
    const ruStr = ruMatch[1].replace(/([a-zA-Z0-9_]+):/g, '"$1":').replace(/'/g, '"').replace(/,(\s*})/g, '$1');
    fs.writeFileSync(path.join(messagesDir, 'ru.json'), ruStr);
  }
}

// 3. Create routing.js
fs.writeFileSync(path.join(i18nDir, 'routing.js'), `
import {defineRouting} from 'next-intl/routing';
import {createNavigation} from 'next-intl/navigation';

export const routing = defineRouting({
  locales: ['az', 'en', 'ru'],
  defaultLocale: 'az'
});

export const {Link, redirect, usePathname, useRouter} = createNavigation(routing);
`);

// 4. Create request.js
fs.writeFileSync(path.join(i18nDir, 'request.js'), `
import {getRequestConfig} from 'next-intl/server';
import {routing} from './routing';

export default getRequestConfig(async ({requestLocale}) => {
  let locale = await requestLocale;
  if (!locale || !routing.locales.includes(locale)) {
    locale = routing.defaultLocale;
  }
  return {
    locale,
    messages: (await import(\`../../messages/\${locale}.json\`)).default
  };
});
`);

// 5. Create middleware.js
fs.writeFileSync(path.join(srcDir, 'middleware.js'), `
import createMiddleware from 'next-intl/middleware';
import {routing} from './i18n/routing';

export default createMiddleware(routing);

export const config = {
  matcher: ['/', '/(az|en|ru)/:path*']
};
`);

// 6. Move App Router contents
const appItems = fs.readdirSync(appDir);
for (const item of appItems) {
  if (item === '[locale]' || item === 'api' || item === 'globals.css') continue;
  const oldPath = path.join(appDir, item);
  const newPath = path.join(localeDir, item);
  fs.renameSync(oldPath, newPath);
}

// 7. Update next.config.mjs
const nextConfigPath = path.join(__dirname, 'next.config.mjs');
if (fs.existsSync(nextConfigPath)) {
  let conf = fs.readFileSync(nextConfigPath, 'utf8');
  if (!conf.includes('next-intl')) {
    conf = `import createNextIntlPlugin from 'next-intl/plugin';\nconst withNextIntl = createNextIntlPlugin();\n\n` + conf;
    conf = conf.replace('export default nextConfig;', 'export default withNextIntl(nextConfig);');
    fs.writeFileSync(nextConfigPath, conf);
  }
}

// 8. Replace next/link and next/navigation globally
function replaceInDir(dir) {
  const items = fs.readdirSync(dir);
  for (const item of items) {
    const fullPath = path.join(dir, item);
    if (fs.statSync(fullPath).isDirectory()) {
      replaceInDir(fullPath);
    } else if (fullPath.endsWith('.js') || fullPath.endsWith('.jsx')) {
      let code = fs.readFileSync(fullPath, 'utf8');
      let changed = false;
      
      if (code.includes('next/link')) {
        code = code.replace(/import Link from ["']next\/link["'];?/g, 'import { Link } from "@/i18n/routing";');
        changed = true;
      }
      if (code.includes('next/navigation')) {
        if (code.includes('useRouter')) {
          code = code.replace(/import \{.*?useRouter.*?\} from ["']next\/navigation["'];?/g, (match) => {
            // we remove useRouter from next/navigation and add it to our own import
            let rest = match.replace(/useRouter,?\s*/, '');
            if (rest.includes('{ }') || rest.includes('{}')) {
               return 'import { useRouter } from "@/i18n/routing";';
            }
            return rest + '\nimport { useRouter } from "@/i18n/routing";';
          });
          changed = true;
        }
      }
      
      if (changed) {
        fs.writeFileSync(fullPath, code);
      }
    }
  }
}

replaceInDir(srcDir);

console.log("Migration script complete!");
