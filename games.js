// Weather Memory Game
function startMemoryGame() {
    const modal = document.createElement('div');
    modal.className = 'game-modal active';
    modal.innerHTML = `
        <div class="game-content">
            <button class="close-game">&times;</button>
            <h2>Weather Memory Game</h2>
            <div class="memory-grid"></div>
            <div class="game-message"></div>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    const weatherIcons = [
        'fa-cloud-sun', 'fa-cloud-rain', 'fa-snowflake',
        'fa-bolt', 'fa-wind', 'fa-sun', 'fa-cloud',
        'fa-cloud-showers-heavy'
    ];
    
    const cards = [...weatherIcons, ...weatherIcons]
        .sort(() => Math.random() - 0.5)
        .map((icon, index) => ({
            id: index,
            icon: icon,
            isFlipped: false,
            isMatched: false
        }));
    
    const grid = modal.querySelector('.memory-grid');
    let flippedCards = [];
    let matchedPairs = 0;
    
    cards.forEach(card => {
        const cardElement = document.createElement('div');
        cardElement.className = 'memory-card';
        cardElement.dataset.id = card.id;
        
        cardElement.innerHTML = `
            <div class="memory-card-front">
                <i class="fas fa-question"></i>
            </div>
            <div class="memory-card-back">
                <i class="fas ${card.icon}"></i>
            </div>
        `;
        
        cardElement.addEventListener('click', () => {
            if (flippedCards.length === 2 || card.isFlipped || card.isMatched) return;
            
            card.isFlipped = true;
            flippedCards.push(card);
            cardElement.classList.add('flipped');
            
            if (flippedCards.length === 2) {
                const [card1, card2] = flippedCards;
                
                if (card1.icon === card2.icon) {
                    card1.isMatched = card2.isMatched = true;
                    matchedPairs++;
                    
                    if (matchedPairs === weatherIcons.length) {
                        const message = modal.querySelector('.game-message');
                        message.textContent = 'Congratulations! You won!';
                        message.classList.add('success');
                    }
                } else {
                    setTimeout(() => {
                        card1.isFlipped = card2.isFlipped = false;
                        document.querySelector(`[data-id="${card1.id}"]`).classList.remove('flipped');
                        document.querySelector(`[data-id="${card2.id}"]`).classList.remove('flipped');
                    }, 1000);
                }
                
                flippedCards = [];
            }
        });
        
        grid.appendChild(cardElement);
    });
    
    modal.querySelector('.close-game').addEventListener('click', () => {
        modal.remove();
    });
}

// Word Scramble Game
function startWordScramble() {
    const words = [
        'RAINBOW', 'THUNDER', 'LIGHTNING', 'CLOUDY',
        'SUNNY', 'STORM', 'WINDY', 'FOGGY',
        'SNOW', 'HUMID', 'DRIZZLE', 'BREEZE'
    ];
    
    const modal = document.createElement('div');
    modal.className = 'game-modal active';
    modal.innerHTML = `
        <div class="game-content">
            <button class="close-game">&times;</button>
            <h2>Weather Word Scramble</h2>
            <div class="word-scramble-container">
                <div class="game-score">Score: <span id="score">0</span></div>
                <div class="scrambled-word"></div>
                <input type="text" class="answer-input" placeholder="Enter your answer">
                <button class="btn" id="submit-answer">Submit</button>
                <div class="game-message"></div>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    let score = 0;
    let currentWord = '';
    
    function scrambleWord(word) {
        return word.split('').sort(() => Math.random() - 0.5).join('');
    }
    
    function newRound() {
        currentWord = words[Math.floor(Math.random() * words.length)];
        let scrambledWord = scrambleWord(currentWord);
        
        while (scrambledWord === currentWord) {
            scrambledWord = scrambleWord(currentWord);
        }
        
        modal.querySelector('.scrambled-word').textContent = scrambledWord;
        modal.querySelector('.answer-input').value = '';
        modal.querySelector('.game-message').className = 'game-message';
    }
    
    function checkAnswer() {
        const answer = modal.querySelector('.answer-input').value.toUpperCase();
        const message = modal.querySelector('.game-message');
        
        if (answer === currentWord) {
            score += 10;
            modal.querySelector('#score').textContent = score;
            message.textContent = 'Correct! Well done!';
            message.className = 'game-message success';
            setTimeout(newRound, 1500);
        } else {
            message.textContent = 'Try again!';
            message.className = 'game-message error';
        }
    }
    
    modal.querySelector('#submit-answer').addEventListener('click', checkAnswer);
    modal.querySelector('.answer-input').addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            checkAnswer();
        }
    });
    
    modal.querySelector('.close-game').addEventListener('click', () => {
        modal.remove();
    });
    
    newRound();
}
