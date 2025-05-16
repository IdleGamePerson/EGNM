let round = 1;
let currentNumber = 0;
let targetNumber = 0;
let money = 30;
let inputValue = '';
let digitCount = {};
let opCount = { '+': 2, '-': 2, '*': 1, '/': 1 };
let isBoss = false;
let bossType = null;
let blockedOperator = null;
let startTime = null;
let timerInterval = null;
let totalTimeBefore = 0;

function startGame() {
    digitCount = {};
    for (let i = 0; i <= 9; i++) digitCount[i] = 2;
    opCount = { '+': 2, '-': 2, '*': 1, '/': 1 };

    document.getElementById('main-menu').style.display = 'none';
    document.getElementById('game').style.display = 'block';
    resetRound();
    document.getElementById('shop').style.display = 'block';
    startTime = Date.now();
    timerInterval = setInterval(updateTimer, 31);  // ~30 FPS
    totalTimeBefore = parseInt(localStorage.getItem('totalTime') || '0');
    document.getElementById('stats-button').style.display = 'none';
}


function resetRound() {
    isBoss = (round % 10 === 0);

    if (isBoss) {
        bossType = getBossType();
        if (bossType === 'NO_OPERATIONS') {
            const ops = ['+', '-', '*', '/'];
            blockedOperator = ops[Math.floor(Math.random() * ops.length)];
        } else {
            blockedOperator = null;
        }
        console.log("Bosskampf:", bossType, blockedOperator ? `(blockiert: ${blockedOperator})` : '');
    } else {
        bossType = null;
        blockedOperator = null;
    }


    let maxVal = Math.floor(100 * 2 ** (round / 10));
    let minVal = 1;

    if (isBoss && bossType === 'BIG_NUMBER') {
        minVal = Math.floor(100 * 2 ** (round / 10));
        maxVal = Math.floor(100 * 2 ** (round / 5));
    }

    currentNumber = getRandom(1, maxVal);
    targetNumber = getRandom(minVal, maxVal);
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
    let roundText = round;
    const info = document.getElementById('boss-info');
    if (isBoss) {
        info.innerText = getBossDescription(bossType);
    } else {
        info.innerText = '';
    }
    document.getElementById('round').innerText = roundText;

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
    if (inputValue === '') return;

    if (bossType === 'NO_OPERATIONS' && op === blockedOperator) {
        alert(`Operator ${op} ist in diesem Bosskampf blockiert!`);
        return;
    }


    let cost = (bossType === 'DOUBLE_USAGE') ? 2 : 1;
    if (opCount[op] < cost) {
        alert(`Nicht genug ${op}-Operatoren! (benötigt ${cost})`);
        return;
    }

    const val = parseInt(inputValue);
    if (isNaN(val) || (val === 0 && op === '/')) return;

    if (op === '+') currentNumber += val;
    else if (op === '-') currentNumber -= val;
    else if (op === '*') currentNumber *= val;
    else if (op === '/') currentNumber = Math.floor(currentNumber / val);

    inputValue = '';
    opCount[op] -= cost;

    updateDisplay();
    generateDigitButtons();

    if (currentNumber === targetNumber) {
        const reward = isBoss ? getRandom(16, 24) : getRandom(8, 12);
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
    if (bossType === 'DOUBLE_COST') cost *= 2;
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
    clearInterval(timerInterval);

    const totalNow = Date.now() - startTime + totalTimeBefore;
    localStorage.setItem('totalTime', totalNow.toString());

    const bestRound = parseInt(localStorage.getItem('bestRound') || '0');
    if (round > bestRound) {
        localStorage.setItem('bestRound', round.toString());
    }

    alert(`Spiel beendet. Du hast Runde ${round} erreicht.`);
    document.getElementById('shop').style.display = 'none';
    location.reload();
    document.getElementById('stats-button').style.display = 'inline-block';
}

function getBossType() {
    let r = Math.random() * 100;
    if (r < 40) return 'BIG_NUMBER';
    if (r < 70) return 'NO_OPERATIONS';
    if (r < 90) return 'DOUBLE_USAGE';
    return 'DOUBLE_COST';
}

function updateTimer() {
    const now = Date.now();
    const elapsed = now - startTime;

    const minutes = Math.floor(elapsed / 60000);
    const seconds = Math.floor((elapsed % 60000) / 1000);
    const milliseconds = elapsed % 1000;

    const timeStr =
        String(minutes).padStart(2, '0') + ':' +
        String(seconds).padStart(2, '0') + '.' +
        String(milliseconds).padStart(3, '0');

    document.getElementById('time').innerText = timeStr;
}

document.getElementById('stats-button').addEventListener('click', showStats);

function showStats() {
    const best = parseInt(localStorage.getItem('bestRound') || '0');
    const total = parseInt(localStorage.getItem('totalTime') || '0');

    document.getElementById('best-round').innerText = best;
    document.getElementById('total-playtime').innerText = formatTime(total);
    document.getElementById('stats-modal').style.display = 'block';
}

function closeStats() {
    document.getElementById('stats-modal').style.display = 'none';
}

function formatTime(ms) {
    const minutes = Math.floor(ms / 60000);
    const seconds = Math.floor((ms % 60000) / 1000);
    const milliseconds = ms % 1000;

    return (
        String(minutes).padStart(2, '0') + ':' +
        String(seconds).padStart(2, '0') + '.' +
        String(milliseconds).padStart(3, '0')
    );
}

function getBossDescription(type) {
    switch (type) {
        case 'BIG_NUMBER':
            return 'Bosskampf: Du musst eine sehr große Zahl berechnen.';
        case 'NO_OPERATIONS':
            return `Bosskampf: Der Operator "${blockedOperator}" ist blockiert.`;
        case 'DOUBLE_USAGE':
            return 'Bosskampf: Jede Ziffer und jeder Operator braucht 2 Einheiten!';
        case 'DOUBLE_COST':
            return 'Bosskampf: Alles im Shop kostet doppelt so viel!';
        default:
            return '';
    }
}

document.getElementById('start-button').addEventListener('click', startGame);
