{
  const body = document.body;

  // helper functions
  const MathUtils = {
    lerp: (a, b, n) => (1 - n) * a + n * b,
    distance: (x1, y1, x2, y2) => Math.hypot(x2 - x1, y2 - y1),
  };

  // get the mouse positions
  const getMousePos = (ev) => {
    let posx = 0;
    let posy = 0;
    if (!ev) ev = window.event;
    if (ev.pageX || ev.pageY) {
      posx = ev.pageX;
      posy = ev.pageY;
    } else if (ev.clientX || ev.clientY) {
      posx = ev.clientX + body.scrollLeft + docEl.scrollLeft;
      posy = ev.clientY + body.scrollTop + docEl.scrollTop;
    }
    return { x: posx, y: posy };
  };

  let mousePos = (lastMousePos = cacheMousePos = { x: 0, y: 0 });

  // update the mouse position
  window.addEventListener("mousemove", (ev) => (mousePos = getMousePos(ev)));

  const getMouseDistance = () =>
    MathUtils.distance(mousePos.x, mousePos.y, lastMousePos.x, lastMousePos.y);

  class Image {
    constructor(el) {
      this.DOM = { el: el };
      this.defaultStyle = {
        scale: 1,
        x: 0,
        y: 0,
        opacity: 0,
      };
      this.getRect();
    }

    getRect() {
      this.rect = this.DOM.el.getBoundingClientRect();
    }
    isActive() {
      return TweenMax.isTweening(this.DOM.el) || this.DOM.el.style.opacity != 0;
    }
  }

  class ImageTrail {
    constructor() {
      this.DOM = { content: document.querySelector(".content") };
      this.images = [];
      [...this.DOM.content.querySelectorAll("img")].forEach((img) =>
        this.images.push(new Image(img))
      );
      this.imagesTotal = this.images.length;
      this.imgPosition = 0;
      this.zIndexVal = 1;
      this.threshold = 100;
      requestAnimationFrame(() => this.render());
    }
    render() {
      let distance = getMouseDistance();
      cacheMousePos.x = MathUtils.lerp(
        cacheMousePos.x || mousePos.x,
        mousePos.x,
        0.1
      );
      cacheMousePos.y = MathUtils.lerp(
        cacheMousePos.y || mousePos.y,
        mousePos.y,
        0.1
      );

      if (distance > this.threshold) {
        this.showNextImage();

        ++this.zIndexVal;
        this.imgPosition =
          this.imgPosition < this.imagesTotal - 1 ? this.imgPosition + 1 : 0;

        lastMousePos = mousePos;
      }

      let isIdle = true;
      for (let img of this.images) {
        if (img.isActive()) {
          isIdle = false;
          break;
        }
      }
      if (isIdle && this.zIndexVal !== 1) {
        this.zIndexVal = 1;
      }

      requestAnimationFrame(() => this.render());
    }
    showNextImage() {
      const img = this.images[this.imgPosition];
      TweenMax.killTweensOf(img.DOM.el);

      new TimelineMax()
        .set(
          img.DOM.el,
          {
            startAt: { opacity: 0, scale: 1 },
            opacity: 1,
            scale: 1,
            zIndex: this.zIndexVal,
            x: cacheMousePos.x - img.rect.width / 2,
            y: cacheMousePos.y - img.rect.height / 2,
          },
          0
        )
        .to(
          img.DOM.el,
          0.9,
          {
            ease: Expo.easeOut,
            x: mousePos.x - img.rect.width / 2,
            y: mousePos.y - img.rect.height / 2,
          },
          0
        )
        .to(
          img.DOM.el,
          1,
          {
            ease: Power1.easeOut,
            opacity: 0,
          },
          0.4
        )
        .to(
          img.DOM.el,
          1,
          {
            ease: Quint.easeOut,
            scale: 0.2,
          },
          0.4
        );
    }
  }

  // preload images
  const preloadImages = () => {
    return new Promise((resolve, reject) => {
      imagesLoaded(document.querySelectorAll(".content__img"), resolve);
    });
  };

  preloadImages().then(() => {
    new ImageTrail();
  });

  document.addEventListener('DOMContentLoaded', function() {
    const searchInput = document.querySelector('.search-input');
    const searchResults = document.querySelector('.search-results');
    const initialText = document.querySelector('.initial-text');
    let cardsData = null;

    fetch('js/crudeboys_image.json')
        .then(response => response.json())
        .then(data => {
            cardsData = data;
            setupSearch();
        })
        .catch(error => console.error('Error loading cards:', error));

    function setupSearch() {
        searchInput.addEventListener('input', function(e) {
            const searchTerm = e.target.value.trim();
            
            // Hide initial text when user starts typing
            if (initialText) {
                initialText.style.display = 'none';
            }
            
            if (!searchTerm || !cardsData) {
                searchResults.innerHTML = '<div class="initial-text">View your crudes</div>';
                return;
            }

            const card = cardsData.find(card => 
                card.meta.name.toLowerCase().includes(searchTerm.toLowerCase())
            );

            if (card) {
                searchResults.innerHTML = `
                    <img src="${card.meta.image}" alt="${card.meta.name}" onclick="showCardDetails('${card.id}', '${card.meta.name}', '${card.meta.image}')">
                    <div class="info-text">click card for details</div>
                `;
            }
        });
    }

    window.showCardDetails = function(id, name, image) {
        // Extract card number from name (e.g., "Crudeboy #123" -> "123")
        const cardNumber = name.split('#')[1];
        
        // Construct Doge Labs URL
        const dogeLabsUrl = `https://doge-labs.com/#/collectible/crudeboys/${id}`;
        
        const modal = document.createElement('div');
        modal.className = 'card-modal';
        modal.innerHTML = `
            <div class="modal-content">
                <img src="${image}" alt="${name}">
                <p class="card-name">${name}</p>
                <p class="card-id">ID: ${id}</p>
                <div class="card-links">
                    <a href="${dogeLabsUrl}" target="_blank" class="doge-labs-link">View on Doge Labs</a>
                </div>
                <button class="close-modal">Close</button>
            </div>
        `;
        document.body.appendChild(modal);

        modal.querySelector('.close-modal').onclick = () => modal.remove();
        modal.onclick = (e) => {
            if (e.target === modal) modal.remove();
        };
    };
  });

  // Add game initialization
  function initGame() {
    const gameState = {
        board: Array(9).fill(''),
        currentPlayer: 'X',
        gameActive: true,
        isAIGame: true
    };

    const statusDisplay = document.querySelector('.game-status');
    const cells = document.querySelectorAll('.cell');
    const restartButton = document.querySelector('.restart-button');

    function handleCellClick(e) {
        const cell = e.target;
        const index = parseInt(cell.getAttribute('data-index'));

        if (gameState.board[index] !== '' || !gameState.gameActive || gameState.currentPlayer === 'X') return;

        makeMove(index);

        if (gameState.gameActive) {
            setTimeout(() => {
                const aiMove = getBestMove(gameState.board, 'X');
                makeMove(aiMove);
            }, 500);
        }
    }

    function makeMove(index) {
        gameState.board[index] = gameState.currentPlayer;
        const cell = document.querySelector(`[data-index="${index}"]`);
        
        if (gameState.currentPlayer === 'O') {
            const img = document.createElement('img');
            img.src = 'images/o.png';
            img.style.width = '80%';
            img.style.height = '80%';
            img.style.objectFit = 'contain';
            cell.textContent = '';
            cell.appendChild(img);
        } else {
            cell.textContent = gameState.currentPlayer;
        }

        if (checkWin()) {
            statusDisplay.textContent = `${gameState.currentPlayer === 'X' ? 'You lose!' : 'You win!'}`;
            gameState.gameActive = false;
            return;
        }

        if (checkDraw()) {
            statusDisplay.textContent = "Game ended in a draw!";
            gameState.gameActive = false;
            return;
        }

        gameState.currentPlayer = gameState.currentPlayer === 'X' ? 'O' : 'X';
        statusDisplay.textContent = `${gameState.currentPlayer === 'X' ? 'CPU' : 'Your'} turn`;
    }

    function checkWin() {
        const winConditions = [
            [0, 1, 2], [3, 4, 5], [6, 7, 8],
            [0, 3, 6], [1, 4, 7], [2, 5, 8],
            [0, 4, 8], [2, 4, 6]
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

    function getBestMove(board, player) {
        const opponent = player === 'X' ? 'O' : 'X';

        // For the first move, make it random
        if (board.filter(cell => cell !== '').length === 0) {
            const availableCorners = [0, 2, 6, 8];
            const allFirstMoves = [...availableCorners, 1, 3, 4, 5, 7];
            return allFirstMoves[Math.floor(Math.random() * allFirstMoves.length)];
        }

        // Check for winning move
        for (let i = 0; i < 9; i++) {
            if (board[i] === '') {
                board[i] = player;
                if (checkWin()) {
                    board[i] = '';
                    return i;
                }
                board[i] = '';
            }
        }

        // Check for blocking opponent's winning move
        for (let i = 0; i < 9; i++) {
            if (board[i] === '') {
                board[i] = opponent;
                if (checkWin()) {
                    board[i] = '';
                    return i;
                }
                board[i] = '';
            }
        }

        // Take any available corner
        const corners = [0, 2, 6, 8];
        const availableCorners = corners.filter(corner => board[corner] === '');
        if (availableCorners.length > 0) {
            return availableCorners[Math.floor(Math.random() * availableCorners.length)];
        }

        // Take center if available
        if (board[4] === '') return 4;

        // Take any available side
        const sides = [1, 3, 5, 7];
        const availableSides = sides.filter(side => board[side] === '');
        if (availableSides.length > 0) {
            return availableSides[Math.floor(Math.random() * availableSides.length)];
        }

        // Take any available space
        const availableMoves = board.reduce((acc, cell, index) => {
            if (cell === '') acc.push(index);
            return acc;
        }, []);
        return availableMoves[Math.floor(Math.random() * availableMoves.length)];
    }

    function restartGame() {
        gameState.board = Array(9).fill('');
        gameState.currentPlayer = 'X';
        gameState.gameActive = true;
        cells.forEach(cell => {
            cell.textContent = '';
            const img = cell.querySelector('img');
            if (img) {
                cell.removeChild(img);
            }
        });
        statusDisplay.textContent = "CPU's turn";
        
        setTimeout(() => {
            const aiMove = getBestMove(gameState.board, 'X');
            makeMove(aiMove);
        }, 500);
    }

    // Add event listeners
    cells.forEach(cell => cell.addEventListener('click', handleCellClick));
    restartButton.addEventListener('click', restartGame);

    // Start the game with CPU's move
    setTimeout(() => {
        const aiMove = getBestMove(gameState.board, 'X');
        makeMove(aiMove);
    }, 500);
  }

  // Initialize the game when the DOM is loaded
  document.addEventListener('DOMContentLoaded', initGame);
}
