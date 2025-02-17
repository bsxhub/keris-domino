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
let selectedDominoIndex = -1;

// Fungsi Permainan Asas
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

// Fungsi UI
function tunjukDomino(domino, index, isPlayer = false) {
    // Untuk domino pemain (yang boleh diklik)
    if (isPlayer) {
        return `
            <div class="domino" onclick="pilihDomino(${index})">
                <button class="rotate-btn" onclick="putarDomino(${index}, event)">↻</button>
                <div class="domino-half">${domino.nilai1}</div>
                <div class="domino-half">${domino.nilai2}</div>
            </div>
        `;
    }
    // Untuk domino AI (tersembunyi)
    else {
        return `
            <div class="domino domino-ai">
                <div class="domino-half">?</div>
                <div class="domino-half">?</div>
            </div>
        `;
    }
}

function tunjukDominoPapan(domino) {
    return `
        <div class="domino domino-board">
            <div class="domino-half">${domino.nilai1}</div>
            <div class="domino-half">${domino.nilai2}</div>
        </div>
    `;
}

function updatePaparan() {
    // Update tangan pemain utama (Pemain 1)
    document.getElementById('player1Hand').innerHTML = 
        players[1].map((d, i) => tunjukDomino(d, i, true)).join('');

    // Update tangan AI (Pemain 2-4)
    for (let i = 2; i <= 4; i++) {
        const aiHand = document.getElementById(`player${i}Hand`);
        if (aiHand) {
            aiHand.innerHTML = Array(players[i].length)
                .fill(null)
                .map(() => tunjukDomino(null, -1, false))
                .join('');
        }
    }

    // Update papan permainan
    const boardContainer = document.getElementById('boardDominoes');
    if (boardContainer) {
        boardContainer.innerHTML = boardDominoes.map(d => tunjukDominoPapan(d)).join('');
    }

    // Update status permainan
    document.getElementById('statusMessage').textContent = 
        gameActive ? `Giliran Pemain ${currentPlayer}` : 'Sila mula permainan baru';

    // Update jumlah domino setiap pemain
    for (let i = 2; i <= 4; i++) {
        const playerSection = document.getElementById(`player${i}Section`);
        if (playerSection) {
            const playerName = playerSection.querySelector('.player-name');
            if (playerName) {
                playerName.textContent = `Pemain ${i} (${players[i].length} domino)`;
            }
        }
    }

    // Update status butang skip
    const skipBtn = document.getElementById('skipBtn');
    if (skipBtn) {
        skipBtn.disabled = !gameActive || currentPlayer !== 1;
    }

    // Update highlighting pemain aktif
    for (let i = 1; i <= 4; i++) {
        const section = document.getElementById(`player${i}Section`);
        if (section) {
            section.classList.toggle('player-active', currentPlayer === i);
        }
    }

    // Update skip count
    const skipCountElement = document.getElementById('skipCount');
    if (skipCountElement) {
        skipCountElement.textContent = skipCount;
    }

    // Update current turn
    const currentTurnElement = document.getElementById('currentTurn');
    if (currentTurnElement) {
        currentTurnElement.textContent = currentPlayer;
    }
}

// Fungsi Permainan
function bolehMain(domino) {
    if (boardDominoes.length === 0) return true;

    const dominoKiri = boardDominoes[0];
    const dominoKanan = boardDominoes[boardDominoes.length - 1];

    return (domino.nilai1 === dominoKiri.nilai1 ||
            domino.nilai2 === dominoKiri.nilai1 ||
            domino.nilai1 === dominoKanan.nilai2 ||
            domino.nilai2 === dominoKanan.nilai2);
}

function putarDomino(index, event) {
    if (event) event.stopPropagation();
    if (!gameActive || currentPlayer !== 1) return;

    const domino = players[1][index];
    [domino.nilai1, domino.nilai2] = [domino.nilai2, domino.nilai1];
    updatePaparan();
    showToast('Domino diputarkan! 🔄', 'info');
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

    if (posisiValid.length === 1) {
        mainDomino(index, posisiValid[0]);
    } else if (posisiValid.length > 1) {
        selectedDominoIndex = index;
        showModal('Pilih Posisi', 'Di mana anda mahu letakkan domino ini?');
    }
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
        showToast('Tahniah! Anda Menang! 🎉', 'success', 5000);
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
            showToast('Permainan tamat - Tiada pemain boleh main! 🏁', 'info', 5000);
            gameActive = false;
            return;
        }
        showToast(`Pemain ${currentPlayer} melepaskan giliran`, 'info');
    } else {
        skipCount = 0;
        if (currentHand.length === 0) {
            showToast(`Pemain ${currentPlayer} Menang! 🎮`, 'success', 5000);
            gameActive = false;
            return;
        }
        showToast(`Pemain ${currentPlayer} telah bermain`, 'info');
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
        showToast('Anda masih ada domino yang boleh dimainkan! 🤔', 'warning');
        return;
    }

    skipCount++;
    if (skipCount >= 4) {
        showToast('Permainan tamat - Tiada pemain boleh main! 🏁', 'info', 5000);
        gameActive = false;
        return;
    }

    showToast('Giliran dilepaskan...', 'info');
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
    showToast('Permainan baru dimulakan! 🎲', 'success');
}

// Fungsi UI Tambahan
function showToast(message, type = 'info', duration = 3000) {
    const toast = document.getElementById('gameToast');
    toast.textContent = message;
    
    switch(type) {
        case 'success':
            toast.style.background = '#2ecc71';
            break;
        case 'error':
            toast.style.background = '#e74c3c';
            break;
        case 'warning':
            toast.style.background = '#f1c40f';
            break;
        default:
            toast.style.background = '#3498db';
    }
    
    toast.style.display = 'block';
    
    setTimeout(() => {
        toast.style.display = 'none';
    }, duration);
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

function pilihPosisi(posisi) {
    if (selectedDominoIndex !== -1) {
        mainDomino(selectedDominoIndex, posisi);
        hideModal();
        selectedDominoIndex = -1;
    }
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('skipBtn').disabled = true;
});