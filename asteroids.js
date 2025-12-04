// Asteroids Game Implementation
// **Timestamp**: 2025-12-04

const canvas = document.getElementById('asteroidCanvas');
const ctx = canvas.getContext('2d');

let ship = null;
let bullets = [];
let asteroids = [];
let particles = [];
let score = 0;
let lives = 3;
let level = 1;
let gameRunning = false;
let gamePaused = false;
let keys = {};

class Ship {
    constructor() {
        this.x = canvas.width / 2;
        this.y = canvas.height / 2;
        this.angle = 0;
        this.velocityX = 0;
        this.velocityY = 0;
        this.thrust = false;
        this.size = 15;
        this.invincible = 0;
    }
    
    rotate(direction) {
        this.angle += direction * 0.1;
    }
    
    accelerate() {
        this.thrust = true;
        this.velocityX += Math.cos(this.angle) * 0.15;
        this.velocityY += Math.sin(this.angle) * 0.15;
        
        // Speed limit
        const speed = Math.sqrt(this.velocityX ** 2 + this.velocityY ** 2);
        if (speed > 8) {
            this.velocityX = (this.velocityX / speed) * 8;
            this.velocityY = (this.velocityY / speed) * 8;
        }
    }
    
    update() {
        this.x += this.velocityX;
        this.y += this.velocityY;
        
        // Friction
        this.velocityX *= 0.99;
        this.velocityY *= 0.99;
        
        // Wrap around screen
        if (this.x < 0) this.x = canvas.width;
        if (this.x > canvas.width) this.x = 0;
        if (this.y < 0) this.y = canvas.height;
        if (this.y > canvas.height) this.y = 0;
        
        if (this.invincible > 0) this.invincible--;
        this.thrust = false;
    }
    
    draw() {
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(this.angle);
        
        // Draw ship
        if (this.invincible === 0 || Math.floor(this.invincible / 5) % 2 === 0) {
            ctx.strokeStyle = '#00FF00';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(this.size, 0);
            ctx.lineTo(-this.size, this.size);
            ctx.lineTo(-this.size * 0.5, 0);
            ctx.lineTo(-this.size, -this.size);
            ctx.closePath();
            ctx.stroke();
            
            // Thrust flame
            if (this.thrust) {
                ctx.strokeStyle = '#FF6B6B';
                ctx.beginPath();
                ctx.moveTo(-this.size * 0.5, this.size * 0.5);
                ctx.lineTo(-this.size * 1.5, 0);
                ctx.lineTo(-this.size * 0.5, -this.size * 0.5);
                ctx.stroke();
            }
        }
        
        ctx.restore();
    }
}

class Bullet {
    constructor(x, y, angle) {
        this.x = x;
        this.y = y;
        this.velocityX = Math.cos(angle) * 8;
        this.velocityY = Math.sin(angle) * 8;
        this.life = 60;
    }
    
    update() {
        this.x += this.velocityX;
        this.y += this.velocityY;
        this.life--;
        
        // Wrap around
        if (this.x < 0) this.x = canvas.width;
        if (this.x > canvas.width) this.x = 0;
        if (this.y < 0) this.y = canvas.height;
        if (this.y > canvas.height) this.y = 0;
        
        return this.life > 0;
    }
    
    draw() {
        ctx.fillStyle = '#FFFF00';
        ctx.beginPath();
        ctx.arc(this.x, this.y, 2, 0, Math.PI * 2);
        ctx.fill();
    }
}

class Asteroid {
    constructor(x, y, size) {
        this.x = x;
        this.y = y;
        this.size = size;
        this.velocityX = (Math.random() - 0.5) * 2;
        this.velocityY = (Math.random() - 0.5) * 2;
        this.rotation = Math.random() * Math.PI * 2;
        this.rotationSpeed = (Math.random() - 0.5) * 0.05;
        this.points = Math.floor(Math.random() * 10) + 8;
        this.offsets = Array(this.points).fill(0).map(() => Math.random() * 0.4 + 0.8);
    }
    
    update() {
        this.x += this.velocityX;
        this.y += this.velocityY;
        this.rotation += this.rotationSpeed;
        
        // Wrap around
        if (this.x < -this.size) this.x = canvas.width + this.size;
        if (this.x > canvas.width + this.size) this.x = -this.size;
        if (this.y < -this.size) this.y = canvas.height + this.size;
        if (this.y > canvas.height + this.size) this.y = -this.size;
    }
    
