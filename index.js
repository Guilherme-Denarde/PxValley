const canvas = document.querySelector('canvas');
const ctx = canvas.getContext('2d');

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

const collisionsMap = [];
for (let i = 0; i < collisions.length; i += 70) {
    collisionsMap.push(collisions.slice(i, 70 + i));
}

class Boundary {
    static width = 48;
    static height = 48;
    constructor({ position }) {
        this.position = position;
        this.width = 48;
        this.height = 48;
    }
    draw() {
        ctx.fillStyle = 'rgba(255, 0, 0, 0.5)';
        ctx.fillRect(this.position.x, this.position.y, this.width, this.height);
    }
}

const boundaries = [];
const offset = {
    x: -2200,
    y: -1100
};

collisionsMap.forEach((row, i) => {
    row.forEach((symbol, j) => {
        if (symbol !== 0)
            boundaries.push(
                new Boundary({ position: {
                    x: j * Boundary.width + offset.x,
                    y: i * Boundary.height + offset.y
                }})
            );
    });
});

const backgroundImg = new Image();
backgroundImg.src = './Img/PxValleyGameMap.png';

const playerDownImage = new Image();
playerDownImage.src = './Img/playerDown.png';
const playerUpImage = new Image();
playerUpImage.src = './Img/playerUp.png';
const playerLeftImage = new Image();
playerLeftImage.src = './Img/playerLeft.png';
const playerRightImage = new Image();
playerRightImage.src = './Img/playerRight.png';

class Sprite {
    constructor({ position, image }) {
        this.position = position;
        this.image = image;
    }
    draw() {
        ctx.drawImage(this.image, this.position.x, this.position.y);
    }
}

class Player extends Sprite {
    constructor(options) {
        super(options);
        this.frame = 0;
        this.frameElapsed = 0;
        this.frameLimit = 4;
        this.sprites = options.sprites;
    }
    update() {
        this.frameElapsed++;
        if (this.frameElapsed % 10 === 0) {
            this.frame = (this.frame + 1) % this.frameLimit;
        }
        this.draw();
    }
    draw() {
        const frameWidth = this.image.width / this.frameLimit;
        this.width = frameWidth;
        this.height = this.image.height;
        ctx.drawImage(
            this.image,
            frameWidth * this.frame,
            0,
            frameWidth,
            this.image.height,
            this.position.x - frameWidth / 2,
            this.position.y - this.image.height / 2,
            frameWidth,
            this.image.height
        );
    }
}

const background = new Sprite({
    position: {
        x: offset.x,
        y: offset.y
    },
    image: backgroundImg
});

const player = new Player({
    position: {
        x: canvas.width / 2,
        y: canvas.height / 2
    },
    image: playerDownImage,
    sprites: {
        up: playerUpImage,
        down: playerDownImage,
        left: playerLeftImage,
        right: playerRightImage
    }
});

const movables = [background];
boundaries.forEach(b => movables.push(b));
movables.push(coin);

let score = 0;
const scoreEl = document.getElementById('score');

const coin = { position: { x: 0, y: 0 }, radius: 10 };
function placeCoin() {
    const mapWidth = collisionsMap[0].length * Boundary.width;
    const mapHeight = collisionsMap.length * Boundary.height;
    coin.position.x = offset.x + Math.random() * mapWidth;
    coin.position.y = offset.y + Math.random() * mapHeight;
}
placeCoin();

const keys = {
    w: { pressed: false },
    a: { pressed: false },
    s: { pressed: false },
    d: { pressed: false }
};

function rectangularCollision({ rectangle1, rectangle2 }) {
    return (
        rectangle1.position.x < rectangle2.position.x + rectangle2.width &&
        rectangle1.position.x + rectangle1.width > rectangle2.position.x &&
        rectangle1.position.y < rectangle2.position.y + rectangle2.height &&
        rectangle1.position.y + rectangle1.height > rectangle2.position.y
    );
}

function animate() {
    window.requestAnimationFrame(animate);
    background.draw();
    boundaries.forEach(boundary => {
        boundary.draw();
    });
    ctx.fillStyle = 'gold';
    ctx.beginPath();
    ctx.arc(coin.position.x, coin.position.y, coin.radius, 0, Math.PI * 2);
    ctx.fill();
    player.update();

    if (
        rectangularCollision({
            rectangle1: {
                position: {
                    x: player.position.x - player.width / 2,
                    y: player.position.y - player.height / 2
                },
                width: player.width,
                height: player.height
            },
            rectangle2: {
                position: {
                    x: coin.position.x - coin.radius,
                    y: coin.position.y - coin.radius
                },
                width: coin.radius * 2,
                height: coin.radius * 2
            }
        })
    ) {
        score++;
        scoreEl.textContent = `Score: ${score}`;
        placeCoin();
    }

    let moving = true;
    if (keys.w.pressed && lastKey === 'w') {
        boundaries.forEach(boundary => {
            if (rectangularCollision({
                rectangle1: { ...background, position: { x: background.position.x, y: background.position.y + 3 } },
                rectangle2: boundary
            })) {
                moving = false;
            }
        });
        if (moving) movables.forEach(m => m.position.y += 3);
    } else if (keys.a.pressed && lastKey === 'a') {
        boundaries.forEach(boundary => {
            if (rectangularCollision({
                rectangle1: { ...background, position: { x: background.position.x + 3, y: background.position.y } },
                rectangle2: boundary
            })) {
                moving = false;
            }
        });
        if (moving) movables.forEach(m => m.position.x += 3);
    } else if (keys.s.pressed && lastKey === 's') {
        boundaries.forEach(boundary => {
            if (rectangularCollision({
                rectangle1: { ...background, position: { x: background.position.x, y: background.position.y - 3 } },
                rectangle2: boundary
            })) {
                moving = false;
            }
        });
        if (moving) movables.forEach(m => m.position.y -= 3);
    } else if (keys.d.pressed && lastKey === 'd') {
        boundaries.forEach(boundary => {
            if (rectangularCollision({
                rectangle1: { ...background, position: { x: background.position.x - 3, y: background.position.y } },
                rectangle2: boundary
            })) {
                moving = false;
            }
        });
        if (moving) movables.forEach(m => m.position.x -= 3);
    }
}

animate();

let lastKey = '';
window.addEventListener('keydown', (e) => {
    switch (e.key) {
        case 'w':
            keys.w.pressed = true;
            lastKey = 'w';
            player.image = player.sprites.up;
            player.frame = 0;
            break;
        case 'a':
            keys.a.pressed = true;
            lastKey = 'a';
            player.image = player.sprites.left;
            player.frame = 0;
            break;
        case 's':
            keys.s.pressed = true;
            lastKey = 's';
            player.image = player.sprites.down;
            player.frame = 0;
            break;
        case 'd':
            keys.d.pressed = true;
            lastKey = 'd';
            player.image = player.sprites.right;
            player.frame = 0;
            break;
    }
});

window.addEventListener('keyup', (e) => {
    switch (e.key) {
        case 'w':
            keys.w.pressed = false;
            break;
        case 'a':
            keys.a.pressed = false;
            break;
        case 's':
            keys.s.pressed = false;
            break;
        case 'd':
            keys.d.pressed = false;
            break;
    }
});
