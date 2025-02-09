const gallery = document.getElementById('gallery');
const loadImagesBtn = document.getElementById('loadImages');
const clearGalleryBtn = document.getElementById('clearGallery');
let images = JSON.parse(localStorage.getItem('galleryImages')) || [];
let currentIndex = 0;
let fullscreenDiv;

let timerElement = document.getElementById('timer');
let startTime = Date.now();
let totalTime = 0;
let timerInterval;
let isPageVisible = true;
const locationDisplay = document.getElementById("location");

function startTimer() {
    timerInterval = setInterval(() => {
        if (isPageVisible) {
            totalTime = Date.now() - startTime;
            const minutes = Math.floor(totalTime / 60000);
            const seconds = Math.floor((totalTime % 60000) / 1000);
            timerElement.textContent = `${minutes}:${seconds < 10 ? '0' + seconds : seconds}`;
        }
    }, 1000);
}

document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
        isPageVisible = false;
    } else {
        startTime = Date.now() - totalTime;
        isPageVisible = true;
    }
});
window.addEventListener('focus', () => {
    if (!timerInterval) {
        startTimer();
    }
});

function getLocation() {
    if (navigator.geolocation) {
        navigator.geolocation.watchPosition(
            (position) => {
                const latitude = position.coords.latitude;
                const longitude = position.coords.longitude;
                locationDisplay.textContent = `Широта: ${latitude.toFixed(4)}, Довгота: ${longitude.toFixed(4)}`;
            },
            (error) => {
                console.error("Помилка геолокації:", error);
                locationDisplay.textContent = "Не вдалося отримати місцезнаходження.";
            }
        );
    } else {
        locationDisplay.textContent = "Геолокація не підтримується браузером.";
    }
}
window.addEventListener("load", getLocation);

function createImageElement(src, onClick) {
    const img = document.createElement('img');
    img.src = src;
    img.addEventListener('click', onClick);
    return img;
}

async function loadImages() {
    for (let i = 0; i < 2; i++) {
        try {
            const response = await fetch('https://dog.ceo/api/breeds/image/random');
            if (!response.ok) throw new Error('Помилка сервера');
            const data = await response.json();
            const img = createImageElement(data.message, () => enterFullscreen(images.indexOf(data.message)));
            gallery.appendChild(img);
            images.push(data.message);
            saveGalleryToLocalStorage();
        } catch (error) {
            console.error('Помилка завантаження фото:', error);
            alert('Не вдалося завантажити фото. Спробуйте ще раз.');
        }
    }
}

function saveGalleryToLocalStorage() {
    try {
        localStorage.setItem('galleryImages', JSON.stringify(images));
    } catch (error) {
        console.error('Помилка збереження в локальне сховище:', error);
        alert('Не вдалося зберегти галерею.');
    }
}

loadImagesBtn.addEventListener('click', loadImages);

function initializeFullscreen(index) {
    currentIndex = index;
    fullscreenDiv = document.createElement('div');
    fullscreenDiv.classList.add('fullscreen');

    const imgElement = createImageElement(images[currentIndex], null);
    const exitBtn = createNavigationButton('Вийти', 'exit-fullscreen', exitFullscreen);
    const prevBtn = createNavigationButton('<', 'prev-btn', () => navigateImage(-1));
    const nextBtn = createNavigationButton('>', 'next-btn', () => navigateImage(1));

    fullscreenDiv.append(imgElement, exitBtn, prevBtn, nextBtn);
    document.body.appendChild(fullscreenDiv);
    document.body.style.overflow = 'hidden';
}

function createNavigationButton(text, className, onClick) {
    const button = document.createElement('button');
    button.classList.add('navigation-btn', className);
    button.textContent = text;
    button.addEventListener('click', onClick);
    return button;
}

function enterFullscreen(index) {
    // Check if images array is empty
    if (this.images.length === 0) {
        console.error('No images available to display in fullscreen.');
        return;
    }

    // Validate index
    if (index < 0 || index >= this.images.length) {
        console.error('Invalid image index.');
        return;
    }

    // Check if fullscreen is already open
    if (this.fullscreenDiv) {
        console.warn('Fullscreen mode is already active.');
        return;
    }

    this.currentIndex = index;
    this.fullscreenDiv = document.createElement('div');
    this.fullscreenDiv.classList.add('fullscreen');

    const imgElement = this.createImageElement(this.images[this.currentIndex], null);
    const exitBtn = this.createNavigationButton('Вийти', 'exit-fullscreen', () => this.exitFullscreen());
    const prevBtn = this.createNavigationButton('<', 'prev-btn', () => this.navigateImage(-1));
    const nextBtn = this.createNavigationButton('>', 'next-btn', () => this.navigateImage(1));

    this.fullscreenDiv.append(imgElement, exitBtn, prevBtn, nextBtn);
    document.body.appendChild(this.fullscreenDiv);
    document.body.style.overflow = 'hidden';
}

function exitFullscreen() {
    if (!this.fullscreenDiv) {
        console.warn('No fullscreen element to exit.');
        return;
    }

    document.body.removeChild(this.fullscreenDiv);
    document.body.style.overflow = 'auto';
    this.fullscreenDiv = null; // Reset the reference
}

function navigateImage(direction) {
    // Check if fullscreen is active
    if (!this.fullscreenDiv) {
        console.error('Fullscreen mode is not active.');
        return;
    }

    // Check if images array is empty
    if (this.images.length === 0) {
        console.error('No images available to navigate.');
        return;
    }

    // Update current index
    this.currentIndex = (this.currentIndex + direction + this.images.length) % this.images.length;

    // Update the image source
    const imgElement = this.fullscreenDiv.querySelector('img');
    if (imgElement) {
        imgElement.src = this.images[this.currentIndex];
    } else {
        console.error('Image element not found in fullscreen mode.');
    }
}

clearGalleryBtn.addEventListener('click', () => {
    images = [];
    localStorage.removeItem('galleryImages');
    gallery.innerHTML = '';
});

window.addEventListener('load', () => {
    images.forEach(src => {
        const img = createImageElement(src, () => enterFullscreen(images.indexOf(src)));
        gallery.appendChild(img);
    });
});
