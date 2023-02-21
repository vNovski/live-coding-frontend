import { AfterViewInit, ChangeDetectorRef, Directive, ElementRef, Input, Renderer2 } from '@angular/core';
import { isNill } from 'src/app/core/utils/isNill';

interface Screen {
  boundaries: {
    top: boolean,
    right: boolean,
    bottom: boolean,
    left: boolean
  }
  scroll: {
    top: number,
    left: number
  },
  width: number,
  height: number
}

@Directive({
  selector: '[appMouseIndicators]',
})
export class MouseIndicatorsDirective implements AfterViewInit {
  @Input('appMouseIndicators') set mouse(mouse: any) {
    if (!this.editorScroll) {
      this.editorScroll = this.elemRef.nativeElement.querySelector('.CodeMirror-scroll')
    }
    if (isNill(mouse)) {
      return;
    }
    this.update(mouse);
  };

  @Input('activeMouses') set activeMouses(activeMouses: string[]) {
    // clear disconnected cursors
    [...this.mouseElements.keys()].forEach(id => {
      if (!activeMouses.includes(id)) {
        this.renderer.removeChild(this.editorScroll, this.mouseElements.get(id));
        this.mouseElements.delete(id);
        const offScreenIndicatorEl = this.offScreenIndicatorElements.get(id);
        if(offScreenIndicatorEl) {
          this.renderer.removeChild(this.elemRef, offScreenIndicatorEl);
        }
        this.offScreenIndicatorElements.delete(id)
      }
    })
  };

  mouseElements: Map<string, SVGElement> = new Map<string, SVGElement>();
  offScreenIndicatorElements: Map<string, HTMLElement> = new Map<string, HTMLElement>();
  elemRef: ElementRef;
  editorScroll!: HTMLElement;

  constructor(elemRef: ElementRef, private readonly renderer: Renderer2, private readonly cdRef: ChangeDetectorRef) {
    this.elemRef = elemRef;
  }


  ngAfterViewInit() {
  }

  private update(mouse: any) {
    if(!this.editorScroll) {
      return;
    }
    const screen = this.getBoundaries(mouse);
    if (this.isOffScreen(screen)) {
      this.renderOffScreenMouseIndicator(mouse, screen);
    } else if (this.offScreenIndicatorElements.has(mouse.userId)) {
      const hideIndicator = { display: 'none' };
      this.updateOffScreenMouseIndicatorEl(this.offScreenIndicatorElements.get(mouse.userId)!, hideIndicator)
    }

    const { userId, color, y, x } = mouse;
    if (this.mouseElements.has(userId)) {
      const mouseEl = this.mouseElements.get(userId);
      this.renderer.setStyle(mouseEl, 'fill', color);
      this.renderer.setStyle(mouseEl, 'display', x && y ? 'block' : 'none');
      this.renderer.setStyle(mouseEl, 'top', y - 10); // 10px is a size of mouse icon
      this.renderer.setStyle(mouseEl, 'left', x);
      return;
    }
    const mouseEl = this.createMouseEl(userId, color, y, x)
    this.mouseElements.set(userId, mouseEl);
    this.renderer.appendChild(this.editorScroll, mouseEl);
  }

  private isOffScreen(screen: Screen): boolean {
    return Object.values(screen.boundaries).some(boundaries => boundaries);
  }

  private getBoundaries(mouse: any): Screen {

    const rect = this.elemRef.nativeElement?.getBoundingClientRect();
    const width = rect!.width;
    const height = rect!.height;
    const scrollTop = this.editorScroll!.scrollTop;
    const scrollLeft = this.editorScroll!.scrollLeft;

    return {
      boundaries: {
        top: mouse.y < scrollTop,
        right: mouse.x > width + scrollLeft,
        bottom: mouse.y >= height + scrollTop,
        left: mouse.x < scrollLeft
      },
      scroll: {
        top: this.editorScroll!.scrollTop,
        left: this.editorScroll!.scrollLeft
      },
      width: rect!.width,
      height: rect!.height

    }
  }


