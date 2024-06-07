// Wait until the DOM is fully loaded
document.addEventListener('DOMContentLoaded', async function () {
    
    // Function to fetch data from a given URL and return it as JSON
    async function fetchData(url) {
        try {
            // Send a request to the given URL
            const response = await fetch(url);
            // Check if the response is not OK (status code 200-299)
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            // Return the response data as JSON
            return await response.json();
        } catch (error) {
            // Log an error message if fetching data fails
            console.error(`Error fetching data from ${url}:`, error);
        }
    }

    try {
        // Fetch the necessary JSON files in parallel
        const [listChoiceJSON, difficultyDefaultJSON] = await Promise.all([
            fetchData('assets/data/allChoices.json'),
            fetchData('assets/data/allDefault.json')
        ]);

        // Check if both JSON files are successfully fetched
        if (!listChoiceJSON || !difficultyDefaultJSON) {
            throw new Error("JSON data not available");
        }

        // Get URL parameters to determine chosen difficulty and theme
        const urlParams = new URLSearchParams(window.location.search);
        const chosenDifficulty = urlParams.get('id');
        const chosenTheme = urlParams.get('theme');

        // Get difficulty settings and theme choices from JSON data
        const difficultySettings = difficultyDefaultJSON[chosenDifficulty];
        const themeChoices = listChoiceJSON[chosenTheme];

        // Check if the chosen difficulty and theme are valid
        if (!difficultySettings || !themeChoices) {
            throw new Error("Invalid difficulty or theme settings");
        }

        // Get DOM elements for game interaction
        const mainContainer = document.getElementById('main-container');
        const gameBoard = document.getElementById('game-board');
        const timerElement = document.getElementById('timer');
        const scoreElement = document.getElementById('score');
        // Initialize score and timer variables
        let score = 0;
        let timerInterval;

        // Get the number of cards to display from the difficulty settings
        const cardCount = difficultySettings.cards;
        // Initialize an array to hold card data
        const cards = [];

        // Add pairs of cards to the cards array
        Object.keys(themeChoices).slice(0, cardCount).forEach(key => {
            const cardItem = themeChoices[key];
            cards.push(...[cardItem, cardItem]);
        });

        // Shuffle the cards array
        cards.sort(() => 0.5 - Math.random());

        // Create card elements and add them to the game board
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

        // Variables to keep track of card matching state
        let firstCard = null;
        let secondCard = null;
        let matchedPairs = 0;

        // Function to handle card click events
        function handleCardClick(cardElement) {
            // Prevent further actions if the card is already flipped or second card is not yet reset
            if (cardElement.classList.contains('flipped') || secondCard) {
                return;
            }

            // Flip the card
            cardElement.classList.add('flipped');

            // If no first card, set the clicked card as the first card
            if (!firstCard) {
                firstCard = cardElement;
            } else {
                // Set the clicked card as the second card
                secondCard = cardElement;

                // Check if the first and second cards match
                if (firstCard.innerHTML === secondCard.innerHTML) {
                    // Increment matched pairs and score
                    matchedPairs++;
                    score += 10;
                    updateScore();
                    resetCards();
                } else {
                    // Unflip the cards after a delay if they do not match
                    setTimeout(() => {
                        firstCard.classList.remove('flipped');
                        secondCard.classList.remove('flipped');
                        resetCards();
                    }, 1000);
                }

                // Check if all pairs are matched
                if (matchedPairs === cardCount) {
                    // Stop the timer for non-easy difficulty
                    if (chosenDifficulty !== 'easy') {
                        clearInterval(timerInterval);
                    }
                    // Display the end game message
                    showEndGameMessage('You Win!<br>Score: ' + score);
                }
            }
        }

        // Function to reset the first and second card variables
        function resetCards() {
            firstCard = null;
            secondCard = null;
        }

        // Function to update the score display
        function updateScore() {
            scoreElement.textContent = score;
        }

        // Function to show the end game message
        function showEndGameMessage(message) {
            // Hide the game board and score elements
            gameBoard.style.display = 'none';
            document.getElementById('scoreboard').style.display = 'none';

            // Create and display the end game message element
            const endGameMessage = document.createElement('div');
            endGameMessage.className = 'end-game-message';
            endGameMessage.innerHTML = `
                <p>${message}</p>
                <button class="button" onclick="window.location.href='index.html'">Back to Home</button>
            `;
            mainContainer.appendChild(endGameMessage);

            // Add an animation effect to the end game message
            endGameMessage.style.animation = 'zoomIn 0.5s forwards';
        }

        // If the difficulty is not 'easy', start the timer
        if (chosenDifficulty !== 'easy') {
            let timeLeft = difficultySettings.timer / 1000;
            timerElement.textContent = timeLeft;
            timerInterval = setInterval(() => {
                timeLeft--;
                timerElement.textContent = timeLeft;

                // Check if the time is up
                if (timeLeft <= 0) {
                    clearInterval(timerInterval);
                    showEndGameMessage('Time Up!<br>Score: ' + score);
                }
            }, 1000);
        } else {
            // Set the timer display to infinity for easy difficulty
            timerElement.textContent = '∞';
        }

    } catch (error) {
        // Log an error message if initialization fails
        console.error("Error during initialization:", error);
    }
});
