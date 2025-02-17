// script.js

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
let selectedDominoIndex = -1;

function buatDomino() {
    dominoes = [];
    for (let i = 0; i <= 6; i++) {
        for (let j = i; j <= 6; j++) {
            dominoes.push({
                nilai1: i,
                nilai2: j
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

function checkPadanan(dominoBaru, dominoPapan, posisi) {
    if (boardDominoes.length === 0) return true;

    if (posisi === 'kiri') {
        return dominoBaru.nilai2 === dominoPapan.nilai1;
    } else {
        return dominoBaru.nilai1 === dominoPapan.nilai2;
    }
}

function tunjukDomino(domino, index, isPlayer = false) {
    let html = `<div class="domino" ${isPlayer ? `onclick="pilihDomino(${index})"` : ''}>`;
    if (isPlayer) {
        html += `<button class="rotate-btn" onclick="putarDomino(${index}, event)">↻</button>`;
    }
    html += `
        <div class="domino-half">${isPlayer ? domino.nilai1 : '?'}</div>
        <div class="domino-half">${isPlayer ? domino.nilai2 : '?'}</div>
    </div>`;
    return html;
}

function updatePaparan() {
    // Tangan pemain
    document.getElementById('player1Hand').innerHTML = 
        players[1].map((d, i) => tunjukDomino(d, i, true)).join('');

    // Tangan AI
    for (let i = 2; i <= 4; i++) {
        document.getElementById(`player${i}Hand`).innerHTML = 
            players[i].map(d => tunjukDomino(d, false)).join('');
    }

    // Papan permainan
    document.getElementById('boardDominoes').innerHTML = 
        boardDominoes.map(d => tunjukDomino(d, -1, true)).join('');

    // Status
    document.getElementById('statusMessage').textContent = 
        gameActive ? `Giliran Pemain ${currentPlayer}` : 'Sila mula permainan baru';
    
    document.getElementById('skipBtn').disabled = !gameActive || currentPlayer !== 1;
}

function putarDomino(index, event) {
    if (event) event.stopPropagation();
    if (!gameActive || currentPlayer !== 1) return;

    const domino = players[1][index];
    [domino.nilai1, domino.nilai2] = [domino.nilai2, domino.nilai1];
    updatePaparan();
}

function bolehMain(domino) {
    if (boardDominoes.length === 0) return true;

    const dominoKiri = boardDominoes[0];
    const dominoKanan = boardDominoes[boardDominoes.length - 1];

    return (domino.nilai1 === dominoKiri.nilai1 ||
            domino.nilai2 === dominoKiri.nilai1 ||
            domino.nilai1 === dominoKanan.nilai2 ||
            domino.nilai2 === dominoKanan.nilai2);
}


function pilihDomino(index) {
    if (!gameActive || currentPlayer !== 1) return;

    const domino = players[1][index];
    
    if (!bolehMain(domino)) {
        showToast('Domino ini tidak boleh dimainkan! Cuba putar atau pilih domino lain.', 'error');
        return;
    }

    if (boardDominoes.length === 0) {
        mainDomino(index, 'kanan');
        return;
    }

    let posisiValid = [];
    const dominoKiri = boardDominoes[0];
    const dominoKanan = boardDominoes[boardDominoes.length - 1];

    if (domino.nilai2 === dominoKiri.nilai1) posisiValid.push('kiri');
    if (domino.nilai1 === dominoKanan.nilai2) posisiValid.push('kanan');

    if (posisiValid.length === 0) {
        // Cuba putar dan periksa lagi
        putarDomino(index, null);
        if (domino.nilai2 === dominoKiri.nilai1) posisiValid.push('kiri');
        if (domino.nilai1 === dominoKanan.nilai2) posisiValid.push('kanan');
    }

    if (posisiValid.length === 1) {
        mainDomino(index, posisiValid[0]);
    } else if (posisiValid.length > 1) {
        selectedDominoIndex = index; // Simpan index domino yang dipilih
        showModal('Pilih Posisi', 'Di mana anda mahu letakkan domino ini?');
    }
}

// Tambah fungsi pilihPosisi
function pilihPosisi(posisi) {
    if (selectedDominoIndex !== -1) {
        mainDomino(selectedDominoIndex, posisi);
        hideModal();
        selectedDominoIndex = -1;
    }
}

// Fungsi untuk show/hide modal
function showModal(title, message) {
    const modal = document.getElementById('gameModal');
    document.getElementById('modalTitle').textContent = title;
    document.getElementById('modalMessage').textContent = message;
    modal.style.display = 'flex';
}

function hideModal() {
    document.getElementById('gameModal').style.display = 'none';
}

// Fungsi untuk toast
function showToast(message, type = 'success') {
    const toast = document.getElementById('gameToast');
    toast.textContent = message;
    toast.style.background = type === 'success' ? '#2ecc71' : '#e74c3c';
    toast.style.display = 'block';
    
    setTimeout(() => {
        toast.style.display = 'none';
    }, 3000);
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
    if (!gameActive) return;

    const currentHand = players[currentPlayer];
    let mainedDomino = false;

    for (let i = 0; i < currentHand.length; i++) {
        const domino = currentHand[i];
        
        // Periksa kedua-dua orientasi domino
        for (let j = 0; j < 2; j++) {
            if (boardDominoes.length === 0) {
                currentHand.splice(i, 1);
                boardDominoes.push(domino);
                mainedDomino = true;
                break;
            }

            const dominoKiri = boardDominoes[0];
            const dominoKanan = boardDominoes[boardDominoes.length - 1];

            if (domino.nilai2 === dominoKiri.nilai1) {
                currentHand.splice(i, 1);
                boardDominoes.unshift(domino);
                mainedDomino = true;
                break;
            }

            if (domino.nilai1 === dominoKanan.nilai2) {
                currentHand.splice(i, 1);
                boardDominoes.push(domino);
                mainedDomino = true;
                break;
            }

            // Putar domino
            [domino.nilai1, domino.nilai2] = [domino.nilai2, domino.nilai1];
        }

        if (mainedDomino) break;
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

    let adaDominoValid = false;
    for (let domino of players[1]) {
        if (bolehMain(domino)) {
            adaDominoValid = true;
            break;
        }
    }

    if (adaDominoValid) {
        alert('Anda masih ada domino yang boleh dimainkan!');
        return;
    }

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

function showToast(message, type = 'success') {
    const toast = document.getElementById('gameToast');
    toast.textContent = message;
    toast.style.background = type === 'success' ? '#2ecc71' : '#e74c3c';
    toast.style.display = 'block';
    
    setTimeout(() => {
        toast.style.display = 'none';
    }, 3000);
}

function showModal(title, message) {
    const modal = document.getElementById('gameModal');
    document.getElementById('modalTitle').textContent = title;
    document.getElementById('modalMessage').textContent = message;
    modal.style.display = 'flex';
}

function hideModal() {
    document.getElementById('gameModal').style.display = 'none';
}
