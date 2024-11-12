// Wait for the DOM to be fully loaded
document.addEventListener('DOMContentLoaded', function() {
    // Add event listener to search button
    const searchButton = document.querySelector('.search-button');
    if (searchButton) {
        searchButton.addEventListener('click', searchCard);
    }

    // Add event listener to search input for Enter key
    const searchInput = document.getElementById('cardSearch');
    if (searchInput) {
        searchInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                searchCard();
            }
        });
    }

    initGame();
});

function searchCard() {
    const searchInput = document.getElementById('cardSearch');
    const cardNumber = parseInt(searchInput.value);
    
    if (cardNumber < 1 || cardNumber > 522 || isNaN(cardNumber)) {
        alert('Please enter a valid card number between 1-522');
        return;
    }

    // Calculate inscription number
    const inscriptionStart = 109748927;
    const inscriptionNumber = inscriptionStart + (cardNumber - 1);
    
    // Remove existing search result if any
    const existingResult = document.querySelector('.search-result');
    if (existingResult) {
        existingResult.remove();
    }

    // Create the search result container with explicit z-index
    const resultContainer = document.createElement('div');
    resultContainer.className = 'search-result';
    resultContainer.style.zIndex = '100000'; // Ensure it's above other elements

    // Create close button
    const closeButton = document.createElement('span');
    closeButton.className = 'close-button';
    closeButton.innerHTML = '×';
    closeButton.onclick = () => resultContainer.remove();

    // Create image
    const img = document.createElement('img');
    img.src = `https://bafybeidm3sremjulcdqefulerybnjqtzcf2o3vvyu5ayg35lbthmhxs5hi.ipfs.dweb.link/${cardNumber}.png`;
    img.alt = `Crudeboy #${cardNumber}`;
    img.style.cursor = 'pointer';
    
    // Add direct click handler to image with stopPropagation
    img.onclick = function(e) {
        e.stopPropagation();
        window.open(`https://doge.ordinalswallet.com/inscription/${inscriptionNumber}`, '_blank');
    };

    // Create card details
    const detailsDiv = document.createElement('div');
    detailsDiv.className = 'card-details';
    
    const linksDiv = document.createElement('div');
    linksDiv.className = 'card-links';

    detailsDiv.innerHTML = `
        <h2>Crudeboy #${cardNumber}</h2>
        <p>Inscription #${inscriptionNumber}</p>
    `;

    linksDiv.innerHTML = `
        <a href="https://doge.ordinalswallet.com/inscription/${inscriptionNumber}" target="_blank">View on Ordinals Explorer</a>
        <a href="https://doggy.market/inscription/${inscriptionNumber}" target="_blank">View on Doggy Market</a>
    `;

    // Assemble the components
    resultContainer.appendChild(closeButton);
    resultContainer.appendChild(img);
    resultContainer.appendChild(detailsDiv);
    resultContainer.appendChild(linksDiv);

    // Add to document
    document.body.appendChild(resultContainer);

    // Prevent clicks inside modal from closing it
    resultContainer.onclick = function(e) {
        e.stopPropagation();
    };

    // Add click event to close when clicking outside
    document.addEventListener('click', function closeModal(e) {
        if (!resultContainer.contains(e.target)) {
            resultContainer.remove();
            document.removeEventListener('click', closeModal);
        }
    });

    // Add explicit styles to ensure clickability
    resultContainer.style.cssText += `
        pointer-events: auto;
        cursor: default;
        user-select: none;
        -webkit-user-select: none;
    `;

    img.style.cssText += `
        pointer-events: auto;
        user-select: none;
        -webkit-user-select: none;
        max-width: 300px;
        height: auto;
        display: block;
        margin: 0 auto;
        transition: opacity 0.2s;
    `;

    // Add hover effect
    img.onmouseover = () => img.style.opacity = '0.8';
    img.onmouseout = () => img.style.opacity = '1';
}

function initGame() {
    const gameState = {
        board: Array(9).fill(''),
        currentPlayer: 'X',
        gameActive: true
    };

    const statusDisplay = document.querySelector('.game-status');
    const cells = document.querySelectorAll('.cell');
    const restartButton = document.querySelector('.restart-button');

    function handleCellClick(e) {
        const cell = e.target;
        const index = parseInt(cell.getAttribute('data-index'));

        if (gameState.board[index] !== '' || !gameState.gameActive) return;

        gameState.board[index] = gameState.currentPlayer;
        cell.textContent = gameState.currentPlayer;

        if (checkWin()) {
            statusDisplay.textContent = `Player ${gameState.currentPlayer} wins!`;
            gameState.gameActive = false;
            return;
        }

        if (checkDraw()) {
            statusDisplay.textContent = "Game ended in a draw!";
            gameState.gameActive = false;
            return;
        }

        gameState.currentPlayer = gameState.currentPlayer === 'X' ? 'O' : 'X';
        statusDisplay.textContent = `Player ${gameState.currentPlayer}'s turn`;
    }

    function checkWin() {
        const winConditions = [
            [0, 1, 2], [3, 4, 5], [6, 7, 8], // rows
            [0, 3, 6], [1, 4, 7], [2, 5, 8], // columns
            [0, 4, 8], [2, 4, 6] // diagonals
        ];

        return winConditions.some(condition => {
            return condition.every(index => {
                return gameState.board[index] === gameState.currentPlayer;
            });
        });
    }

    function checkDraw() {
        return gameState.board.every(cell => cell !== '');
    }

    function restartGame() {
        gameState.board = Array(9).fill('');
        gameState.currentPlayer = 'X';
        gameState.gameActive = true;
        cells.forEach(cell => cell.textContent = '');
        statusDisplay.textContent = `Player ${gameState.currentPlayer}'s turn`;
    }

    // Initialize game
    cells.forEach(cell => cell.addEventListener('click', handleCellClick));
    restartButton.addEventListener('click', restartGame);
    statusDisplay.textContent = `Player ${gameState.currentPlayer}'s turn`;
}