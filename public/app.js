const list = document.querySelector('#checks');
const message = document.querySelector('#message');
const retry = document.querySelector('#retry');
const filter = document.querySelector('#filter');
let checks = [];
function render() {
  list.replaceChildren();
  const visible = checks.filter(check => filter.value === 'all' || check.status === filter.value);
  if (!visible.length) { message.textContent = 'No checks match this filter.'; return; }
  message.textContent = `${visible.length} ${visible.length === 1 ? 'check' : 'checks'} shown`;
  for (const check of visible) {
    const item = document.createElement('li');
    const label = document.createElement('span'); label.textContent = check.title;
    const state = document.createElement('span'); state.textContent = check.status === 'done' ? 'Completed' : 'Open'; state.className = `pill ${check.status}`;
    item.append(label, state); list.append(item);
  }
}
async function load() {
  retry.hidden = true; message.textContent = 'Loading checks…'; list.replaceChildren();
  try {
    const response = await fetch('/api/checks'); if (!response.ok) throw new Error('Request failed');
    const data = await response.json(); if (!Array.isArray(data)) throw new Error('Invalid response');
    checks = data; render();
  } catch { message.textContent = 'Could not load checks. Please try again.'; retry.hidden = false; }
}
document.querySelector('#check-form').addEventListener('submit', event => {
  event.preventDefault(); const input = document.querySelector('#check-title'); const title = input.value.trim();
  if (!title) { input.setCustomValidity('Enter a check name.'); input.reportValidity(); return; }
  checks.unshift({id: Date.now(), title, status: 'open'}); input.value = ''; filter.value = 'all'; render();
});
document.querySelector('#check-title').addEventListener('input', event => event.target.setCustomValidity(''));
filter.addEventListener('change', render); retry.addEventListener('click', load); load();
