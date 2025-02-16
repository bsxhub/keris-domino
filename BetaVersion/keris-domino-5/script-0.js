// script.js

// Variables Global
let dominoes = [];
let players = {
    1: [], // Pemain (User)
    2: [], // AI 1
    3: [], // AI 2
    4: []  // AI 3
};
let boardDominoes = [];
let currentPlayer = 1;
let gameActive = false;
let skipCount = 0;

// Fungsi Permainan Asas
function buatDomino() {
    dominoes = [];
    for (let i = 0; i <= 6; i++) {
        for (let j = i; j <= 6; j++) {
            dominoes.push({
                kiri: i,
                kanan: j
            });
        }
    }
}

function kocokDomino() {
    for (let i = dominoes.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [dominoes[i], dominoes[j]] = [dominoes[j], dominoes[i]];
    }
}

function agihDomino() {
    for (let i = 1; i <= 4; i++) {
        players[i] = dominoes.slice((i-1)*7, i*7);
    }
}

function tunjukDomino(domino, index, isPlayer = false) {
    let html = `<div class="domino" ${isPlayer ? `onclick="pilihDomino(${index})"` : ''}>`;
    if (isPlayer) {
        html += `<button class="rotate-btn" onclick="putarDomino(${index}, event)">↻</button>`;
    }
    html += `
        <div class="domino-half">${isPlayer ? domino.kiri : '?'}</div>
        <div class="domino-half">${isPlayer ? domino.kanan : '?'}</div>
    </div>`;
    return html;
}

function updatePaparan() {
    // Paparan tangan pemain
    document.getElementById('player1Hand').innerHTML = 
        players[1].map((d, i) => tunjukDomino(d, i, true)).join('');

    // Paparan tangan AI
    for (let i = 2; i <= 4; i++) {
        document.getElementById(`player${i}Hand`).innerHTML = 
            players[i].map(d => tunjukDomino(d, false)).join('');
    }

    // Paparan papan permainan
    document.getElementById('boardDominoes').innerHTML = 
        boardDominoes.map(d => tunjukDomino(d, -1, true)).join('');

    // Update status
    document.getElementById('statusMessage').textContent = 
        gameActive ? `Giliran Pemain ${currentPlayer}` : 'Sila mula permainan baru';
    
    // Update skip button
    document.getElementById('skipBtn').disabled = !gameActive || currentPlayer !== 1;
}

function bolehMain(domino, posisi) {
    if (boardDominoes.length === 0) return true;

    if (posisi === 'kiri') {
        return domino.kanan === boardDominoes[0].kiri;
    } else {
        return domino.kiri === boardDominoes[boardDominoes.length - 1].kanan;
    }
}

function putarDomino(index, event) {
    if (event) event.stopPropagation();
    if (!gameActive || currentPlayer !== 1) return;

    const domino = players[1][index];
    const temp = domino.kiri;
    domino.kiri = domino.kanan;
    domino.kanan = temp;
    updatePaparan();
}

function pilihDomino(index) {
    if (!gameActive || currentPlayer !== 1) return;

    const domino = players[1][index];
    const bolehKiri = bolehMain(domino, 'kiri');
    const bolehKanan = bolehMain(domino, 'kanan');

    if (!bolehKiri && !bolehKanan) {
        alert('Domino ini tidak boleh dimainkan! Cuba putar atau pilih domino lain.');
        return;
    }

    let posisi = '';
    if (bolehKiri && bolehKanan) {
        posisi = prompt('Pilih posisi (kiri/kanan):');
        if (!posisi || (posisi !== 'kiri' && posisi !== 'kanan')) return;
    } else if (bolehKiri) {
        posisi = 'kiri';
    } else {
        posisi = 'kanan';
    }

    mainDomino(index, posisi);
}

function mainDomino(index, posisi) {
    const domino = players[1][index];
    
    if (posisi === 'kiri') {
        boardDominoes.unshift(domino);
    } else {
        boardDominoes.push(domino);
    }

    players[1].splice(index, 1);
    skipCount = 0;

    if (players[1].length === 0) {
        alert('Tahniah! Anda Menang!');
        gameActive = false;
        return;
    }

    nextPlayer();
    updatePaparan();
    if (currentPlayer !== 1) {
        setTimeout(giliranAI, 1000);
    }
}

function giliranAI() {
    const currentHand = players[currentPlayer];
    let mainedDomino = false;

    for (let i = 0; i < currentHand.length; i++) {
        const domino = currentHand[i];
        
        if (bolehMain(domino, 'kiri')) {
            currentHand.splice(i, 1);
            boardDominoes.unshift(domino);
            mainedDomino = true;
            break;
        }
        
        if (bolehMain(domino, 'kanan')) {
            currentHand.splice(i, 1);
            boardDominoes.push(domino);
            mainedDomino = true;
            break;
        }

        // Cuba putar domino
        const temp = domino.kiri;
        domino.kiri = domino.kanan;
        domino.kanan = temp;

        if (bolehMain(domino, 'kiri')) {
            currentHand.splice(i, 1);
            boardDominoes.unshift(domino);
            mainedDomino = true;
            break;
        }
        
        if (bolehMain(domino, 'kanan')) {
            currentHand.splice(i, 1);
            boardDominoes.push(domino);
            mainedDomino = true;
            break;
        }

        // Putar balik
        domino.kiri = domino.kanan;
        domino.kanan = temp;
    }

    if (!mainedDomino) {
        skipCount++;
        if (skipCount >= 4) {
            alert('Permainan tamat - Tiada pemain boleh main!');
            gameActive = false;
            return;
        }
    } else {
        skipCount = 0;
        if (currentHand.length === 0) {
            alert(`Pemain ${currentPlayer} Menang!`);
            gameActive = false;
            return;
        }
    }

    nextPlayer();
    updatePaparan();

    if (currentPlayer !== 1 && gameActive) {
        setTimeout(giliranAI, 1000);
    }
}

function skipGiliran() {
    if (!gameActive || currentPlayer !== 1) return;

    skipCount++;
    if (skipCount >= 4) {
        alert('Permainan tamat - Tiada pemain boleh main!');
        gameActive = false;
        return;
    }

    nextPlayer();
    updatePaparan();
    setTimeout(giliranAI, 1000);
}

function nextPlayer() {
    currentPlayer = currentPlayer % 4 + 1;
}

function mulaPemainan() {
    gameActive = true;
    skipCount = 0;
    currentPlayer = 1;
    boardDominoes = [];
    buatDomino();
    kocokDomino();
    agihDomino();
    updatePaparan();
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('skipBtn').disabled = true;
});