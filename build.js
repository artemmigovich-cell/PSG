#!/usr/bin/env node
/*
 * Generates services/<slug>.html for every entry in services-data.json
 * from the services/_template.html template. Run `node build.js` after
 * editing services-data.json — this is the single source of truth for
 * service page content, so pages never drift out of sync with each other.
 */
const fs = require('fs');
const path = require('path');

const root = __dirname;
const dataPath = path.join(root, 'services-data.json');
const templatePath = path.join(root, 'services', '_template.html');
const outDir = path.join(root, 'services');

const services = JSON.parse(fs.readFileSync(dataPath, 'utf8'));
const template = fs.readFileSync(templatePath, 'utf8');

function renderFeatures(features) {
  return features
    .map(
      (f, i) => `        <div class="feature-row">
          <div class="num">${String(i + 1).padStart(2, '0')}</div>
          <div><h4>${f.title}</h4><p>${f.desc}</p></div>
        </div>`
    )
    .join('\n');
}

function renderRelated(service) {
  return services
    .filter((s) => s.slug !== service.slug)
    .slice(0, 4)
    .map(
      (s) => `        <div class="card">
          <div class="card-media"><img src="../assets/img/photos/${s.image}.jpg" alt="${s.title}" loading="lazy"></div>
          <h3 style="font-size:1rem;">${s.title}</h3>
          <p style="font-size:.9rem;">${s.lead}</p>
          <a class="card-link" href="${s.slug}.html">Learn More &rarr;</a>
        </div>`
    )
    .join('\n');
}

for (const service of services) {
  const metaDescription = `${service.title} from Protective Security Group — ${service.lead}`;
  const html = template
    .replaceAll('{{TITLE}}', service.title)
    .replaceAll('{{IMAGE}}', service.image)
    .replaceAll('{{LEAD}}', service.lead)
    .replaceAll('{{META_DESCRIPTION}}', metaDescription)
    .replaceAll('{{FEATURES}}', renderFeatures(service.features))
    .replaceAll('{{RELATED}}', renderRelated(service));

  fs.writeFileSync(path.join(outDir, `${service.slug}.html`), html);
  console.log('generated services/%s.html', service.slug);
}