    draw() {
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(this.rotation);
        
        ctx.strokeStyle = '#FFFFFF';
        ctx.lineWidth = 2;
        ctx.beginPath();
        
        for (let i = 0; i < this.points; i++) {
            const angle = (Math.PI * 2 * i) / this.points;
            const radius = this.size * this.offsets[i];
            const x = Math.cos(angle) * radius;
            const y = Math.sin(angle) * radius;
            
            if (i === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
        }
        
        ctx.closePath();
        ctx.stroke();
        ctx.restore();
    }
}

function startGame() {
    gameRunning = true;
    gamePaused = false;
    score = 0;
    lives = 3;
    level = 1;
    ship = new Ship();
    bullets = [];
    asteroids = [];
    particles = [];
    
    spawnAsteroids(4);
    updateUI();
    gameLoop();
}

function spawnAsteroids(count) {
    for (let i = 0; i < count; i++) {
        let x, y;
        do {
            x = Math.random() * canvas.width;
            y = Math.random() * canvas.height;
        } while (Math.hypot(x - ship.x, y - ship.y) < 150);
        
        asteroids.push(new Asteroid(x, y, 40));
    }
}

function togglePause() {
    if (!gameRunning) return;
    gamePaused = !gamePaused;
    if (!gamePaused) gameLoop();
}

function shoot() {
    if (bullets.length < 5) {
        const bulletX = ship.x + Math.cos(ship.angle) * ship.size;
        const bulletY = ship.y + Math.sin(ship.angle) * ship.size;
        bullets.push(new Bullet(bulletX, bulletY, ship.angle));
        playSound(800, 0.05);
    }
}

function checkCollisions() {
    // Bullets vs Asteroids
    for (let i = bullets.length - 1; i >= 0; i--) {
        for (let j = asteroids.length - 1; j >= 0; j--) {
            const dist = Math.hypot(bullets[i].x - asteroids[j].x, bullets[i].y - asteroids[j].y);
            
            if (dist < asteroids[j].size) {
                // Hit!
                const asteroid = asteroids[j];
                score += asteroid.size === 40 ? 20 : asteroid.size === 20 ? 50 : 100;
                
                // Spawn smaller asteroids
                if (asteroid.size > 15) {
                    const newSize = asteroid.size / 2;
                    asteroids.push(new Asteroid(asteroid.x, asteroid.y, newSize));
                    asteroids.push(new Asteroid(asteroid.x, asteroid.y, newSize));
                }
                
                // Explosion particles
                createExplosion(asteroid.x, asteroid.y);
                
                asteroids.splice(j, 1);
                bullets.splice(i, 1);
                playSound(200, 0.1);
                updateUI();
                break;
            }
        }
    }
    
    // Ship vs Asteroids
    if (ship.invincible === 0) {
        for (const asteroid of asteroids) {
            const dist = Math.hypot(ship.x - asteroid.x, ship.y - asteroid.y);
            
            if (dist < ship.size + asteroid.size) {
                // Ship hit!
                lives--;
                ship.invincible = 90;
                createExplosion(ship.x, ship.y, 20);
                playSound(100, 0.3);
                updateUI();
                
                if (lives === 0) {
                    gameOver();
                }
                break;
            }
        }
    }
}

function createExplosion(x, y, count = 10) {
    for (let i = 0; i < count; i++) {
        const angle = Math.random() * Math.PI * 2;
        const speed = Math.random() * 3 + 1;
        particles.push({
            x, y,
            vx: Math.cos(angle) * speed,
            vy: Math.sin(angle) * speed,
            life: 30
        });
    }
}

function gameLoop() {
    if (!gameRunning || gamePaused) return;
    
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Update
    if (ship) {
        if (keys['ArrowLeft']) ship.rotate(-1);
        if (keys['ArrowRight']) ship.rotate(1);
        if (keys['ArrowUp']) ship.accelerate();
        
        ship.update();
        ship.draw();
    }
    
    bullets = bullets.filter(bullet => {
        bullet.update();
        bullet.draw();
        return bullet.life > 0;
    });
    
    asteroids.forEach(asteroid => {
        asteroid.update();
        asteroid.draw();
    });
    
    particles = particles.filter(p => {
        p.x += p.vx;
        p.y += p.vy;
        p.life--;
        
        ctx.fillStyle = `rgba(255, 255, 255, ${p.life / 30})`;
        ctx.fillRect(p.x, p.y, 2, 2);
        
        return p.life > 0;
    });
    
    checkCollisions();
    
    // Level complete
    if (asteroids.length === 0 && gameRunning) {
        level++;
        spawnAsteroids(3 + level);
        updateUI();
    }
    
    requestAnimationFrame(gameLoop);
}

function gameOver() {
    gameRunning = false;
    document.getElementById('status').textContent = `GAME OVER! Final Score: ${score}`;
}

function updateUI() {
    document.getElementById('score').textContent = score;
    document.getElementById('lives').textContent = lives;
    document.getElementById('level').textContent = level;
    document.getElementById('status').textContent = gameRunning ? `Level ${level}` : 'Press SPACE to start!';
}

function playSound(freq, duration) {
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    oscillator.frequency.value = freq;
    oscillator.type = 'square';
    
    gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + duration);
    
    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + duration);
}

// Keyboard handling
window.addEventListener('keydown', (e) => {
    keys[e.key] = true;
    
    if (e.key === ' ') {
        e.preventDefault();
        if (!gameRunning) {
            startGame();
        } else if (ship) {
            shoot();
        }
    }
});

window.addEventListener('keyup', (e) => {
    keys[e.key] = false;
});

// Initialize
updateUI();

