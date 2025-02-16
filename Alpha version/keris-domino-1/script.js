class KerisDomino {
    constructor() {
        this.deck = this.generateDeck();
        this.playerHand = [];
        this.aiHand = [];
        this.board = [];
        this.currentTurn = "player";

        this.dealTiles();
        this.updateUI();
    }

    generateDeck() {
        let deck = [];
        for (let i = 0; i <= 6; i++) {
            for (let j = i; j <= 6; j++) {
                deck.push([i, j]);
            }
        }
        return this.shuffle(deck);
    }

    shuffle(deck) {
        for (let i = deck.length - 1; i > 0; i--) {
            let j = Math.floor(Math.random() * (i + 1));
            [deck[i], deck[j]] = [deck[j], deck[i]];
        }
        return deck;
    }

    dealTiles() {
        for (let i = 0; i < 7; i++) {
            this.playerHand.push(this.deck.pop());
            this.aiHand.push(this.deck.pop());
        }
    }

    playTile(player, tileIndex) {
        let tile = player === "player" ? this.playerHand[tileIndex] : this.aiHand[tileIndex];

        if (this.board.length === 0 || this.isValidMove(tile)) {
            this.board.push(tile);
            player === "player" ? this.playerHand.splice(tileIndex, 1) : this.aiHand.splice(tileIndex, 1);
            this.currentTurn = player === "player" ? "ai" : "player";

            this.updateUI();

            if (this.currentTurn === "ai") {
                setTimeout(() => this.aiTurn(), 1000);
            }
        } else {
            alert("Langkah tidak sah!");
        }
    }

    isValidMove(tile) {
        if (this.board.length === 0) return true;

        let leftEnd = this.board[0][0];
        let rightEnd = this.board[this.board.length - 1][1];
        return tile.includes(leftEnd) || tile.includes(rightEnd);
    }

    aiTurn() {
        if (this.currentTurn !== "ai") return;

        let validMoves = this.aiHand.map((tile, index) => ({ tile, index }))
            .filter(({ tile }) => this.isValidMove(tile));

        if (validMoves.length > 0) {
            let { index } = validMoves[Math.floor(Math.random() * validMoves.length)];
            this.playTile("ai", index);
        } else {
            alert("AI tidak boleh main, giliran pemain!");
            this.currentTurn = "player";
        }

        this.updateUI();
    }

    drawTile(player) {
        if (this.deck.length === 0) {
            alert("Tiada lagi kepingan untuk diambil!");
            return;
        }
        let tile = this.deck.pop();
        player === "player" ? this.playerHand.push(tile) : this.aiHand.push(tile);
        this.updateUI();
    }

    updateUI() {
        let boardElement = document.getElementById("game-board");
        let playerHandElement = document.getElementById("player-hand");

        boardElement.innerHTML = this.board.map(tile => `<div class="tile">${tile[0]} | ${tile[1]}</div>`).join("");
        playerHandElement.innerHTML = this.playerHand.map((tile, index) => 
            `<div class="tile" onclick="game.playTile('player', ${index})">${tile[0]} | ${tile[1]}</div>`
        ).join("");

        if (this.checkWin()) {
            setTimeout(() => alert("Permainan Tamat!"), 500);
        }
    }

    checkWin() {
        if (this.playerHand.length === 0) {
            alert("Pemain menang!");
            return true;
        }
        if (this.aiHand.length === 0) {
            alert("AI menang!");
            return true;
        }
        return false;
    }
}

// Inisialisasi permainan
let game = new KerisDomino();

document.getElementById("draw-btn").addEventListener("click", () => game.drawTile("player"));
