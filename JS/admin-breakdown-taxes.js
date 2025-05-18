const rowsPerPage = 5;
const table = document.getElementById('output');
const tbody = table.querySelector('tbody');
const pagination = document.getElementById('pagination');

let currentPage = 1;
let rows = []; // will hold all <tr> elements after data load

const dbURL = "https://mentropay-38347-default-rtdb.firebaseio.com/";

// Default rates per type (fallback if no breakdown applied)
const rateConfig = {
  Live: { base: 200, tax: 18, fee: 10 },
  Recording: { base: 150, tax: 10, fee: 5 },
  Evaluation: { base: 100, tax: 5, fee: 3 }
};

let breakdownUpdates = {};

function parseDate(str) {
  if (!str) return null;
  if (str.includes("-") && str.indexOf("-") === 2) {
    const [dd, mm, yyyy] = str.split("-");
    return new Date(`${yyyy}-${mm}-${dd}T00:00:00`);
  }
  return new Date(str + "T00:00:00");
}

function clearInputs() {
  document.getElementById("baseRate").value = "";
  document.getElementById("taxRate").value = "";
  document.getElementById("platformFee").value = "";
  document.getElementById("startDate").value = "";
  document.getElementById("endDate").value = "";
}

function addBreakdown() {
  const type = document.getElementById("type").value;
  const base = parseFloat(document.getElementById("baseRate").value);
  const tax = parseFloat(document.getElementById("taxRate").value);
  const fee = parseFloat(document.getElementById("platformFee").value);
  const start = parseDate(document.getElementById("startDate").value);
  const end = parseDate(document.getElementById("endDate").value);

  if (!base && base !== 0 || !tax && tax !== 0 || !fee && fee !== 0) {
    alert("Please fill Base ₹, Tax %, and Platform Fee %");
    return;
  }
  if (!start || !end) {
    alert("Please select valid Start Date and End Date");
    return;
  }
  if (end < start) {
    alert("End Date cannot be before Start Date");
    return;
  }

  breakdownUpdates[type] = { base, tax, fee, start, end };

  alert(`Breakdown for ${type} updated and will apply to sessions between ${start.toLocaleDateString()} and ${end.toLocaleDateString()}`);

  clearInputs();
  loadData();
}

async function fetchAllData() {
  // Fetch 3 different data sources (change URLs as needed)
  const urls = [
    dbURL + "/sessions.json",
    dbURL + "/mentors.json",
    dbURL + "/mentor.json",
    dbURL + "/mentorSessionData.json"
  ];
  const results = await Promise.all(urls.map(url => fetch(url).then(r => r.json())));
  // results is an array of data objects or null if no data

  // Combine all entries into one array
  let combined = [];
  results.forEach(data => {
    if (!data) return;
    for (const id in data) {
      combined.push(data[id]);
    }
  });
  return combined;
}

function buildRow(s) {
  const sessionDate = parseDate(s.Date);
  const breakdown = breakdownUpdates[s.Type];

  let base = s.base || 0;
  let taxAmount = 0;
  let feeAmount = 0;
  let finalAmount = 0;

  if (breakdown && sessionDate >= breakdown.start && sessionDate <= breakdown.end) {
    base = breakdown.base;
    taxAmount = base * breakdown.tax / 100;
    feeAmount = base * breakdown.fee / 100;
    finalAmount = base - taxAmount - feeAmount;
  } else {
    const hours = s.duration / 60;
    const baseRate = s.ratePerHour || (rateConfig[s.Type]?.base || 0);
    base = hours * baseRate;
    taxAmount = base * (rateConfig[s.Type]?.tax || 0) / 100;
    feeAmount = base * (rateConfig[s.Type]?.fee || 0) / 100;
    finalAmount = base - taxAmount - feeAmount;
  }

  return `<tr>
    <td>${s["Mentor Name"] || ""}</td>
    <td>${s.mentorId || ""}</td>
    <td>${s.Type || ""}</td>
    <td>${s.Date || ""}</td>
    <td>${s.duration || 0} mins</td>
    <td>₹${base.toFixed(2)}</td>
    <td>₹${taxAmount.toFixed(2)}</td>
    <td>₹${feeAmount.toFixed(2)}</td>
    <td>₹${finalAmount.toFixed(2)}</td>
  </tr>`;
}

async function loadData() {
  const combinedData = await fetchAllData();
  tbody.innerHTML = "";

  if (!combinedData.length) return;

  // Build rows for all combined data
  const allRowsHTML = combinedData.map(buildRow).join("");
  tbody.innerHTML = allRowsHTML;

  // Update rows for pagination
  rows = Array.from(tbody.querySelectorAll('tr'));
  setupPagination();
  showPage(1);
}

function showPage(page) {
  currentPage = page;
  let start = (page - 1) * rowsPerPage;
  let end = start + rowsPerPage;

  rows.forEach((row, index) => {
    row.style.display = index >= start && index < end ? '' : 'none';
  });

  Array.from(pagination.children).forEach((btn, idx) => {
    btn.classList.toggle('active', idx + 1 === page);
  });
}

function setupPagination() {
  pagination.innerHTML = '';
  const totalPages = Math.ceil(rows.length / rowsPerPage);

  for (let i = 1; i <= totalPages; i++) {
    let btn = document.createElement('button');
    btn.textContent = i;
    btn.addEventListener('click', () => showPage(i));
    pagination.appendChild(btn);
  }
}

// Init
loadData();
