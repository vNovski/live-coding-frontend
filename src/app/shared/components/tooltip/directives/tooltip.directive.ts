import {
  ComponentFactoryResolver,
  ComponentRef,
  Directive,
  ElementRef,
  HostListener,
  Injector,
  Input,
  ReflectiveInjector,
  Renderer2,
  TemplateRef,
  Type,
  ViewContainerRef,
  ViewRef,
} from '@angular/core';
import { TooltipComponent } from '../tooltip.component';

@Directive({
  selector: '[appTooltip]',
})
export class TooltipDirective {
  // We can pass string, template or component
  @Input('appTooltip') content!: string | TemplateRef<any> | Type<any>;
  private componentRef!: ComponentRef<TooltipComponent> | null;

  constructor(
    private element: ElementRef,
    private renderer: Renderer2,
    private vcr: ViewContainerRef
  ) {
  }

  @HostListener('mouseenter')
  mouseenter() {
    if (this.componentRef) return;

    const injector = Injector.create({
      providers: [
        {
          provide: 'tooltipConfig',
          useValue: {
            host: this.element.nativeElement,
          },
        },
      ],
    });
    this.componentRef = this.vcr.createComponent(TooltipComponent, {
      injector,
      index: 0,
      projectableNodes : this.generateNgContent(),
    });
  }

  generateNgContent() {
    if (typeof this.content === 'string') {
      const element = this.renderer.createText(this.content);
      return [[element]];
    }

    if (this.content instanceof TemplateRef) {
      const viewRef = this.content.createEmbeddedView({});
      return [viewRef.rootNodes];
    }

    // Else it's a component
    const component = this.vcr.createComponent(this.content);
    return [[component.location.nativeElement]];
  }

  @HostListener('mouseout')
  mouseout() {
    this.destroy();
  }

  destroy() {
    this.componentRef && this.componentRef.destroy();
    this.componentRef = null;
  }

  ngOnDestroy() {
    this.destroy();
  }
}
