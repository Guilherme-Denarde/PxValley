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

const playerImage = new Image();
playerImage.src = './Img/playerDown.png';

class Sprite {
    constructor({ position, image }) {
        this.position = position;
        this.image = image;
    }
    draw() {
        ctx.drawImage(this.image, this.position.x, this.position.y);
    }
}

const background = new Sprite({
    position: {
        x: offset.x,
        y: offset.y
    },
    image: backgroundImg
});

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
    ctx.drawImage(
        playerImage,
        0,
        0,
        playerImage.width / 4,
        playerImage.height,
        canvas.width / 2 - playerImage.width / 8,
        canvas.height / 2 - playerImage.height / 2,
        playerImage.width / 4,
        playerImage.height
    );

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
        if (moving) background.position.y += 3;
    } else if (keys.a.pressed && lastKey === 'a') {
        boundaries.forEach(boundary => {
            if (rectangularCollision({
                rectangle1: { ...background, position: { x: background.position.x + 3, y: background.position.y } },
                rectangle2: boundary
            })) {
                moving = false;
            }
        });
        if (moving) background.position.x += 3;
    } else if (keys.s.pressed && lastKey === 's') {
        boundaries.forEach(boundary => {
            if (rectangularCollision({
                rectangle1: { ...background, position: { x: background.position.x, y: background.position.y - 3 } },
                rectangle2: boundary
            })) {
                moving = false;
            }
        });
        if (moving) background.position.y -= 3;
    } else if (keys.d.pressed && lastKey === 'd') {
        boundaries.forEach(boundary => {
            if (rectangularCollision({
                rectangle1: { ...background, position: { x: background.position.x - 3, y: background.position.y } },
                rectangle2: boundary
            })) {
                moving = false;
            }
        });
        if (moving) background.position.x -= 3;
    }
}

animate();

let lastKey = '';
window.addEventListener('keydown', (e) => {
    switch (e.key) {
        case 'w':
            keys.w.pressed = true;
            lastKey = 'w';
            break;
        case 'a':
            keys.a.pressed = true;
            lastKey = 'a';
            break;
        case 's':
            keys.s.pressed = true;
            lastKey = 's';
            break;
        case 'd':
            keys.d.pressed = true;
            lastKey = 'd';
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
