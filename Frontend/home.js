const form = document.getElementById('expenseForm');
const tableBody = document.getElementById('resultBody');
const sortSelect = document.getElementById('sort');

let expenses = [];

document.addEventListener('DOMContentLoaded', async function () {
  const res = await fetch('http://localhost:3000/');
  const data = await res.json();
  expenses = data.map(item => ({
    ID: item.ID,
    expName: item.expName,
    amount: item.amount,
    category: item.category,
    date: item.da_te,
    editing: false
  }));
  renderTable();
   fetchAndDisplayTotal();
});

form.addEventListener('submit', async function (e) {
  e.preventDefault();

  const expense = {
    expName: document.getElementById('expName').value.trim(),
    amount: document.getElementById('amount').value,
    category: document.getElementById('category').value,
    date: document.getElementById('date').value
  };

  const res = await fetch('http://localhost:3000/addExp', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(expense)
  });

  const newData = await res.json();
  expense.ID = newData.insertId; // get new ID
  expense.editing = false;

  expenses.push(expense);
  renderTable();
  form.reset();
});

sortSelect.addEventListener('change', renderTable);

function renderTable() {
  tableBody.innerHTML = '';

  const sortOption = sortSelect.value;
  let sorted = [...expenses];

  if (sortOption === 'date') {
    sorted.sort((a, b) => new Date(a.date) - new Date(b.date));
  } else if (sortOption === 'amount') {
    sorted.sort((a, b) => parseFloat(a.amount) - parseFloat(b.amount));
  }

  sorted.forEach((expense, index) => {
    const row = document.createElement('tr');
    if (expense.editing) {
      row.innerHTML = `
  <td><input type="text" id="editName-${index}" value="${expense.expName}" /></td>
  <td><input type="number" id="editAmount-${index}" value="${expense.amount}" /></td>
  <td>
    <select id="editCategory-${index}">
      ${['Food', 'Transport', 'Bills', 'Shopping', 'Other']
        .map(cat => `<option value="${cat}" ${expense.category === cat ? 'selected' : ''}>${cat}</option>`)
        .join('')}
    </select>
  </td>
  <td><input type="date" id="editDate-${index}" value="${expense.date}" /></td>
  <td>
    <button class="action-btn save" onclick="saveEdit(${index})"><i class="fas fa-save"></i></button>
    <button class="action-btn cancel" onclick="cancelEdit(${index})"><i class="fas fa-times-circle"></i></button>
  </td>
`;

    } else {
     row.innerHTML = `
  <td>${expense.expName}</td>
  <td>${expense.amount}</td>
  <td>${expense.category}</td>
  <td>${expense.date}</td>
  <td>
    <button class="action-btn edit" onclick="editExpense(${index})"><i class="fas fa-edit"></i></button>
    <button class="action-btn delete" onclick="deleteExpense(${index})"><i class="fas fa-trash-alt"></i></button>
  </td>
`;

    }
    tableBody.appendChild(row);
  });
}

function editExpense(index) {
  expenses[index].editing = true;
  renderTable();
}

function cancelEdit(index) {
  expenses[index].editing = false;
  renderTable();
}

async function saveEdit(index) {
  const updated = {
    ID: expenses[index].ID,
    expName: document.getElementById(`editName-${index}`).value,
    amount: document.getElementById(`editAmount-${index}`).value,
    category: document.getElementById(`editCategory-${index}`).value,
    date: document.getElementById(`editDate-${index}`).value
  };

  const res = await fetch(`http://localhost:3000/updateExp/${updated.ID}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(updated)
  });

  if (res.ok) {
    expenses[index] = { ...updated, editing: false };
    renderTable();
  }
}

async function deleteExpense(index) {
  const id = expenses[index].ID;
  const res = await fetch(`http://localhost:3000/deleteExp/${id}`, {
    method: 'DELETE'
  });

  if (res.ok) {
    expenses.splice(index, 1);
    renderTable();
  }
}
async function fetchAndDisplayTotal() {
  try {
    const res = await fetch('http://localhost:3000/total');
    const data = await res.json();
    document.getElementById('totalAmount').innerText = `₹${data.total || 0}`;
  } catch (err) {
    console.error("Error fetching total:", err);
  }
}

