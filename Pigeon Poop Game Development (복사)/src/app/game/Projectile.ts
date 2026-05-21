import p5 from 'p5';

export type ProjectileType = 'egg' | 'poop' | 'laser' | 'curve' | 'giant_poop';

export class Projectile {
  public x: number;
  public y: number;
  public vx: number;
  public vy: number;
  public type: ProjectileType;
  public radius: number;
  public active: boolean = true;
  private p: p5;
  private frameCount: number = 0;
  private amplitude: number = 50;

  constructor(
    p: p5,
    x: number,
    y: number,
    type: ProjectileType,
    speed: number = 3
  ) {
    this.p = p;
    this.x = x;
    this.y = y;
    this.type = type;

    // Set initial velocity and radius based on type
    switch (type) {
      case 'egg':
        this.vx = 0;
        this.vy = speed;
        this.radius = 15;
        break;
      case 'poop':
        this.vx = (Math.random() - 0.5) * 2;
        this.vy = speed;
        this.radius = 12;
        break;
      case 'laser':
        this.vx = speed * 3;
        this.vy = 0;
        this.radius = 8;
        break;
      case 'curve':
        this.vx = 0;
        this.vy = speed * 0.8;
        this.radius = 14;
        break;
      case 'giant_poop':
        this.vx = 0;
        this.vy = speed * 1.5;
        this.radius = 36;
        break;
    }
  }

  update(): void {
    const deltaTime = this.p.deltaTime / 16.67;

    if (this.type === 'curve') {
      // Sine wave movement
      this.vx = Math.sin(this.frameCount * 0.1) * this.amplitude * 0.1;
      this.frameCount++;
    }

    this.x += this.vx * deltaTime;
    this.y += this.vy * deltaTime;

    // Deactivate if off screen
    if (
      this.y > this.p.height + 50 ||
      this.y < -50 ||
      this.x > this.p.width + 50 ||
      this.x < -50
    ) {
      this.active = false;
    }
  }

  draw(): void {
    this.p.push();

    switch (this.type) {
      case 'egg':
        // White egg
        this.p.fill(255, 250, 240);
        this.p.stroke(200);
        this.p.strokeWeight(2);
        this.p.ellipse(this.x, this.y, this.radius * 2, this.radius * 2.3);
        break;

      case 'poop':
        // Brown poop
        this.p.fill(101, 67, 33);
        this.p.noStroke();
        this.p.ellipse(this.x, this.y, this.radius * 2, this.radius * 2);
        // Small details
        this.p.fill(80, 50, 20);
        this.p.ellipse(this.x - this.radius * 0.3, this.y, this.radius * 0.8, this.radius * 0.8);
        break;

      case 'laser':
        // Red laser beam
        this.p.stroke(255, 0, 0);
        this.p.strokeWeight(4);
        this.p.line(this.x, this.y, this.x + 30, this.y);
        this.p.fill(255, 100, 100, 150);
        this.p.noStroke();
        this.p.circle(this.x, this.y, this.radius * 2);
        break;

      case 'curve':
        // Purple curved projectile
        this.p.fill(150, 50, 200);
        this.p.stroke(100, 0, 150);
        this.p.strokeWeight(2);
        this.p.circle(this.x, this.y, this.radius * 2);
        break;

      case 'giant_poop':
        // Giant brown poop with warning shadow
        this.p.fill(101, 67, 33, 100);
        this.p.noStroke();
        this.p.ellipse(this.x, this.y + 10, this.radius * 2.2, this.radius * 2.2);
        this.p.fill(101, 67, 33);
        this.p.ellipse(this.x, this.y, this.radius * 2, this.radius * 2);
        this.p.fill(80, 50, 20);
        this.p.ellipse(this.x - this.radius * 0.3, this.y, this.radius * 1.2, this.radius * 1.2);
        break;
    }

    this.p.pop();
  }
}
