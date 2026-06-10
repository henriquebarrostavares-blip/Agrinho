// Ícones do tema Agro-Sustentável
const animals = ['🐎', '🐖', '🐓', '🚜'];
const colors = ['green', 'black']; 

let deck = [];
let playerHand = [];
let opponentHand = [];
let discardPile = [];
let turn = 'player';

function initGame() {
    deck = [];
    playerHand = [];
    opponentHand = [];
    discardPile = [];
    turn = 'player';

    createFullDeck();
    shuffle(deck);
    dealCards();
    
    // Garante que a primeira carta da mesa não seja uma carta especial complexa
    let firstCard = deck.pop();
    while(typeof firstCard.value === 'string') {
        deck.unshift(firstCard);
        firstCard = deck.pop();
    }
    discardPile.push(firstCard);
    
    document.getElementById('game-status').innerText = "Sua vez! Combine cor, número ou animal.";
    render();
}

// Criação de um baralho completo (Aproximadamente 100 cartas)
function createFullDeck() {
    colors.forEach(color => {
        animals.forEach(icon => {
            // Carta 0 (Apenas uma por combinação)
            deck.push({ color, icon, value: 0 });
            
            // Cartas de 1 a 9 (Duas de cada)
            for (let i = 1; i <= 9; i++) {
                deck.push({ color, icon, value: i });
                deck.push({ color, icon, value: i });
            }
            
            // Cartas de Ação (Duas de cada)
            deck.push({ color, icon, value: '🚫' }); // Pular Turno
            deck.push({ color, icon, value: '🔃' }); // Inverter
            deck.push({ color, icon, value: '+2' }); // Comprar 2
        });
    });

    // Cartas Coringa Especiais (+4)
    for (let i = 0; i < 4; i++) {
        deck.push({ color: 'wild', icon: '🍃', value: '+4' });
    }
}

function shuffle(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
}

function dealCards() {
    // Distribui 7 cartas para cada um
    for (let i = 0; i < 7; i++) {
        playerHand.push(deck.pop());
        opponentHand.push(deck.pop());
    }
}

function render() {
    const playerArea = document.getElementById('player-hand');
    const opponentArea = document.getElementById('opponent-hand');
    const discardArea = document.getElementById('discard-pile');

    playerArea.innerHTML = '';
    playerHand.forEach((card, index) => {
        const cardEl = createCardElement(card);
        cardEl.onclick = () => playCard(index);
        playerArea.appendChild(cardEl);
    });

    opponentArea.innerHTML = '';
    opponentHand.forEach(() => {
        const cardBack = document.createElement('div');
        cardBack.className = 'card-back';
        // Miniatura para caber várias cartas na tela do oponente
        cardBack.style.width = '45px';
        cardBack.style.height = '70px';
        opponentArea.appendChild(cardBack);
    });

    discardArea.innerHTML = '';
    discardArea.appendChild(createCardElement(discardPile[discardPile.length - 1]));
}

function createCardElement(card) {
    const div = document.createElement('div');
    // Se for coringa (wild), aplica uma classe especial que mistura as cores no CSS
    div.className = `card ${card.color}`;
    div.innerHTML = `
        <div class="card-value">${card.value}</div>
        <div class="card-icon">${card.icon}</div>
    `;
    return div;
}

