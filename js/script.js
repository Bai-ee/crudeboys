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
    const link = document.getElementById('randomLink');

    // Fetch and parse the JSON file
    fetch('/js/crudeboys_image.json')
        .then(response => response.json())
        .then(data => {
            // Attach a click event listener to the link
            link.addEventListener('click', function(e) {
                e.preventDefault(); // Prevent the default anchor link behavior
                const randomIndex = Math.floor(Math.random() * data.length); // Get a random index
                const randomUrl = data[randomIndex].meta.image; // Assume we want to link to the 'image' URL
                window.open(randomUrl, '_blank').focus(); // Open the random URL in a new tab/window and focus it
            });
        })
        .catch(error => console.error('Error loading the JSON:', error));
  });

  // Add to your existing script.js
  function searchCard() {
    const searchInput = document.getElementById('cardSearch');
    const cardNumber = parseInt(searchInput.value);
    
    if (cardNumber < 1 || cardNumber > 522 || isNaN(cardNumber)) {
        alert('Please enter a valid card number between 1-522');
        return;
    }

    // Calculate inscription number range
    const inscriptionStart = 109748927;
    const inscriptionNumber = inscriptionStart + (cardNumber - 1);
    
    // Construct the image URL
    const imageUrl = `https://bafybeidm3sremjulcdqefulerybnjqtzcf2o3vvyu5ayg35lbthmhxs5hi.ipfs.dweb.link/${cardNumber}.png`;
    
    // Remove existing search result if any
    const existingResult = document.querySelector('.search-result');
    if (existingResult) {
        existingResult.remove();
    }

    // Create new result container
    const resultDiv = document.createElement('div');
    resultDiv.className = 'search-result';
    resultDiv.style.display = 'block';

    // Add close button
    const closeButton = document.createElement('span');
    closeButton.className = 'close-button';
    closeButton.innerHTML = '×';
    closeButton.onclick = () => resultDiv.remove();

    // Create card details container
    const cardDetails = document.createElement('div');
    cardDetails.className = 'card-details';
    cardDetails.innerHTML = `
        <h2>Crudeboy #${cardNumber}</h2>
        <p>Inscription #${inscriptionNumber}</p>
        <div class="card-links">
            <a href="https://doge.ordinalswallet.com/inscription/${inscriptionNumber}" target="_blank">View on Ordinals Explorer</a>
            <a href="https://doggy.market/inscription/${inscriptionNumber}" target="_blank">View on Doggy Market</a>
        </div>
    `;

    // Add card image with click functionality
    const img = document.createElement('img');
    img.src = imageUrl;
    img.alt = `Crudeboy #${cardNumber}`;
    img.style.cursor = 'pointer';
    img.onclick = () => window.open(imageUrl, '_blank');

    // Assemble the components
    resultDiv.appendChild(closeButton);
    resultDiv.appendChild(img);
    resultDiv.appendChild(cardDetails);
    document.body.appendChild(resultDiv);
  }

  // Add keyboard support
  document.addEventListener('DOMContentLoaded', function() {
    const searchInput = document.getElementById('cardSearch');
    if (searchInput) {
        searchInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                searchCard();
            }
        });
    }
  });
}

