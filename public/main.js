import { runLocalAiDiagnosis } from '../src/frontend/mock-ai.js';
import { getCollectionsData, getExploreData, getLibraryData } from '../src/frontend/data-layer.js';

const tabsEl = document.getElementById('tabs');
const tabSections = [...document.querySelectorAll('.tab')];

tabsEl.addEventListener('click', (event) => {
  const btn = event.target.closest('button[data-tab]');
  if (!btn) return;

  document.querySelectorAll('.tabs button').forEach((b) => b.classList.remove('active'));
  btn.classList.add('active');

  const tab = btn.dataset.tab;
  tabSections.forEach((section) => section.classList.toggle('active', section.id === tab));
});

document.getElementById('runCapture').addEventListener('click', async () => {
  const plantName = document.getElementById('plantName').value;
  const symptoms = document.getElementById('symptoms').value;
  const result = await runLocalAiDiagnosis({ plantName, symptoms });
  document.getElementById('captureResult').textContent = JSON.stringify(result, null, 2);
});

document.getElementById('loadLibrary').addEventListener('click', async () => {
  const data = await getLibraryData();
  document.getElementById('libraryList').innerHTML = `
    <h3>Plants</h3><pre>${JSON.stringify(data.plants, null, 2)}</pre>
    <h3>Remedies</h3><pre>${JSON.stringify(data.remedies, null, 2)}</pre>
  `;
});

document.getElementById('loadCollections').addEventListener('click', async () => {
  const data = await getCollectionsData();
  document.getElementById('collectionsList').innerHTML = data.map((item) => `<li>${item.name ?? item.id}</li>`).join('');
});

document.getElementById('loadExplore').addEventListener('click', async () => {
  const data = await getExploreData();
  document.getElementById('exploreList').innerHTML = `
    <h3>Community</h3><pre>${JSON.stringify(data.community, null, 2)}</pre>
    <h3>Marketplace</h3><pre>${JSON.stringify(data.marketplace, null, 2)}</pre>
  `;
});
