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

        // Get URL parameters to determine chosen difficulty
        const urlParams = new URLSearchParams(window.location.search);
        const chosenDifficulty = urlParams.get('id');

        // Get DOM elements for later manipulation
        const areaButton = document.getElementById('choose-choice-button');
        const displayChoice = document.getElementById('display-choice');
        const displayChoiceTitle = document.querySelector('#display-choice-content h1');
        const displayChoiceList = document.querySelector('#display-choice-content ul');
        const displayChoiceLink = document.querySelector('#display-choice-content a');
        // List of all possible choices
        const allChoice = ["fruits", "food", "drinks", "animals"];

        // Create a button for each choice
        allChoice.forEach(choice => {
            // Create button element
            const button = document.createElement('button');
            // Set button attributes and text
            button.id = choice;
            button.className = 'button';
            button.textContent = choice.toUpperCase();
            // Add click event listener to the button
            button.addEventListener('click', () => {
                // Show the choice display section
                displayChoice.style.display = 'block';
                // Set the title to the chosen choice
                displayChoiceTitle.textContent = choice.toUpperCase();
                // Clear any previous choice list
                displayChoiceList.innerHTML = '';

                // Get items for the chosen choice from the JSON data
                const choiceItems = listChoiceJSON[choice];
                if (choiceItems && typeof choiceItems === 'object') {
                    // Add each item to the choice list
                    Object.keys(choiceItems).forEach(item => {
                        const listItem = document.createElement('li');
                        listItem.textContent = `${choiceItems[item][0]} ${choiceItems[item][1]}`;
                        displayChoiceList.appendChild(listItem);
                    });
                } else {
                    console.error(`Data for ${choice} is not an object.`);
                }

                // Set the link for starting the game with the chosen difficulty and theme
                displayChoiceLink.href = `gameStart.html?id=${chosenDifficulty}&theme=${choice}`;
            });
            // Append the button to the button area
            areaButton.appendChild(button);
        });
    } catch (error) {
        // Log an error message if initialization fails
        console.error("Error during initialization:", error);
    }
});
