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
// Tambah di bahagian atas file, selepas variables global sedia ada

// Sound Effects
const sounds = {
    playDomino: new Audio('sounds/play.mp3'), //Sound Effect by <a href="https://pixabay.com/users/universfield-28281460/?utm_source=link-attribution&utm_medium=referral&utm_campaign=music&utm_content=144751">Universfield</a> from <a href="https://pixabay.com/sound-effects//?utm_source=link-attribution&utm_medium=referral&utm_campaign=music&utm_content=144751">Pixabay</a>
    rotate: new Audio('sounds/rotate.mp3'),//Sound Effect by <a href="https://pixabay.com/users/freesound_community-46691455/?utm_source=link-attribution&utm_medium=referral&utm_campaign=music&utm_content=46134">freesound_community</a> from <a href="https://pixabay.com/sound-effects//?utm_source=link-attribution&utm_medium=referral&utm_campaign=music&utm_content=46134">Pixabay</a>
    win: new Audio('sounds/win.mp3'), //Sound Effect by <a href="https://pixabay.com/users/floraphonic-38928062/?utm_source=link-attribution&utm_medium=referral&utm_campaign=music&utm_content=183949">floraphonic</a> from <a href="https://pixabay.com//?utm_source=link-attribution&utm_medium=referral&utm_campaign=music&utm_content=183949">Pixabay</a>
    error: new Audio('sounds/error.mp3') //Sound Effect by <a href="https://pixabay.com/users/u_8g40a9z0la-45586904/?utm_source=link-attribution&utm_medium=referral&utm_campaign=music&utm_content=234711">u_8g40a9z0la</a> from <a href="https://pixabay.com/sound-effects//?utm_source=link-attribution&utm_medium=referral&utm_campaign=music&utm_content=234711">Pixabay</a>
};

// Game Statistics
let stats = {
    gamesPlayed: 0,
    wins: {1: 0, 2: 0, 3: 0, 4: 0},
    totalDominoesPlayed: 0,
    longestGame: 0
};

// Scores
let scores = {
    1: 0,
    2: 0,
    3: 0,
    4: 0
};

// Game Settings
let aiDifficulty = 'medium';
let gameMode = 'singleplayer';
let soundEnabled = true;

// Achievements
const achievements = {
    firstWin: {
        title: "Kemenangan Pertama",
        description: "Menang permainan pertama anda",
        unlocked: false
    },
    perfectGame: {
        title: "Permainan Sempurna",
        description: "Menang tanpa skip",
        unlocked: false
    },
    dominoMaster: {
        title: "Master Domino",
        description: "Menang 10 permainan",
        unlocked: false
    }
};

// Tutorial Steps
const tutorialSteps = [
    {
        message: "Selamat datang ke permainan Domino!",
        element: "#gameBoard"
    },
    {
        message: "Klik domino untuk memainkannya",
        element: "#player1Hand"
    },
    {
        message: "Gunakan butang putar untuk memutar domino",
        element: ".rotate-btn"
    }
];

// Tambah fungsi-fungsi baru

function playSound(soundName) {
    if (soundEnabled && sounds[soundName]) {
        sounds[soundName].play();
    }
}

function updateScores() {
    for (let i = 1; i <= 4; i++) {
        const dominoPoints = players[i].reduce((total, domino) => 
            total + domino.nilai1 + domino.nilai2, 0);
        scores[i] += dominoPoints;
    }
    updateScoreDisplay();
}

function updateScoreDisplay() {
    for (let i = 1; i <= 4; i++) {
        const scoreElement = document.getElementById(`player${i}Score`);
        if (scoreElement) {
            scoreElement.textContent = scores[i];
        }
    }
}

function simpanPermainan() {
    const gameState = {
        players,
        boardDominoes,
        currentPlayer,
        gameActive,
        skipCount,
        scores,
        stats
    };
    localStorage.setItem('dominoGameState', JSON.stringify(gameState));
    showToast('Permainan disimpan! 💾', 'success');
}

