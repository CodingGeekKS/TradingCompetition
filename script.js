// Array to store all trades
let trades = JSON.parse(localStorage.getItem('trades')) || [];

// Function to calculate RR Ratio
function calculateRR(entry, sl, tp1, tp2, tp3) {
  const risk = Math.abs(entry - sl);
  const reward1 = Math.abs(tp1 - entry);
  const reward2 = Math.abs(tp2 - entry);
  const reward3 = Math.abs(tp3 - entry);
  const avgReward = (reward1 + reward2 + reward3) / 3;
  return (avgReward / risk).toFixed(2);
}

// Function to auto-calculate SL, TP1, TP2, TP3 based on position
function autoCalculateFields() {
  const entry = parseFloat(document.getElementById('entry').value);
  const position = document.getElementById('position').value;

  if (!isNaN(entry)) {
    if (position === 'BUY') {
      document.getElementById('sl').value = (entry - 5).toFixed(2); // SL = Entry - 5
      document.getElementById('tp1').value = (entry + 5).toFixed(2); // TP1 = Entry + 5
      document.getElementById('tp2').value = (entry + 10).toFixed(2); // TP2 = Entry + 10
      document.getElementById('tp3').value = (entry + 15).toFixed(2); // TP3 = Entry + 15
    } else if (position === 'SELL') {
      document.getElementById('sl').value = (entry + 5).toFixed(2); // SL = Entry + 5
      document.getElementById('tp1').value = (entry - 5).toFixed(2); // TP1 = Entry - 5
      document.getElementById('tp2').value = (entry - 10).toFixed(2); // TP2 = Entry - 10
      document.getElementById('tp3').value = (entry - 15).toFixed(2); // TP3 = Entry - 15
    }
  }
}

// Function to save trades to local storage
function saveTrades() {
  localStorage.setItem('trades', JSON.stringify(trades));
}

// Function to add a new trade
function addTrade(event) {
  event.preventDefault();

  const name = document.getElementById('name').value;
  const batch = document.getElementById('batch').value;
  const pair = document.getElementById('pair').value;
  const position = document.getElementById('position').value;
  const entry = parseFloat(document.getElementById('entry').value);
  const sl = parseFloat(document.getElementById('sl').value);
  const tp1 = parseFloat(document.getElementById('tp1').value);
  const tp2 = parseFloat(document.getElementById('tp2').value);
  const tp3 = parseFloat(document.getElementById('tp3').value);
  const rr = calculateRR(entry, sl, tp1, tp2, tp3);

  const trade = {
    name,
    batch,
    pair,
    position,
    entry,
    sl,
    tp1,
    tp2,
    tp3,
    rr,
    status: 'Pending'
  };

  trades.push(trade);
  saveTrades(); // Save trades to local storage
  renderTrades();
  document.getElementById('tradeForm').reset();
}

// Function to render trades in the admin table
function renderTrades() {
  const tbody = document.querySelector('#tradeTable tbody');
  tbody.innerHTML = '';

  trades.forEach((trade, index) => {
    const row = document.createElement('tr');
    row.innerHTML = `
      <td>${trade.name}</td>
      <td>${trade.batch}</td>
      <td>${trade.pair}</td>
      <td>${trade.position}</td>
      <td>${trade.entry}</td>
      <td>${trade.sl}</td>
      <td>${trade.tp1}</td>
      <td>${trade.tp2}</td>
      <td>${trade.tp3}</td>
      <td>${trade.rr}</td>
      <td class="status-${trade.status.toLowerCase()}">${trade.status}</td>
      <td>
        <button class="pass" onclick="markAsPass(${index})">Pass</button>
        <button class="fail" onclick="markAsFailed(${index})">Fail</button>
      </td>
    `;
    tbody.appendChild(row);
  });

  updateLeaderboard();
}

// Function to mark a trade as Pass
function markAsPass(index) {
  trades[index].status = 'Pass';
  saveTrades(); // Save trades to local storage
  renderTrades();
}

// Function to mark a trade as Failed
function markAsFailed(index) {
  trades[index].status = 'Failed';
  saveTrades(); // Save trades to local storage
  renderTrades();
}

// Function to update the leaderboard
function updateLeaderboard() {
  const leaderboard = {};

  trades.forEach(trade => {
    if (!leaderboard[trade.name]) {
      leaderboard[trade.name] = { 
        batch: trade.batch,
        pair: trade.pair,
        buy: 0,
        sell: 0,
        wins: 0,
        loses: 0,
        totalRR: 0
      };
    }
    if (trade.position === 'BUY') {
      leaderboard[trade.name].buy += 1;
    } else if (trade.position === 'SELL') {
      leaderboard[trade.name].sell += 1;
    }
    if (trade.status === 'Pass') {
      leaderboard[trade.name].wins += 1;
      leaderboard[trade.name].totalRR += parseFloat(trade.rr);
    } else if (trade.status === 'Failed') {
      leaderboard[trade.name].loses += 1;
    }
  });

  const leaderboardArray = Object.keys(leaderboard).map(name => ({
    name,
    batch: leaderboard[name].batch,
    pair: leaderboard[name].pair,
    buy: leaderboard[name].buy,
    sell: leaderboard[name].sell,
    wins: leaderboard[name].wins,
    loses: leaderboard[name].loses,
    totalTrades: leaderboard[name].wins + leaderboard[name].loses,
    winPercentage: ((leaderboard[name].wins / (leaderboard[name].wins + leaderboard[name].loses)) * 100).toFixed(2),
    avgRR: (leaderboard[name].totalRR / leaderboard[name].wins).toFixed(2)
  }));

  leaderboardArray.sort((a, b) => b.wins - a.wins || b.avgRR - a.avgRR);

  const tbody = document.querySelector('#leaderboard tbody');
  tbody.innerHTML = '';

  leaderboardArray.forEach((entry, index) => {
    const row = document.createElement('tr');
    row.innerHTML = `
      <td>${index + 1}</td>
      <td>${entry.name}</td>
      <td>${entry.batch}</td>
      <td>${entry.pair}</td>
      <td>${entry.buy}</td>
      <td>${entry.sell}</td>
      <td>${entry.wins}</td>
      <td>${entry.loses}</td>
      <td>${entry.winPercentage}%</td>
      <td>${entry.avgRR}</td>
    `;
    tbody.appendChild(row);
  });
}

// Event listeners
document.getElementById('tradeForm').addEventListener('submit', addTrade);
document.getElementById('entry').addEventListener('input', autoCalculateFields);
document.getElementById('position').addEventListener('change', autoCalculateFields);

// Load trades when the page loads
window.onload = function () {
  renderTrades();
};