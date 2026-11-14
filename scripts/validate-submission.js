const fs = require('node:fs');
const path = require('node:path');
const dir = 'submissions';
const files = fs.existsSync(dir) ? fs.readdirSync(dir).filter(f => f.endsWith('.json')) : [];
if (files.length !== 1) throw new Error('El PR debe contener exactamente un JSON dentro de submissions/.');
const file = path.join(dir, files[0]);
const item = JSON.parse(fs.readFileSync(file, 'utf8'));
const required = ['name','author','description','browsers','version','category','download_url'];
for (const key of required) if (item[key] === undefined || item[key] === null || item[key] === '') throw new Error('Falta el campo obligatorio: ' + key);
for (const key of ['name','author','description','version','category']) {
  if (typeof item[key] !== 'string' || item[key].length > (key === 'description' ? 1000 : 120)) throw new Error('Campo inválido: ' + key);
}
if (!Array.isArray(item.browsers) || !item.browsers.length || item.browsers.some(x => !['Firefox','Chrome','Edge','Other'].includes(x))) throw new Error('browsers debe contener Firefox, Chrome, Edge y/o Other.');
for (const key of ['download_url','website_url','source_url']) {
  if (!item[key]) continue;
  let u; try { u = new URL(item[key]); } catch { throw new Error('URL inválida: ' + key); }
  if (!['https:','http:'].includes(u.protocol)) throw new Error('Solo se permiten URLs HTTP(S): ' + key);
}
for (const key of ['permissions','screenshots']) if (item[key] !== undefined && !Array.isArray(item[key])) throw new Error(key + ' debe ser una lista.');
console.log('Validación correcta. Estado: pending; falta revisión de un administrador.');