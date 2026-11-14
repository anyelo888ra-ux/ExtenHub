const token = process.env.GITHUB_TOKEN;
const repo = process.env.GITHUB_REPOSITORY;
const pr = process.env.PR_NUMBER;
if (!token || !repo || !pr) throw new Error('Faltan variables de GitHub Actions.');
async function api(path) {
  const r = await fetch('https://api.github.com' + path, { headers: { Authorization: 'Bearer ' + token, Accept: 'application/vnd.github+json', 'X-GitHub-Api-Version': '2022-11-28' } });
  if (!r.ok) throw new Error('GitHub API ' + r.status + ': ' + await r.text());
  return r.json();
}
(async () => {
  const pull = await api('/repos/' + repo + '/pulls/' + pr);
  const files = await api('/repos/' + repo + '/pulls/' + pr + '/files?per_page=100');
  const changed = files.filter(f => f.status === 'added' && /^submissions\/[a-z0-9][a-z0-9-]*\.json$/i.test(f.filename));
  if (pull.base.ref !== 'main' || changed.length !== 1 || files.length !== 1) throw new Error('El PR debe añadir exactamente un JSON en submissions/ contra main.');
  const raw = await fetch('https://raw.githubusercontent.com/' + repo + '/' + pull.head.sha + '/' + changed[0].filename);
  if (!raw.ok) throw new Error('No se pudo descargar el JSON del PR.');
  const item = await raw.json();
  const required = ['name','author','description','browsers','version','category','download_url'];
  for (const key of required) if (item[key] === undefined || item[key] === null || item[key] === '') throw new Error('Falta el campo obligatorio: ' + key);
  for (const key of ['name','author','description','version','category']) if (typeof item[key] !== 'string' || item[key].length > (key === 'description' ? 1000 : 120)) throw new Error('Campo inválido: ' + key);
  if (!Array.isArray(item.browsers) || !item.browsers.length || item.browsers.some(x => !['Firefox','Chrome','Edge','Other'].includes(x))) throw new Error('Navegadores inválidos.');
  for (const key of ['download_url','website_url','source_url']) if (item[key]) { let u; try { u = new URL(item[key]); } catch { throw new Error('URL inválida: ' + key); } if (!['https:','http:'].includes(u.protocol)) throw new Error('Solo se permiten URLs HTTP(S).'); }
  for (const key of ['permissions','screenshots']) if (item[key] !== undefined && !Array.isArray(item[key])) throw new Error(key + ' debe ser una lista.');
  console.log('Validación correcta. Estado: pending; falta revisión manual.');
})().catch(e => { console.error(e); process.exit(1); });