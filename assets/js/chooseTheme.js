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

        // Ajout dynamique des boutons
        const areaButton = document.getElementById('choose-choice-button');
        const displayChoice = document.getElementById('display-choice');
        const displayChoiceTitle = document.querySelector('#display-choice-content h1');
        const displayChoiceList = document.querySelector('#display-choice-content ul');
        const displayChoiceLink = document.querySelector('#display-choice-content a');
        const allChoice = ["fruits", "nourriture", "boissons", "animaux"];

        // Création des boutons en utilisant `forEach` pour une meilleure lisibilité
        allChoice.forEach(choice => {
            const button = document.createElement('button');
            button.id = choice;
            button.className = 'button';
            button.textContent = choice.toUpperCase();
            button.addEventListener('click', () => {
                displayChoice.style.display = 'block';
                displayChoiceTitle.textContent = choice.toUpperCase();
                displayChoiceList.innerHTML = ''; // Clear previous list

                const choiceItems = listChoiceJSON[choice];
                if (choiceItems && typeof choiceItems === 'object') {
                    Object.keys(choiceItems).forEach(item => {
                        const listItem = document.createElement('li');
                        listItem.textContent = `${choiceItems[item][0]} ${choiceItems[item][1]}`;
                        displayChoiceList.appendChild(listItem);
                    });
                } else {
                    console.error(`Les données pour ${choice} ne sont pas un objet.`);
                }

                displayChoiceLink.href = `gameStart.html?id=${chosenDifficulty}&theme=${choice}`;
            });
            areaButton.appendChild(button);
        });
    } catch (error) {
        console.error("Erreur lors de l'initialisation:", error);
    }
});