function playCard(index) {
    if (turn !== 'player') return;
    
    const card = playerHand[index];
    const topCard = discardPile[discardPile.length - 1];

    // Regra de validação: Cor igual, Ícone igual, Valor igual ou se for Coringa (+4)
    if (card.color === 'wild' || card.color === topCard.color || card.icon === topCard.icon || card.value === topCard.value) {
        playerHand.splice(index, 1);
        discardPile.push(card);
        
        if (checkWin('Jogador')) return;

        // Aplica o efeito das cartas especiais no Oponente
        if (card.value === '+2') {
            applyDrawPenalty(opponentHand, 2);
            document.getElementById('game-status').innerText = "Você jogou +2! Oponente comprou e perdeu o turno.";
            turn = 'player'; // Mantém o turno do jogador porque o oponente foi pular
            render();
            return;
        } else if (card.value === '+4') {
            applyDrawPenalty(opponentHand, 4);
            document.getElementById('game-status').innerText = "Coringa +4! Oponente comprou e perdeu o turno.";
            turn = 'player';
            render();
            return;
        } else if (card.value === '🚫' || card.value === '🔃') {
            document.getElementById('game-status').innerText = `Você usou ${card.value}! Oponente pulado. Jogue de novo!`;
            turn = 'player';
            render();
            return;
        }

        turn = 'opponent';
        document.getElementById('game-status').innerText = "Vez do Oponente analisando o campo...";
        setTimeout(aiTurn, 1200);
        render();
    } else {
        alert("Ação inválida! Combine cor, número, animal ou use um Coringa.");
    }
}

function aiTurn() {
    if (deck.length < 10) resetDeckPile(); // Evita que o baralho acabe

    const topCard = discardPile[discardPile.length - 1];
    // Procura carta válida na mão da IA
    const playableIndex = opponentHand.findIndex(c => 
        c.color === 'wild' || c.color === topCard.color || c.icon === topCard.icon || c.value === topCard.value
    );

    if (playableIndex !== -1) {
        const card = opponentHand.splice(playableIndex, 1)[0];
        discardPile.push(card);
        
        if (checkWin('Oponente')) return;

        // Efeitos da IA contra o Jogador
        if (card.value === '+2') {
            applyDrawPenalty(playerHand, 2);
            document.getElementById('game-status').innerText = "Oponente jogou +2! Você comprou cartas.";
            setTimeout(aiTurn, 1500); // IA joga de novo porque você foi pulado
            render();
            return;
        } else if (card.value === '+4') {
            applyDrawPenalty(playerHand, 4);
            document.getElementById('game-status').innerText = "Oponente jogou Coringa +4! Você comprou 4 cartas.";
            setTimeout(aiTurn, 1500);
            render();
            return;
        } else if (card.value === '🚫' || card.value === '🔃') {
            document.getElementById('game-status').innerText = "Oponente te pulou! Ele joga novamente.";
            setTimeout(aiTurn, 1500);
            render();
            return;
        }
    } else {
        // Se não tiver o que jogar, compra
        opponentHand.push(deck.pop());
    }

    turn = 'player';
    document.getElementById('game-status').innerText = "Sua vez! Escolha com sabedoria.";
    render();
}

function applyDrawPenalty(hand, count) {
    for (let i = 0; i < count; i++) {
        if (deck.length === 0) resetDeckPile();
        hand.push(deck.pop());
    }
}

// Recicla o lixo de descarte de volta para o deck se as cartas acabarem (Sustentabilidade!)
function resetDeckPile() {
    const topCard = discardPile.pop();
    deck = [...discardPile];
    shuffle(deck);
    discardPile = [topCard];
}

function checkWin(name) {
    if (playerHand.length === 0) {
        alert("Parabéns! Você venceu o desafio do Agro Forte e Sustentável! 🌾");
        initGame();
        return true;
    }
    if (opponentHand.length === 0) {
        alert("O Oponente venceu desta vez! Vamos praticar mais para proteger o meio ambiente.");
        initGame();
        return true;
    }
    return false;
}

// Configuração dos botões da interface
document.getElementById('draw-btn').onclick = () => {
    if (turn === 'player') {
        if (deck.length === 0) resetDeckPile();
        playerHand.push(deck.pop());
        turn = 'opponent';
        document.getElementById('game-status').innerText = "Você comprou uma carta. Vez do Oponente...";
        setTimeout(aiTurn, 1200);
        render();
    }
};

document.getElementById('deck').onclick = () => {
    document.getElementById('draw-btn').click();
};

document.getElementById('uno-btn').onclick = () => {
    if (playerHand.length === 1) {
        alert("MUITO BEM! Você gritou UNO no momento certo! 🚜💨");
    } else {
        alert("Você só pode gritar UNO se tiver exatamente 1 carta na mão!");
    }
};

// Inicia a partida com o super deck
initGame();