  renderOffScreenMouseIndicator(mouse: any, screen: Screen) {
    const rotationAngle = 90;
    const initialAngle = -45;

    const angles = {
      bottom: initialAngle,
      left: initialAngle + rotationAngle,
      top: initialAngle + (rotationAngle * 2),
      right: initialAngle + (rotationAngle * 3),
    }

    const result: any = { display: 'block', color: mouse.color, angle: initialAngle };

    const { top: isTop, right: isRight, bottom: isBottom, left: isLeft } = screen.boundaries;


    if (isTop) { // TOP
      result.top = 5;
      result.left = Math.min(mouse.x - screen.scroll.left, screen.width - 25);
      result.angle = angles.top;
    }

    if (isRight) { // RIGHT
      result.top = Math.max(Math.min(mouse.y - screen.scroll.top, screen.height - 25), 0);
      result.left = screen.width - 25;
      result.angle = angles.right;
    }

    if (isBottom) { // BOTTOM
      result.top = screen.height - 25;
      result.left = Math.min(mouse.x - screen.scroll.left, screen.width - 25);
      result.angle = angles.bottom;
    }

    if (isLeft) { // LEFT
      result.left = 5;
      result.top = Math.max(Math.min(mouse.y - screen.scroll.top, screen.height - 25), 0);
      result.angle = angles.left;
    }

    if (isTop && isRight) {
      result.angle -= rotationAngle / 2;
    }

    if (isTop && isLeft) {
      result.angle += rotationAngle / 2;
    }

    if (isBottom && isLeft) {
      result.angle = 0;
    }

    if (isBottom && isRight) {
      result.angle -= rotationAngle / 2;
    }
    if (result.top === undefined) {
      result.display = 'none';
    }

    result.top = +result.top.toFixed(2);
    result.left = +result.left.toFixed(2);

    if (this.offScreenIndicatorElements.has(mouse.userId)) {
      this.updateOffScreenMouseIndicatorEl(this.offScreenIndicatorElements.get(mouse.userId)!, result);
      return;
    }
    const indicatorEl = this.createOffScreenMouseIndicatorEl();
    this.offScreenIndicatorElements.set(mouse.userId, indicatorEl);
    this.renderer.appendChild(this.elemRef.nativeElement, indicatorEl);
  }

  private createMouseEl(id: string, color: string, top = -100, left = -100): SVGElement {
    const mouse = this.renderer.createElement('svg', 'svg');
    this.renderer.addClass(mouse, 'mouse');
    this.renderer.setAttribute(mouse, 'fill', color);
    this.renderer.setAttribute(mouse, 'xmlns', 'http://www.w3.org/2000/svg');
    this.renderer.setAttribute(mouse, 'viewBox', '0 0 24 24');
    this.renderer.setAttribute(mouse, 'width', '24px');
    this.renderer.setAttribute(mouse, 'id', id);
    this.renderer.setStyle(mouse, 'top', top);
    this.renderer.setStyle(mouse, 'left', left);
    mouse.innerHTML = `
    <path
       d="M8.3,3.213l9.468,8.836c0.475,0.443,0.2,1.24-0.447,1.296L13.2,13.7l2.807,6.21c0.272,0.602,0.006,1.311-0.596,1.585l0,0
       c-0.61,0.277-1.33,0-1.596-0.615L11.1,14.6l-2.833,2.695C7.789,17.749,7,17.411,7,16.751V3.778C7,3.102,7.806,2.752,8.3,3.213z"/>
    `
    return mouse;
  }

  private createOffScreenMouseIndicatorEl(): HTMLElement {
    const indicator = this.renderer.createElement('div');
    this.renderer.addClass(indicator, 'outside-screen-indicator');
    this.renderer.setStyle(indicator, 'display', 'none');
    return indicator;
  }

  private updateOffScreenMouseIndicatorEl(indicator: HTMLElement, config: any) {
    this.renderer.setStyle(indicator, 'background', config.color);
    this.renderer.setStyle(indicator, 'top', config.top + 'px');
    this.renderer.setStyle(indicator, 'left', config.left + 'px');
    this.renderer.setStyle(indicator, 'display', config.display);
    this.renderer.setStyle(indicator, 'transform', `rotate(${config.angle}deg)`);
  }
}
