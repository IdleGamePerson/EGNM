let round = 1;
let currentNumber = 0;
let targetNumber = 0;
let money = 30;
let inputValue = '';
let digitCount = {};
let opCount = { '+': 2, '-': 2, '*': 1, '/': 1 };

function startGame() {
    digitCount = {};
    for (let i = 0; i <= 9; i++) digitCount[i] = 2;
    opCount = { '+': 2, '-': 2, '*': 1, '/': 1 };

    document.getElementById('main-menu').style.display = 'none';
    document.getElementById('game').style.display = 'block';
    resetRound();
}


function resetRound() {
    currentNumber = getRandom(1, Math.floor(100 * 2 ** (round / 10)));
    targetNumber = getRandom(1, Math.floor(100 * 2 ** (round / 10)));
    inputValue = '';

    updateDisplay();
    generateDigitButtons();
    updateShop();
}

function updateDisplay() {
    document.getElementById('round').innerText = round;
    document.getElementById('current-number').innerText = currentNumber;
    document.getElementById('target-number').innerText = targetNumber;
    document.getElementById('money').innerText = money;
    document.getElementById('input').innerText = inputValue || '0';
}

function getRandom(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function generateDigitButtons() {
    const container = document.getElementById('digits');
    container.innerHTML = '';
    for (let i = 0; i <= 9; i++) {
        const count = digitCount[i];
        if (count > 0) {
            const btn = document.createElement('button');
            btn.innerText = `${i} (${count})`;
            btn.onclick = () => {
                inputValue += i;
                digitCount[i]--;
                updateDisplay();
                generateDigitButtons();
            };
            container.appendChild(btn);
        }
    }

    // Ersetze auch die Operator-Buttons mit Anzeige der verbleibenden Anzahl:
    const opsContainer = document.getElementById('operations');
    opsContainer.innerHTML = '';
    ['+', '-', '*', '/'].forEach(op => {
        if (opCount[op] > 0) {
            const btn = document.createElement('button');
            btn.innerText = `${op} (${opCount[op]})`;
            btn.onclick = () => applyOperation(op);
            opsContainer.appendChild(btn);
        }
    });
}

function applyOperation(op) {
    if (opCount[op] <= 0 || inputValue === '') return;

    const val = parseInt(inputValue);
    if (isNaN(val) || val === 0 && op === '/') return;

    if (op === '+') currentNumber += val;
    else if (op === '-') currentNumber -= val;
    else if (op === '*') currentNumber *= val;
    else if (op === '/') currentNumber = Math.floor(currentNumber / val);

    inputValue = '';
    opCount[op]--;
    updateDisplay();
    generateDigitButtons();

    if (currentNumber === targetNumber) {
        const reward = getRandom(8, 12);
        money += reward;
        round++;
        alert(`Runde geschafft! +${reward}€`);
        resetRound();
    }
}

function updateShop() {
    const shopDigits = document.getElementById('shop-digits');
    shopDigits.innerHTML = '<strong>Ziffern kaufen (3€):</strong><br>';
    for (let i = 0; i <= 9; i++) {
        const btn = document.createElement('button');
        btn.innerText = `${i}`;
        btn.onclick = () => buyItem(i.toString(), 3, true);
        shopDigits.appendChild(btn);
    }

    const shopOps = document.getElementById('shop-ops');
    shopOps.innerHTML = '<strong>Operatoren kaufen:</strong><br>';

    const ops = [
        { symbol: '+', price: 5 },
        { symbol: '-', price: 5 },
        { symbol: '*', price: 8 },
        { symbol: '/', price: 7 },
    ];

    for (let { symbol, price } of ops) {
        const btn = document.createElement('button');
        btn.innerText = `${symbol} (${price}€)`;
        btn.onclick = () => buyItem(symbol, price, false);
        shopOps.appendChild(btn);
    }
}

function buyItem(item, cost, isDigit) {
    if (money < cost) {
        alert("Nicht genug Geld!");
        return;
    }

    money -= cost;
    if (isDigit) {
        digitCount[item] = (digitCount[item] || 0) + 1;
    } else {
        opCount[item] = (opCount[item] || 0) + 1;
    }

    updateDisplay();
    generateDigitButtons();
    updateShop();
}

function endGame() {
    alert(`Spiel beendet. Du hast ${money} € erreicht.`);
    location.reload();
}

document.getElementById('start-button').addEventListener('click', startGame);
