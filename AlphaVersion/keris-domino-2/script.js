// script.js
let dominoes = [];
let playerHand = [];
let gameBoard = [];

function createDominoes() {
    // Buat set domino (0-6)
    for (let i = 0; i <= 6; i++) {
        for (let j = i; j <= 6; j++) {
            dominoes.push({top: i, bottom: j});
        }
    }
}

function shuffleDominoes() {
    for (let i = dominoes.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [dominoes[i], dominoes[j]] = [dominoes[j], dominoes[i]];
    }
}

function dealDominoes() {
    playerHand = dominoes.slice(0, 7);
    dominoes = dominoes.slice(7);
}

function renderDomino(domino) {
    return `
        <div class="domino">
            <div>${domino.top}</div>
            <div>${domino.bottom}</div>
        </div>
    `;
}

function renderGame() {
    const boardElement = document.getElementById('game-board');
    const handElement = document.getElementById('player-hand');

    boardElement.innerHTML = gameBoard.map(renderDomino).join('');
    handElement.innerHTML = playerHand.map(renderDomino).join('');
}

function startGame() {
    dominoes = [];
    playerHand = [];
    gameBoard = [];
    
    createDominoes();
    shuffleDominoes();
    dealDominoes();
    renderGame();
}