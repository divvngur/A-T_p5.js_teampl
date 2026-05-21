import p5 from 'p5';
import { Projectile } from './Projectile';

export type PigeonType = 'normal' | 'miniboss' | 'boss';

export class Pigeon {
  public x: number;
  public y: number;
  public vx: number;
  public vy: number;
  public type: PigeonType;
  public health: number;
  public maxHealth: number;
  public dropTimer: number = 0;
  public dropInterval: number;
  private p: p5;
  private wingFrame: number = 0;
  private poopRatio: number;

  constructor(
    p: p5,
    type: PigeonType = 'normal',
    speed: number = 2,
    poopRatio: number = 0.3
  ) {
    this.p = p;
    this.type = type;
    this.poopRatio = poopRatio;

    // Random position at top
    this.x = Math.random() * p.width;
    this.y = p.height * (0.1 + Math.random() * 0.2);

    // Set properties based on type
    switch (type) {
      case 'normal':
        this.vx = speed * (Math.random() > 0.5 ? 1 : -1);
        this.vy = 0;
        this.health = 1;
        this.maxHealth = 1;
        this.dropInterval = 120 - Math.random() * 40;
        break;
      case 'miniboss':
        this.vx = speed * 1.2 * (Math.random() > 0.5 ? 1 : -1);
        this.vy = Math.sin(Date.now()) * 0.5;
        this.health = 5;
        this.maxHealth = 5;
        this.dropInterval = 100;
        break;
      case 'boss':
        this.vx = speed * 0.8 * (Math.random() > 0.5 ? 1 : -1);
        this.vy = 0;
        this.health = 15;
        this.maxHealth = 15;
        this.dropInterval = 90;
        break;
    }
  }

  update(): void {
    const deltaTime = this.p.deltaTime / 16.67;

    // Update position
    this.x += this.vx * deltaTime;
    this.y += this.vy * deltaTime;

    // Bounce off walls
    if (this.x < 50 || this.x > this.p.width - 50) {
      this.vx *= -1;
    }

    // Keep in vertical bounds
    if (this.y < this.p.height * 0.1) {
      this.y = this.p.height * 0.1;
      this.vy = 0;
    }
    if (this.y > this.p.height * 0.4) {
      this.y = this.p.height * 0.4;
      this.vy = 0;
    }

    // Update drop timer
    this.dropTimer++;

    // Wing animation
    this.wingFrame = (this.wingFrame + 0.2) % 360;
  }

  shouldDrop(): boolean {
    if (this.dropTimer >= this.dropInterval) {
      this.dropTimer = 0;
      return true;
    }
    return false;
  }

  createProjectile(): Projectile {
    const isEgg = Math.random() > this.poopRatio;
    const type = isEgg ? 'egg' : 'poop';
    return new Projectile(this.p, this.x, this.y, type);
  }

  createSpecialProjectile(): Projectile {
    if (this.type === 'miniboss') {
      return new Projectile(this.p, this.x, this.y, 'curve', 3);
    } else if (this.type === 'boss') {
      const special = Math.random();
      if (special < 0.3) {
        return new Projectile(this.p, this.x, this.y, 'laser', 5);
      } else if (special < 0.6) {
        return new Projectile(this.p, this.x, this.y, 'giant_poop', 4);
      } else {
        return new Projectile(this.p, this.x, this.y, 'curve', 3);
      }
    }
    return this.createProjectile();
  }

  takeDamage(amount: number = 1): boolean {
    this.health -= amount;
    return this.health <= 0;
  }

  draw(): void {
    this.p.push();
    this.p.translate(this.x, this.y);

    // Flip if moving left
    if (this.vx < 0) {
      this.p.scale(-1, 1);
    }

    const size = this.type === 'boss' ? 1.5 : this.type === 'miniboss' ? 1.2 : 1;
    const wingOffset = Math.sin(this.wingFrame * 0.1) * 5;

    // Wings
    this.p.fill(120, 120, 120);
    this.p.ellipse(-15 * size, wingOffset, 30 * size, 15 * size);
    this.p.ellipse(5 * size, wingOffset, 30 * size, 15 * size);

    // Body
    this.p.fill(150, 150, 150);
    this.p.ellipse(0, 0, 50 * size, 35 * size);

    // Head
    this.p.fill(160, 160, 160);
    this.p.ellipse(20 * size, -15 * size, 30 * size, 30 * size);

    // Eye
    this.p.fill(0);
    this.p.circle(28 * size, -15 * size, 6 * size);

    // Beak
    this.p.fill(255, 150, 0);
    this.p.triangle(
      35 * size,
      -15 * size,
      42 * size,
      -12 * size,
      35 * size,
      -10 * size
    );

    // Boss crown
    if (this.type === 'boss') {
      this.p.fill(255, 215, 0);
      this.p.circle(20 * size, -30 * size, 12 * size);
      this.p.triangle(
        15 * size,
        -35 * size,
        20 * size,
        -45 * size,
        25 * size,
        -35 * size
      );
    }

    // MiniBoss indicator
    if (this.type === 'miniboss') {
      this.p.fill(200, 100, 255);
      this.p.circle(20 * size, -30 * size, 8 * size);
    }

    this.p.pop();

    // Health bar for boss/miniboss
    if (this.type !== 'normal') {
      const barWidth = 60 * size;
      const barHeight = 6;
      const barX = this.x - barWidth / 2;
      const barY = this.y - 40 * size;

      this.p.fill(100);
      this.p.rect(barX, barY, barWidth, barHeight);

      this.p.fill(255, 50, 50);
      const healthPercent = this.health / this.maxHealth;
      this.p.rect(barX, barY, barWidth * healthPercent, barHeight);
    }
  }
}
