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
let consecutiveSkips = 0;

// Fungsi Permainan Asas
function buatDomino() {
    dominoes = [];
    for (let i = 0; i <= 6; i++) {
        for (let j = i; j <= 6; j++) {
            dominoes.push({
                atas: i,
                bawah: j,
                isRotated: false,
                nilai: i + j
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
    dominoes = dominoes.slice(28);
}

// Fungsi UI
function createDominoElement(domino, index, isAI = false) {
    const dominoDiv = document.createElement('div');
    dominoDiv.className = `domino ${isAI ? 'domino-ai' : ''}`;
    
    if (!isAI) {
        dominoDiv.onclick = () => mainDomino(index);
        
        const rotateBtn = document.createElement('button');
        rotateBtn.className = 'rotate-btn';
        rotateBtn.innerHTML = '↻';
        rotateBtn.onclick = (e) => {
            e.stopPropagation();
            putarDomino(index);
        };
        dominoDiv.appendChild(rotateBtn);
    }

    const topHalf = document.createElement('div');
    topHalf.className = 'domino-half';
    topHalf.textContent = isAI ? '?' : domino.atas;

    const bottomHalf = document.createElement('div');
    bottomHalf.className = 'domino-half';
    bottomHalf.textContent = isAI ? '?' : domino.bawah;

    dominoDiv.appendChild(topHalf);
    dominoDiv.appendChild(bottomHalf);

    return dominoDiv;
}

function updatePaparan() {
    // Update player hands
    for (let i = 1; i <= 4; i++) {
        const handContainer = document.getElementById(`player${i}Hand`);
        handContainer.innerHTML = '';
        
        players[i].forEach((domino, index) => {
            handContainer.appendChild(
                createDominoElement(domino, index, i !== 1)
            );
        });

        // Update active player highlighting
        const section = document.getElementById(`player${i}Section`);
        section.className = `player-section ${currentPlayer === i ? 'player-active' : ''}`;
    }

    // Update game board
    const boardContainer = document.getElementById('boardDominoes');
    boardContainer.innerHTML = '';
    boardDominoes.forEach((domino, index) => {
        boardContainer.appendChild(
            createDominoElement(domino, index, false)
        );
    });

    // Update status message
    const statusMessage = document.getElementById('statusMessage');
    statusMessage.textContent = gameActive 
        ? `Giliran Pemain ${currentPlayer}${currentPlayer === 1 ? ' (Anda)' : ''}`
        : 'Sila mula permainan baru';

    // Update current turn and skip count
    document.getElementById('currentTurn').textContent = currentPlayer;
    document.getElementById('skipCount').textContent = consecutiveSkips;

    // Update skip button state
    const skipBtn = document.getElementById('skipBtn');
    skipBtn.disabled = !gameActive || currentPlayer !== 1;
}

// Fungsi Permainan Utama
function mulaPemainan() {
    gameActive = true;
    skipCount = 0;
    consecutiveSkips = 0;
    currentPlayer = 1;
    boardDominoes = [];
    
    buatDomino();
    kocokDomino();
    agihDomino();
    updatePaparan();
}// Sambung script sebelumnya...

function bolehMain(domino) {
    if (boardDominoes.length === 0) return true;
    
    const firstDomino = boardDominoes[0];
    const lastDomino = boardDominoes[boardDominoes.length - 1];
    
    return (domino.atas === firstDomino.atas || 
            domino.atas === lastDomino.bawah || 
            domino.bawah === firstDomino.atas || 
            domino.bawah === lastDomino.bawah);
}

function putarDomino(index) {
    if (!gameActive || currentPlayer !== 1) return;
    
    const domino = players[1][index];
    const temp = domino.atas;
    domino.atas = domino.bawah;
    domino.bawah = temp;
    domino.isRotated = !domino.isRotated;
    updatePaparan();
}

function mainDomino(index) {
    if (!gameActive || currentPlayer !== 1) return;
    
    const domino = players[1][index];
    if (bolehMain(domino)) {
        // Main domino
        players[1].splice(index, 1);
        boardDominoes.push(domino);
        consecutiveSkips = 0;

        // Periksa menang
        if (players[1].length === 0) {
            tamatPermainan(1);
            return;
        }

        // Giliran seterusnya
        nextPlayer();
        updatePaparan();
        if (currentPlayer !== 1) {
            setTimeout(giliranAI, 1000);
        }
    } else {
        alert('Domino ini tidak boleh dimainkan! Cuba putar domino atau pilih domino lain.');
    }
}

function skipGiliran() {
    if (!gameActive || currentPlayer !== 1) return;

    // Periksa jika ada domino yang boleh dimain
    const adaDominoValid = players[1].some(domino => bolehMain(domino));
    if (adaDominoValid) {
        alert("Anda masih ada domino yang boleh dimainkan!");
        return;
    }

    consecutiveSkips++;
    if (consecutiveSkips >= 4) {
        tamatPermainan(0); // 0 bermaksud tiada pemenang
        return;
    }

    nextPlayer();
    updatePaparan();
    setTimeout(giliranAI, 1000);
}

function giliranAI() {
    if (!gameActive) return;

    const currentHand = players[currentPlayer];
    let mainedDomino = false;

    // Cuba main domino
    for (let i = 0; i < currentHand.length; i++) {
        if (bolehMain(currentHand[i])) {
            const domino = currentHand[i];
            currentHand.splice(i, 1);
            boardDominoes.push(domino);
            mainedDomino = true;
            consecutiveSkips = 0;
            
            // Periksa menang
            if (currentHand.length === 0) {
                tamatPermainan(currentPlayer);
                return;
            }
            break;
        }
    }

    // Jika tak boleh main
    if (!mainedDomino) {
        consecutiveSkips++;
        if (consecutiveSkips >= 4) {
            tamatPermainan(0);
            return;
        }
    }

    nextPlayer();
    updatePaparan();

    // Teruskan ke AI seterusnya jika bukan giliran pemain
    if (currentPlayer !== 1 && gameActive) {
        setTimeout(giliranAI, 1000);
    }
}

function nextPlayer() {
    currentPlayer = currentPlayer % 4 + 1;
}

function kiraSkor(playerHand) {
    return playerHand.reduce((total, domino) => total + domino.atas + domino.bawah, 0);
}

function tamatPermainan(pemenang) {
    gameActive = false;
    let mesej = '';

    if (pemenang === 0) {
        mesej = "Permainan tamat kerana semua pemain skip!\n\n";
    } else {
        mesej = `Pemain ${pemenang}${pemenang === 1 ? ' (Anda)' : ''} Menang!\n\n`;
    }

    // Kira skor akhir
    mesej += "Skor Akhir:\n";
    for (let i = 1; i <= 4; i++) {
        const skor = kiraSkor(players[i]);
        mesej += `Pemain ${i}${i === 1 ? ' (Anda)' : ''}: ${skor} mata\n`;
    }

    alert(mesej);
    updatePaparan();
}

// Tambah event listener untuk butang
document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('skipBtn').disabled = true;
});