function muatPermainan() {
    const savedState = localStorage.getItem('dominoGameState');
    if (savedState) {
        const gameState = JSON.parse(savedState);
        players = gameState.players;
        boardDominoes = gameState.boardDominoes;
        currentPlayer = gameState.currentPlayer;
        gameActive = gameState.gameActive;
        skipCount = gameState.skipCount;
        scores = gameState.scores;
        stats = gameState.stats;
        updatePaparan();
        showToast('Permainan dimuat! 📂', 'success');
    } else {
        showToast('Tiada permainan tersimpan!', 'error');
    }
}

function setAIDifficulty(level) {
    aiDifficulty = level;
    showToast(`Tahap kesukaran AI diubah ke ${level}`, 'info');
}

function toggleSound() {
    soundEnabled = !soundEnabled;
    showToast(soundEnabled ? 'Bunyi dihidupkan 🔊' : 'Bunyi dimatikan 🔇', 'info');
}

function startTutorial() {
    let currentStep = 0;
    
    function showStep() {
        if (currentStep >= tutorialSteps.length) {
            showToast('Tutorial tamat!', 'success');
            return;
        }

        const step = tutorialSteps[currentStep];
        showToast(step.message, 'info', 5000);
        
        // Highlight element
        const element = document.querySelector(step.element);
        if (element) {
            element.classList.add('tutorial-highlight');
            setTimeout(() => {
                element.classList.remove('tutorial-highlight');
                currentStep++;
                showStep();
            }, 5000);
        }
    }

    showStep();
}

function checkAchievements(winner) {
    if (winner) {
        if (!achievements.firstWin.unlocked) {
            achievements.firstWin.unlocked = true;
            showToast('🏆 Pencapaian Dibuka: ' + achievements.firstWin.title, 'success', 5000);
        }

        if (skipCount === 0 && !achievements.perfectGame.unlocked) {
            achievements.perfectGame.unlocked = true;
            showToast('🏆 Pencapaian Dibuka: ' + achievements.perfectGame.title, 'success', 5000);
        }

        stats.wins[winner]++;
        if (stats.wins[winner] >= 10 && !achievements.dominoMaster.unlocked) {
            achievements.dominoMaster.unlocked = true;
            showToast('🏆 Pencapaian Dibuka: ' + achievements.dominoMaster.title, 'success', 5000);
        }
    }

    stats.gamesPlayed++;
    stats.totalDominoesPlayed += boardDominoes.length;
    if (boardDominoes.length > stats.longestGame) {
        stats.longestGame = boardDominoes.length;
    }

    // Simpan stats
    localStorage.setItem('dominoStats', JSON.stringify(stats));
    localStorage.setItem('dominoAchievements', JSON.stringify(achievements));
}

// Modify existing functions to include new features

// Dalam fungsi mainDomino, tambah:
function mainDomino(index, posisi) {
    // ... kod sedia ada ...
    playSound('playDomino');
    // ... kod sedia ada ...
}

// Dalam fungsi putarDomino, tambah:
function putarDomino(index, event) {
    // ... kod sedia ada ...
    playSound('rotate');
    // ... kod sedia ada ...
}

// Dalam fungsi tamatPermainan atau bila menang, tambah:
function tamatPermainan(winner) {
    // ... kod sedia ada ...
    playSound('win');
    updateScores();
    checkAchievements(winner);
    // ... kod sedia ada ...
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    // Load saved stats and achievements
    const savedStats = localStorage.getItem('dominoStats');
    if (savedStats) {
        stats = JSON.parse(savedStats);
    }

    const savedAchievements = localStorage.getItem('dominoAchievements');
    if (savedAchievements) {
        Object.assign(achievements, JSON.parse(savedAchievements));
    }

    // Initialize UI
    document.getElementById('skipBtn').disabled = true;
    
    // Add event listeners for new features
    document.getElementById('saveBtn')?.addEventListener('click', simpanPermainan);
    document.getElementById('loadBtn')?.addEventListener('click', muatPermainan);
    document.getElementById('soundBtn')?.addEventListener('click', toggleSound);
    document.getElementById('tutorialBtn')?.addEventListener('click', startTutorial);
});

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