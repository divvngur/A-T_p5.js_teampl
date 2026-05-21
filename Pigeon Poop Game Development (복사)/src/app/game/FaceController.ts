import p5 from 'p5';

// Use global ml5 loaded via CDN
declare const ml5: any;

export class FaceController {
  private faceMesh: any;
  private video: p5.MediaElement | null = null;
  private predictions: any[] = [];
  public mouthOpen: boolean = false;
  public mouthCenter: { x: number; y: number } = { x: 0, y: 0 };
  public mouthRadius: number = 50;
  public isReady: boolean = false;
  public faceDetected: boolean = false;
  private scaleX: number = 1;
  private scaleY: number = 1;
  private p: p5;

  constructor(p: p5, video: p5.MediaElement) {
    this.p = p;
    this.video = video;

    // Calculate scale factors
    this.scaleX = p.width / (video.width as number);
    this.scaleY = p.height / (video.height as number);
  }

  async initialize(): Promise<void> {
    return new Promise((resolve, reject) => {
      // Add timeout for model loading
      const timeout = setTimeout(() => {
        reject(new Error('FaceMesh model loading timeout'));
      }, 30000); // 30 second timeout for model download

      try {
        if (typeof ml5 === 'undefined') {
          clearTimeout(timeout);
          reject(new Error('ml5 is not loaded'));
          return;
        }
        this.faceMesh = ml5.faceMesh(
          this.video?.elt,
          {
            maxFaces: 1,
            refineLandmarks: false,
            flipHorizontal: false,
          },
          () => {
            clearTimeout(timeout);
            console.log('FaceMesh model loaded');
            this.isReady = true;
            resolve();
          }
        );

        if (this.faceMesh) {
          this.faceMesh.on('predict', (results: any[]) => {
            this.predictions = results;
            this.update();
          });
        }
      } catch (error) {
        clearTimeout(timeout);
        console.error('FaceMesh initialization failed:', error);
        reject(error);
      }
    });
  }

  update(): void {
    if (!this.predictions || this.predictions.length === 0) {
      this.faceDetected = false;
      return;
    }

    this.faceDetected = true;
    const face = this.predictions[0];

    if (face.keypoints && face.keypoints.length > 0) {
      // Mouth landmarks indices (upper lip center and lower lip center)
      const upperLip = face.keypoints[13];
      const lowerLip = face.keypoints[14];

      if (upperLip && lowerLip) {
        // Calculate mouth center (mirrored for display)
        this.mouthCenter.x = this.p.width - upperLip.x * this.scaleX;
        this.mouthCenter.y = upperLip.y * this.scaleY;

        // Calculate mouth opening distance
        const distance = this.p.dist(upperLip.x, upperLip.y, lowerLip.x, lowerLip.y);

        // Threshold for mouth open detection (adjust based on camera resolution)
        const threshold = 20;
        this.mouthOpen = distance > threshold;
      }
    }
  }

  checkEggCollision(eggX: number, eggY: number, eggRadius: number): boolean {
    if (!this.mouthOpen || !this.faceDetected) return false;

    const distance = this.p.dist(eggX, eggY, this.mouthCenter.x, this.mouthCenter.y);
    return distance < eggRadius + this.mouthRadius;
  }

  checkPoopCollision(poopX: number, poopY: number, poopRadius: number): boolean {
    if (!this.faceDetected) return false;

    // Use a larger radius for poop collision (face area)
    const faceRadius = 80;
    const distance = this.p.dist(poopX, poopY, this.mouthCenter.x, this.mouthCenter.y);
    return distance < poopRadius + faceRadius;
  }

  drawDebug(): void {
    if (!this.faceDetected) return;

    this.p.push();

    // Draw mouth center
    this.p.fill(255, 0, 0, 100);
    this.p.noStroke();
    this.p.circle(this.mouthCenter.x, this.mouthCenter.y, this.mouthRadius * 2);

    // Draw face landmarks
    if (this.predictions[0]?.keypoints) {
      this.p.fill(0, 255, 0);
      for (const point of this.predictions[0].keypoints) {
        const x = this.p.width - point.x * this.scaleX;
        const y = point.y * this.scaleY;
        this.p.circle(x, y, 2);
      }
    }

    // Mouth status indicator
    this.p.fill(this.mouthOpen ? 'green' : 'red');
    this.p.textSize(20);
    this.p.text(this.mouthOpen ? 'MOUTH OPEN' : 'MOUTH CLOSED', 10, 30);

    this.p.pop();
  }

  getFaceBoundingBox(): { x: number; y: number; width: number; height: number } | null {
    if (!this.faceDetected || !this.predictions[0]?.box) return null;

    const box = this.predictions[0].box;
    return {
      x: this.p.width - (box.xMax * this.scaleX),
      y: box.yMin * this.scaleY,
      width: box.width * this.scaleX,
      height: box.height * this.scaleY,
    };
  }
}
