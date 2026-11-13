#!/bin/sh
set -eu
cd "$(dirname "$0")"
mkdir -p dist/assets dist/design/kiwi-loader dist/design/varyfont
node site-pages.cjs
cp manifest.webmanifest robots.txt sitemap.xml llms.txt credits.txt dist/
cp site.css site.js pointer-fluid.js orbital.js forms.css forms.js dist/
cp -R assets/. dist/assets/
cp design/phil-logo-kiwi.svg design/phil-logo-text.svg dist/design/
cp design/kiwi-loader/lottie-light.min.js design/kiwi-loader/kiwi-loader.js design/kiwi-loader/LOTTIE-LICENSE.md dist/design/kiwi-loader/
cp 'design/varyfont/Vary Regular.woff' 'design/varyfont/Vary Medium.woff' dist/design/varyfont/
