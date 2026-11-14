const fs = require('node:fs');
const { execFileSync } = require('node:child_process');
const crypto = require('node:crypto');
const api = 'https://api.github.com';
const token = process.env.GH_TOKEN;
const repo = process.env.REPOSITORY;
const pr = process.env.PR_NUMBER;
if (!token || !repo || !pr) throw new Error('Missing GitHub environment variables.');
async function gh(endpoint) {
  const r = await fetch(api + endpoint, { headers: { Authorization: 'Bearer ' + token, Accept: 'application/vnd.github+json', 'X-GitHub-Api-Version': '2022-11-28' } });
  if (!r.ok) throw new Error('GitHub API error ' + r.status + ': ' + await r.text());
  return r.json();
}
(async () => {
  const pull = await gh('/repos/' + repo + '/pulls/' + pr);
  if (pull.base.ref !== 'main' || pull.state !== 'open') throw new Error('El PR debe estar abierto contra main.');
  const files = await gh('/repos/' + repo + '/pulls/' + pr + '/files?per_page=100');
  const changed = files.filter(f => f.status === 'added' && /^submissions\/[a-z0-9][a-z0-9-]*\.json$/i.test(f.filename));
  if (changed.length !== 1 || files.length !== 1) throw new Error('El PR debe añadir exactamente un JSON en submissions/ y no modificar otros archivos.');
  const raw = await fetch('https://raw.githubusercontent.com/' + pull.head.repo.full_name + '/' + pull.head.sha + '/' + changed[0].filename);
  if (!raw.ok) throw new Error('No se pudo obtener el JSON del PR.');
  const item = await raw.json();
  const required = ['name','author','description','browsers','version','category','download_url'];
  for (const k of required) if (item[k] === undefined || item[k] === null || item[k] === '') throw new Error('Falta: ' + k);
  if (typeof item.name !== 'string' || item.name.length > 120 || typeof item.author !== 'string' || item.author.length > 120 || typeof item.description !== 'string' || item.description.length > 1000) throw new Error('Campos de texto inválidos.');
  if (!Array.isArray(item.browsers) || !item.browsers.length || item.browsers.some(x => !['Firefox','Chrome','Edge','Other'].includes(x))) throw new Error('Navegadores inválidos.');
  for (const k of ['download_url','website_url','source_url']) if (item[k]) { const u = new URL(item[k]); if (!['https:','http:'].includes(u.protocol)) throw new Error('URL no permitida: ' + k); }
  const db = JSON.parse(fs.readFileSync('database.json','utf8'));
  if (!Array.isArray(db.extensions)) throw new Error('database.json inválido.');
  const duplicate = db.extensions.some(x => x.name.toLowerCase() === item.name.toLowerCase() || x.download_url === item.download_url);
  if (duplicate) throw new Error('Ya existe una extensión con ese nombre o URL de descarga.');
  const id = crypto.randomUUID();
  const entry = { id, ...item, status: 'verified', verified_at: new Date().toISOString(), pull_request: Number(pr) };
  db.extensions.push(entry);
  fs.writeFileSync('database.json', JSON.stringify(db, null, 2) + '\n');
  fs.mkdirSync('extensions', { recursive: true });
  fs.writeFileSync('extensions/' + id + '.json', JSON.stringify(entry, null, 2) + '\n');
  console.log('Publicado ' + item.name + ' con ID ' + id);
})().catch(e => { console.error(e); process.exit(1); });