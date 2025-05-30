class RainEffect {
    constructor() {
        this.canvas = document.getElementById('rain-canvas');
        this.ctx = this.canvas.getContext('2d');
        this.drops = [];
        this.isActive = false;
        this.isDaytime = true;
        
        this.resize();
        window.addEventListener('resize', () => this.resize());
    }

    resize() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
    }

    init(isDaytime) {
        this.isDaytime = isDaytime;
        this.drops = [];
        this.isActive = true;
        this.canvas.classList.add('active');
        
        // Create initial raindrops
        for (let i = 0; i < 200; i++) {
            this.drops.push(this.createDrop());
        }
        
        this.animate();
    }

    stop() {
        this.isActive = false;
        this.canvas.classList.remove('active');
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }

    createDrop() {
        return {
            x: Math.random() * this.canvas.width,
            y: Math.random() * this.canvas.height,
            length: Math.random() * 20 + 10,
            speed: Math.random() * 15 + 5,
            width: Math.random() * 1 + 0.5,
            opacity: Math.random() * 0.5 + 0.3
        };
    }

    animate() {
        if (!this.isActive) return;

        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Update and draw drops
        this.drops.forEach((drop, index) => {
            // Update position
            drop.y += drop.speed;
            
            // Reset drop if it goes off screen
            if (drop.y > this.canvas.height) {
                this.drops[index] = this.createDrop();
                this.drops[index].y = -20;
            }
            
            // Draw drop
            this.ctx.beginPath();
            this.ctx.strokeStyle = this.isDaytime ? 
                `rgba(174, 194, 224, ${drop.opacity})` : 
                `rgba(255, 255, 255, ${drop.opacity})`;
            this.ctx.lineWidth = drop.width;
            this.ctx.moveTo(drop.x, drop.y);
            this.ctx.lineTo(drop.x, drop.y + drop.length);
            this.ctx.stroke();
            
            // effect when drop hits bottom
            if (drop.y + drop.length > this.canvas.height - 5) {
                this.createSplash(drop.x, this.canvas.height);
            }
        });
        
        // new drops randomly
        if (Math.random() < 0.1) {
            this.drops.push(this.createDrop());
        }
        
        // no excess drops
        if (this.drops.length > 300) {
            this.drops.shift();
        }
        
        requestAnimationFrame(() => this.animate());
    }

    createSplash(x, y) {
        const splash = {
            x: x,
            y: y,
            radius: Math.random() * 2 + 1,
            opacity: 0.5,
            life: 1
        };
        
        const drawSplash = () => {
            if (splash.life <= 0) return;
            
            this.ctx.beginPath();
            this.ctx.arc(
                splash.x, 
                splash.y, 
                splash.radius, 
                0, 
                Math.PI * 2
            );
            this.ctx.fillStyle = this.isDaytime ? 
                `rgba(174, 194, 224, ${splash.opacity * splash.life})` : 
                `rgba(255, 255, 255, ${splash.opacity * splash.life})`;
            this.ctx.fill();
            
            splash.life -= 0.1;
            splash.radius += 0.5;
            
            if (splash.life > 0) {
                requestAnimationFrame(drawSplash);
            }
        };
        
        drawSplash();
    }
}

// Create and export rain effect instance
const rainEffect = new RainEffect(); 