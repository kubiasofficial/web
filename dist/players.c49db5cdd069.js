// Public Discord nicknames and avatars; credentials stay in the Cloudflare Worker.
(() => {
  const endpoint = 'https://ubd-bot.suslik-kuba.workers.dev/players/';
  const loaded = new Map();
  for (const badge of document.querySelectorAll('.player-badge')) {
    const key = badge.id.replace(/^player-/, '');
    const card = badge.closest('.medallion-card');
    const handle = badge.querySelector('.player-handle');
    const label = badge.querySelector('.player-label');
    const portrait = document.createElement('span');
    portrait.className = 'player-avatar';
    portrait.setAttribute('aria-hidden', 'true');
    portrait.textContent = [...handle.textContent.replace(/[^\p{L}\p{N}]/gu, '')].slice(0, 2).join('').toUpperCase();
    const details = document.createElement('span');
    details.className = 'player-details';
    details.append(label, handle);
    badge.append(portrait, details);

    async function load() {
      if ((loaded.get(key) || 0) > Date.now()) return;
      loaded.set(key, Date.now() + 60000);
      try {
        const response = await fetch(endpoint + key, { mode: 'cors', credentials: 'omit', signal: AbortSignal.timeout(5500) });
        if (!response.ok) return;
        const player = await response.json();
        if (player.character !== key || typeof player.name !== 'string') return;
        // textContent keeps arbitrary Discord names from becoming HTML.
        handle.textContent = player.name;
        if (!player.synced) return;
        label.textContent = 'DISCORD · HRÁČ';
        loaded.set(key, Date.now() + 300000);
        const url = new URL(player.avatar);
        if (url.protocol !== 'https:' || url.hostname !== 'cdn.discordapp.com') return;
        const img = new Image(40, 40);
        img.alt = '';
        img.referrerPolicy = 'no-referrer';
        img.onload = () => portrait.replaceChildren(img);
        img.src = url.href;
      } catch { /* The original nickname and initials remain usable offline. */ }
    }
    card.addEventListener('pointerenter', load);
    card.addEventListener('focus', load);
    card.addEventListener('touchstart', load, { passive: true });
  }
})();
