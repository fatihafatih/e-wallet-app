import database from "../Models/database.js";

// ========== INIT LOCALSTORAGE ==========
// Toujours synchroniser depuis database.js au démarrage
if (database?.users) {
  localStorage.setItem("users", JSON.stringify(database.users));
} else {
  console.error("database.users est undefined — vérifie ton fichier database.js et son export");
}

// ========== UTILISATEUR COURANT ==========
const user = JSON.parse(sessionStorage.getItem("CurrentUser"));

if (!user) {
  document.location = "login.html";
} else {

  // ========== AFFICHAGE INFOS USER ==========
  document.querySelector('#greetingName').textContent = user.name;
  document.querySelector('#availableBalance').textContent = user.wallet.balance + " " + user.wallet.currency;
  document.querySelector('#activeCards').textContent = user.wallet.cards.length;

  const Dtransaction = user.wallet.transactions.filter(t => t.type === "debit");
  const Ctransaction = user.wallet.transactions.filter(t => t.type === "credit");

  const totalDebit = Dtransaction.reduce((total, t) => total + t.amount, 0);
  const totalCredit = Ctransaction.reduce((total, t) => total + t.amount, 0);

  document.querySelector('#monthlyIncome').textContent = totalCredit + " " + user.wallet.currency;
  document.querySelector('#monthlyExpenses').textContent = totalDebit + " " + user.wallet.currency;

  // ========== REMPLIR BÉNÉFICIAIRES ==========
  const raw = localStorage.getItem("users");
  const users = (raw && raw !== "undefined") ? JSON.parse(raw) : [];

  if (users.length === 0) {
    console.warn("Aucun utilisateur trouvé dans localStorage");
  } else {
    users
      .filter(u => u.id != user.id)
      .forEach(u => {
        const option = document.createElement('option');
        option.value = u.id;
        option.textContent = u.name;
        document.getElementById('beneficiary').appendChild(option);
      });
  }

  // ========== REMPLIR CARTES ==========
  user.wallet.cards.forEach(card => {
    const option = document.createElement('option');
    option.value = card.id;
    option.textContent = card.type + " - **** " + card.numcards.slice(-4);
    document.getElementById('sourceCard').appendChild(option);
  });
}

// ========== AFFICHAGE TRANSFERT ==========
document.getElementById('quickTransfer').addEventListener('click', () => {
  document.getElementById('transfers').classList.remove('hidden');
});

document.getElementById('closeTransferBtn').addEventListener('click', () => {
  document.getElementById('transfers').classList.add('hidden');
});

document.getElementById('cancelTransferBtn').addEventListener('click', () => {
  document.getElementById('transfers').classList.add('hidden');
});

// ========== ELEMENTS ==========
const transferForm = document.getElementById('transferForm');
const amountInput = document.getElementById('amount');
const beneficiarySelect = document.getElementById('beneficiary');
const sourceCardSelect = document.getElementById('sourceCard');

// ========== HELPER LOCALSTORAGE ==========
function getUsers() {
  const raw = localStorage.getItem("users");
  if (!raw || raw === "undefined") return [];
  try {
    return JSON.parse(raw);
  } catch (e) {
    console.error("Erreur parsing users localStorage", e);
    return [];
  }
}

// ========== CALLBACKS ==========
function checkAmount(amount, callback) {
  setTimeout(() => {
    if (!amount || isNaN(amount) || amount <= 0) {
      callback(new Error("Montant invalide !"));
    } else {
      callback(null, amount);
    }
  }, 500);
}

function checkBalance(user, amount, callback) {
  setTimeout(() => {
    if (user.wallet.balance < amount) {
      callback(new Error("Solde insuffisant ! Solde : " + user.wallet.balance + " " + user.wallet.currency));
    } else {
      callback(null, amount);
    }
  }, 500);
}

function checkBeneficiary(beneficiaryId, callback) {
  setTimeout(() => {
    const users = getUsers();
    const toUser = users.find(u => u.id == beneficiaryId);
    if (!toUser) {
      callback(new Error("Bénéficiaire introuvable !"));
    } else {
      callback(null, toUser);
    }
  }, 500);
}

function makeTransaction(fromUser, toUser, amount, callback) {
  setTimeout(() => {

    // Débiter l'expéditeur
    fromUser.wallet.balance -= amount;
    fromUser.wallet.transactions.unshift({
      id: Date.now().toString(),
      type: "debit",
      amount: amount,
      date: new Date().toISOString().slice(0, 10),
      from: sourceCardSelect.value,
      to: toUser.name
    });

    // Créditer le bénéficiaire
    toUser.wallet.balance += amount;
    toUser.wallet.transactions.unshift({
      id: (Date.now() + 1).toString(),
      type: "credit",
      amount: amount,
      date: new Date().toISOString().slice(0, 10),
      from: fromUser.name,
      to: toUser.name
    });

    // Sauvegarder session
    sessionStorage.setItem("CurrentUser", JSON.stringify(fromUser));

    // Mettre à jour fromUser ET toUser dans localStorage
    const allUsers = getUsers();

    const fromIndex = allUsers.findIndex(u => u.id == fromUser.id);
    if (fromIndex !== -1) allUsers[fromIndex] = fromUser;

    const toIndex = allUsers.findIndex(u => u.id == toUser.id);
    if (toIndex !== -1) allUsers[toIndex] = toUser;

    localStorage.setItem("users", JSON.stringify(allUsers));

    callback(null, fromUser);
  }, 800);
}

// ========== SUBMIT ==========
transferForm.addEventListener('submit', function (e) {
  e.preventDefault();

  const user = JSON.parse(sessionStorage.getItem("CurrentUser"));
  if (!user) return (document.location = "login.html");

  const amount = parseFloat(amountInput.value);
  const beneficiaryId = beneficiarySelect.value;
  const btn = document.getElementById('submitTransferBtn');

  btn.disabled = true;
  btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Traitement...';

  checkAmount(amount, (err, validAmount) => {
    if (err) return handleError(btn, err.message);

    checkBalance(user, validAmount, (err) => {
      if (err) return handleError(btn, err.message);

      checkBeneficiary(beneficiaryId, (err, toUser) => {
        if (err) return handleError(btn, err.message);

        makeTransaction(user, toUser, validAmount, (err, updatedUser) => {
          if (err) return handleError(btn, err.message);

          btn.disabled = false;
          btn.innerHTML = '<i class="fas fa-paper-plane"></i> Transférer';

          alert(validAmount + " " + updatedUser.wallet.currency + " envoyés à " + toUser.name + " !");

          document.querySelector('#availableBalance').textContent =
            updatedUser.wallet.balance + " " + updatedUser.wallet.currency;

          transferForm.reset();
        });
      });
    });
  });
});

// ========== GESTION ERREURS ==========
function handleError(btn, message) {
  btn.disabled = false;
  btn.innerHTML = '<i class="fas fa-paper-plane"></i> Transférer';
  alert(message);
}