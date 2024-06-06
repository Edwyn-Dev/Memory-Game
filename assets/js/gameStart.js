document.addEventListener('DOMContentLoaded', async function () {
    // Fonction pour récupérer les données JSON avec gestion des erreurs
    async function fetchData(url) {
        try {
            const response = await fetch(url);
            if (!response.ok) {
                throw new Error(`Erreur HTTP ! statut : ${response.status}`);
            }
            return await response.json();
        } catch (error) {
            console.error(`Erreur lors de la récupération des données depuis ${url}:`, error);
        }
    }

    try {
        // Récupération des données en parallèle
        const [listChoiceJSON, difficultyDefaultJSON] = await Promise.all([
            fetchData('assets/data/allChoices.json'),
            fetchData('assets/data/allDefault.json')
        ]);

        if (!listChoiceJSON || !difficultyDefaultJSON) {
            throw new Error("Données JSON non disponibles");
        }

        // Récupération des informations de l'URL
        const urlParams = new URLSearchParams(window.location.search);
        const chosenDifficulty = urlParams.get('id');
        const chosenTheme = urlParams.get('theme');
        const difficultySettings = difficultyDefaultJSON[chosenDifficulty];
        const themeChoices = listChoiceJSON[chosenTheme];

        if (!difficultySettings || !themeChoices) {
            throw new Error("Paramètres de difficulté ou de thème non valides");
        }

        const mainContainer = document.getElementById('main-container');
        const gameBoard = document.getElementById('game-board');
        const timerElement = document.getElementById('timer');
        const scoreElement = document.getElementById('score');
        let score = 0;
        let timerInterval;

        // Initialisation du jeu
        const cardCount = difficultySettings.cards;
        const cards = [];

        // Création des cartes en fonction des choix
        Object.keys(themeChoices).slice(0, cardCount).forEach(key => {
            const cardItem = themeChoices[key];
            cards.push(...[cardItem, cardItem]); // Doubler les cartes pour les paires
        });

        // Mélanger les cartes
        cards.sort(() => 0.5 - Math.random());

        // Générer les éléments HTML des cartes
        cards.forEach((card, index) => {
            const cardElement = document.createElement('div');
            cardElement.className = 'card';
            cardElement.innerHTML = `
                <div class="card-inner">
                    <div class="card-front">${card[1]}</div>
                    <div class="card-back">?</div>
                </div>
            `;
            cardElement.addEventListener('click', () => handleCardClick(cardElement));
            gameBoard.appendChild(cardElement);
        });

        let firstCard = null;
        let secondCard = null;
        let matchedPairs = 0;

        function handleCardClick(cardElement) {
            if (cardElement.classList.contains('flipped') || secondCard) {
                return;
            }

            cardElement.classList.add('flipped');

            if (!firstCard) {
                firstCard = cardElement;
            } else {
                secondCard = cardElement;

                if (firstCard.innerHTML === secondCard.innerHTML) {
                    matchedPairs++;
                    score += 10;
                    updateScore();
                    resetCards();
                } else {
                    setTimeout(() => {
                        firstCard.classList.remove('flipped');
                        secondCard.classList.remove('flipped');
                        resetCards();
                    }, 1000);
                }

                if (matchedPairs === cardCount) {
                    if (chosenDifficulty !== 'easy') {
                        clearInterval(timerInterval);
                    }
                    showEndGameMessage('Vous avez gagné !<br>Score: ' + score);
                }
            }
        }

        function resetCards() {
            firstCard = null;
            secondCard = null;
        }

        function updateScore() {
            scoreElement.textContent = score;
        }

        // Fonction pour afficher le message de fin de jeu
        function showEndGameMessage(message) {
            gameBoard.style.display = 'none';
            document.getElementById('scoreboard').style.display = 'none';

            const endGameMessage = document.createElement('div');
            endGameMessage.className = 'end-game-message';
            endGameMessage.innerHTML = `
                <p>${message}</p>
                <button class="button" onclick="window.location.href='index.html'">BACK TO HOME</button>
            `;
            mainContainer.appendChild(endGameMessage);

            // Ajout d'une animation pour le zoom
            endGameMessage.style.animation = 'zoomIn 0.5s forwards';
        }

        // Gestion du timer
        if (chosenDifficulty !== 'easy') {
            let timeLeft = difficultySettings.timer / 1000;
            timerElement.textContent = timeLeft;
            timerInterval = setInterval(() => {
                timeLeft--;
                timerElement.textContent = timeLeft;

                if (timeLeft <= 0) {
                    clearInterval(timerInterval);
                    showEndGameMessage('Temps écoulé !<br>Score: ' + score);
                }
            }, 1000);
        } else {
            timerElement.textContent = '∞';
        }

    } catch (error) {
        console.error("Erreur lors de l'initialisation:", error);
    }
});
