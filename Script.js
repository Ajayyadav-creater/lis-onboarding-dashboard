const SHEET_URL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vQkWd3mnWNCYpHxaj_FcsWkYRxHSG0jhS9fggA_ZB6uFM4KdIJChoExtcmdGil2uOKGlSj-KiSIuLKP/pub?output=csv';

const tbody = document.getElementById('labTableBody');
const statusFilter = document.getElementById('statusFilter');
const cityFilter = document.getElementById('cityFilter');
const engineerFilter = document.getElementById('engineerFilter');

statusFilter.addEventListener('change', applyFilters);
cityFilter.addEventListener('change', applyFilters);
engineerFilter.addEventListener('change', applyFilters);

async function loadFromGoogleSheet() {
  const res = await fetch(SHEET_URL);
  const csv = await res.text();
  const rows = csv.split('\n').slice(1);

  tbody.innerHTML = '';

  const cities = new Set();
  const engineers = new Set();

  let ready = 0, risk = 0, blocked = 0;
  const engineerCount = {};
  const engineerBlocked = {};

  rows.forEach(r => {
    if (!r.trim()) return;
    const c = r.split(',');

    const lab = c[0];
    const city = c[1];
    const engineer = c[2];
    const testId = c[3];
    const price = c[4];
    const b2b = c[5];
    const users = c[6];
    const phase = c[7];

    cities.add(city);
    engineers.add(engineer);

    engineerCount[engineer] = (engineerCount[engineer] || 0) + 1;

    let status = 'READY';
    let statusClass = 'status-green';

    if (testId === 'FAIL') {
      status = 'BLOCKED';
      statusClass = 'status-red';
      blocked++;
      engineerBlocked[engineer] = (engineerBlocked[engineer] || 0) + 1;
    } else if (price === 'PENDING') {
      status = 'AT RISK';
      statusClass = 'status-yellow';
      risk++;
    } else {
      ready++;
    }

    const tr = document.createElement('tr');
    tr.dataset.status = status;
    tr.dataset.city = city;
    tr.dataset.engineer = engineer;

    tr.innerHTML = `
      <td>${lab}</td>
      <td>${city}</td>
      <td>${engineer}</td>
      <td>${phase}</td>
      <td class="${testId === 'FAIL' ? 'status-red' : 'status-green'}">${testId}</td>
      <td class="${price === 'PENDING' ? 'status-yellow' : 'status-green'}">${price}</td>
      <td>${b2b}</td>
      <td>${users}</td>
      <td class="${statusClass}">${status}</td>
    `;

    tbody.appendChild(tr);
  });

  // KPI update
  document.getElementById('kpiTotal').textContent = ready + risk + blocked;
  document.getElementById('kpiReady').textContent = ready;
  document.getElementById('kpiRisk').textContent = risk;
  document.getElementById('kpiBlocked').textContent = blocked;

  // City filter
  cityFilter.innerHTML = '<option value="ALL">All Cities</option>';
  cities.forEach(c => {
    const opt = document.createElement('option');
    opt.value = c;
    opt.textContent = c;
    cityFilter.appendChild(opt);
  });

  // Engineer filter
  engineerFilter.innerHTML = '<option value="ALL">All Engineers</option>';
  engineers.forEach(e => {
    const opt = document.createElement('option');
    opt.value = e;
    opt.textContent = e;
    engineerFilter.appendChild(opt);
  });

  // Engineer KPI
  const engKpi = document.getElementById('engineerKpi');
  engKpi.innerHTML = '';
  Object.entries(engineerCount).forEach(([eng, count]) => {
    const div = document.createElement('div');
    div.className = 'kpi';
    div.innerHTML = `${eng}<strong>${count} Labs</strong>`;
    engKpi.appendChild(div);
  });

  // Blocked by engineer table
  const blkBody = document.getElementById('blockedByEngineer');
  blkBody.innerHTML = '';
  Object.entries(engineerBlocked).forEach(([eng, count]) => {
    const tr = document.createElement('tr');
    tr.innerHTML = `<td>${eng}</td><td class="status-red">${count}</td>`;
    blkBody.appendChild(tr);
  });
}

function applyFilters() {
  const s = statusFilter.value;
  const c = cityFilter.value;
  const e = engineerFilter.value;

  document.querySelectorAll('#labTableBody tr').forEach(row => {
    const ok =
      (s === 'ALL' || row.dataset.status === s) &&
      (c === 'ALL' || row.dataset.city === c) &&
      (e === 'ALL' || row.dataset.engineer === e);

    row.style.display = ok ? '' : 'none';
  });
}

loadFromGoogleSheet();
