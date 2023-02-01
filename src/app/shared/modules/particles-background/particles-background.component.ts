import {
  AfterViewInit,
  ChangeDetectorRef,
  Component,
  ElementRef,
  Input,
  NgZone,
  OnInit,
  ViewChild,
} from '@angular/core';
import { HEX } from 'src/app/core/types/color.type';

interface IMouse {
  x: number | null;
  y: number | null;
  radius: number;
}

class Particle {
  x: number;
  y: number;
  direction: number;
  size: number;
  color: string;
  speed: number;

  constructor(
    x: number,
    y: number,
    direction: number,
    speed: number,
    size: number,
    color: string
  ) {
    this.x = x;
    this.y = y;
    this.direction = direction;
    this.size = size;
    this.color = color;
    this.speed = speed;
  }
  // create method to draw individual particle
  draw(ctx: CanvasRenderingContext2D) {
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2, false);
    ctx.fillStyle = this.color;
    ctx.fill();
  }

  // check particle position, check mouse position, move the paticle, draw the particle
  update(canvas: HTMLCanvasElement, mouse: IMouse) {
    if (this.x > canvas.width || this.x < 0) {
      this.direction = (Math.PI - this.direction) % (2 * Math.PI);
    }
    if (this.y + this.size > canvas.height || this.y - this.size < 0) {
      this.direction = (2 * Math.PI - this.direction) % (2 * Math.PI);
    }

    if (mouse.x && mouse.y) {
      // check mouse position/particle position - collision detection
      let dx = mouse.x - this.x;
      let dy = mouse.y - this.y;
      let distance = Math.sqrt(dx * dx + dy * dy);
      if (distance < mouse.radius + this.size) {
        this.speed = 4;
        if (mouse.x < this.x && this.x < canvas.width - this.size * 10) {
          this.x += 1;
        }
        if (mouse.x > this.x && this.x > this.size * 10) {
          this.x -= 1;
        }
        if (mouse.y < this.y && this.y < canvas.height - this.size * 10) {
          this.y += 1;
        }
        if (mouse.y > this.y && this.y > this.size * 10) {
          this.y -= 1;
        }
      } else {
        this.speed = 1;
      }
    }

    this.x += this.speed * Math.cos(this.direction);
    this.y += this.speed * Math.sin(this.direction);
  }
}

interface IParticle {
  speed: number;
  color: HEX;
  size: {
    min: number;
    max: number;
  };
}

interface IConnection {
  distance: number;
  color: {
    r: number;
    g: number;
    b: number;
  };
  width: number;
}

@Component({
  selector: 'app-particles-background',
  templateUrl: './particles-background.component.html',
  styleUrls: ['./particles-background.component.scss'],
})
export class ParticlesBackgroundComponent implements OnInit, AfterViewInit {
  @Input('numberOfParticles') numberOfParticles: number = 100;
  @Input('particleConfig') particleConfig: IParticle = {
    speed: 1,
    color: '#34343e',
    size: {
      min: 2,
      max: 5,
    },
  };

  @Input('connectionConfig') set connection(connectionConfig: IConnection) {
    this.connectionConfig = {
      ...this.connectionConfig,
      ...connectionConfig,
      color: connectionConfig.color
        ? connectionConfig.color
        : this.connectionConfig.color,
    };
  }

  connectionConfig: IConnection = {
    distance: 50000,
    color: {
      r: 52,
      g: 52,
      b: 62,
    },
    width: 1,
  };

  @ViewChild('canvas', { static: true })
  canvas!: ElementRef<HTMLCanvasElement>;

  public ctx!: CanvasRenderingContext2D;
  particleArray: Particle[] = [];

  mouse: IMouse = {
    x: null,
    y: null,
    radius: 0,
  };

  constructor(private cdr: ChangeDetectorRef, private ngZone: NgZone) {}

  ngOnInit(): void {}

  ngAfterViewInit(): void {
    const ctx = this.canvas.nativeElement.getContext('2d');
    if (ctx) {
      this.canvas.nativeElement.width = window.innerWidth;
      this.canvas.nativeElement.height = window.innerHeight;
      this.ctx = ctx;
    }

    (this.mouse.radius =
      (this.canvas.nativeElement.height / 80) *
      (this.canvas.nativeElement.width / 80)),
      this.init();
    this.ngZone.runOutsideAngular(() => this.animate());
    this.cdr.detach();
  }

  // check if particles are close enough to draw line between them
  connect(): void {
    let opacityValue = 1;
    const { color, width } = this.connectionConfig;
    for (let a = 0; a < this.particleArray.length; a++) {
      for (let b = a; b < this.particleArray.length; b++) {
        let distance =
          (this.particleArray[a].x - this.particleArray[b].x) *
            (this.particleArray[a].x - this.particleArray[b].x) +
          (this.particleArray[a].y - this.particleArray[b].y) *
            (this.particleArray[a].y - this.particleArray[b].y);
        if (
          distance <
          (this.canvas.nativeElement.width / 7) *
            (this.canvas.nativeElement.height / 7)
        ) {
          opacityValue = 1 - distance / this.connectionConfig.distance;
          this.ctx.strokeStyle = `rgba(${color.r}, ${color.g}, ${color.b}, ${opacityValue} )`;
          this.ctx.beginPath();
          this.ctx.lineWidth = width;
          this.ctx.moveTo(this.particleArray[a].x, this.particleArray[a].y);
          this.ctx.lineTo(this.particleArray[b].x, this.particleArray[b].y);
          this.ctx.stroke();
        }
      }
    }
  }

  init() {
    this.canvas.nativeElement.width = window.innerWidth;
    this.canvas.nativeElement.height = window.innerHeight;
    const { color, size: particleSize, speed } = this.particleConfig;
    this.particleArray = [];
    for (let i = 0; i < this.numberOfParticles; i++) {
      let size = this.getRandomNumber(particleSize.min, particleSize.max);
      let x = Math.random() * (innerWidth - size * 2 - size * 2) + size * 2;
      let y = Math.random() * (innerHeight - size * 2 - size * 2) + size * 2;

      this.particleArray.push(
        new Particle(x, y, this.getRandomRadian(), speed, size, color)
      );
    }
  }

  // create animation loop
  animate() {
    requestAnimationFrame(this.animate.bind(this));
    this.ctx.clearRect(0, 0, innerWidth, innerHeight);

    for (let i = 0; i < this.particleArray.length; i++) {
      this.particleArray[i].update(this.canvas.nativeElement, this.mouse);
      this.particleArray[i].draw(this.ctx);
    }
    this.connect();
  }

  mouseMove(event: MouseEvent): void {
    this.mouse.x = event.x;
    this.mouse.y = event.y;
  }

  mouseOut(): void {
    this.mouse.x = null;
    this.mouse.y = null;
  }

  resize(): void {
    this.init();
  }

  getRandomNumber(min: number, max: number) {
    return Math.random() * (max - min) + min;
  }

  getRandomRadian() {
    return Math.random() * 2 * Math.PI;
  }
}
