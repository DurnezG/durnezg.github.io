const canvas = document.getElementById('particles');
const ctx = canvas.getContext('2d');
let particlesArray = [];

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

class Particle 
{
    constructor(layer = 1) 
    {
        this.Reset(layer);
    }

    Reset(layer) 
    {
        const speedModifier = 0.1;
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height;
        this.size = Math.random() * 2 + 0.5;
        this.speedX = (Math.random() - 0.5) * layer * speedModifier;
        this.speedY = (Math.random() - 0.5) * layer * speedModifier;
        this.layer = layer;
        this.color = `hsla(${Math.random() * 360}, 80%, ${50 + layer*10}%, 0.7)`;
    }

    Update() 
    {
        this.x += this.speedX;
        this.y += this.speedY;

        if (this.x < 0 || this.x > canvas.width || this.y < 0 || this.y > canvas.height) {
            this.Reset(this.layer);
        }
    }

    Draw() 
    {
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
    }
}

function InitParticles() 
{
    particlesArray = [];
    const layers = 3;
    const particlesPerLayer = 200;
    for (let layer = 1; layer <= layers; layer++) 
    {
        for (let i = 0; i < particlesPerLayer; i++) 
        {
            particlesArray.push(new Particle(layer));
        }
    }
}

function ConnectParticles() 
{
    for (let a = 0; a < particlesArray.length; a++) 
    {
        for (let b = a; b < particlesArray.length; b++) 
        {
            let dx = particlesArray[a].x - particlesArray[b].x;
            let dy = particlesArray[a].y - particlesArray[b].y;
            let distance = Math.sqrt(dx * dx + dy * dy);
            if (distance < 100) 
            {
                ctx.strokeStyle = 'rgba(0,240,255,0.05)';
                ctx.lineWidth = 0.5;
                ctx.beginPath();
                ctx.moveTo(particlesArray[a].x, particlesArray[a].y);
                ctx.lineTo(particlesArray[b].x, particlesArray[b].y);
                ctx.stroke();
            }
        }
    }
}

function Animate() 
{
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    particlesArray.forEach(p => {
        p.Update();
        p.Draw();
    });
    ConnectParticles();
    requestAnimationFrame(Animate);
}

InitParticles();
Animate();

window.addEventListener('resize', () => 
{
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    InitParticles();
});

// Smooth scroll
document.querySelectorAll('a[href^="#"]').forEach(link => {
  link.addEventListener('click', e => {
    e.preventDefault();
    document.querySelector(link.getAttribute('href')).scrollIntoView({ behavior: 'smooth', block: 'start' });
  });
});

// Parallax effect
let lastScrollY = window.scrollY;
window.addEventListener('scroll', () => {
    const scrollTop = window.pageYOffset;
    const currentScrollY = window.scrollY;
    const direction = currentScrollY > lastScrollY ? 1 : -1;
    particlesArray.forEach(p => {
        p.y += direction * p.layer * 0.3; // slow parallax motion
        if (p.y > canvas.height) p.y = 0;
    });
});
