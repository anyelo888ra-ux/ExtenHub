(() => {
  const grid = document.getElementById('catalog-grid');
  const count = document.getElementById('count');
  const search = document.getElementById('search');
  const browser = document.getElementById('browser');
  const empty = document.getElementById('empty');
  let extensions = [];

  const safeUrl = value => {
    try { const u = new URL(value); return ['https:', 'http:'].includes(u.protocol) ? u.href : null; }
    catch { return null; }
  };
  const esc = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));

  function render() {
    const q = search.value.trim().toLowerCase();
    const b = browser.value.toLowerCase();
    const list = extensions.filter(x => {
      const text = [x.name,x.description,x.author,...(x.browsers || [])].join(' ').toLowerCase();
      return (!q || text.includes(q)) && (!b || (x.browsers || []).some(v => v.toLowerCase() === b));
    });
    count.textContent = list.length + (list.length === 1 ? ' extensión' : ' extensiones');
    grid.innerHTML = list.map(x => {
      const url = safeUrl(x.download_url);
      return `<article class="card"><div class="meta"><span class="tag">${esc((x.browsers || []).join(' · '))}</span><span class="tag verified">✓ Verified</span></div><h3>${esc(x.name)}</h3><p>${esc(x.description)}</p><p>Por ${esc(x.author)}</p><div class="meta"><a href="extension.html?q=${encodeURIComponent(x.id)}">Ver detalles →</a>${url ? `<a href="${esc(url)}" target="_blank" rel="noopener noreferrer">Descargar</a>` : ''}</div></article>`;
    }).join('');
    empty.hidden = list.length !== 0;
  }

  fetch('database.json', { cache: 'no-store' })
    .then(r => { if (!r.ok) throw new Error('No se pudo leer database.json'); return r.json(); })
    .then(data => {
      if (!data || !Array.isArray(data.extensions)) throw new Error('Formato de catálogo inválido');
      extensions = data.extensions.filter(x => x && x.status === 'verified' && x.id && x.name && x.description);
      render();
    })
    .catch(err => { grid.innerHTML = '<p class="muted">No se pudo cargar el catálogo. Inténtalo más tarde.</p>'; count.textContent = 'Error'; console.error(err); });
  search.addEventListener('input', render);
  browser.addEventListener('change', render);
})();