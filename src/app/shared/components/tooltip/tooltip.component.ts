import {
  Component,
  Directive,
  ElementRef,
  Inject,
  OnInit,
  ViewChild,
  AfterViewInit,
} from '@angular/core';
import { TooltipDirective } from './directives/tooltip.directive';

@Directive({
  selector: '.tooltip-container',
})
export class TooltipContainerDirective {}

@Component({
  selector: 'app-tooltip',
  templateUrl: './tooltip.component.html',
  styleUrls: ['./tooltip.component.scss'],
})
export class TooltipComponent implements AfterViewInit {
  top: string | undefined;
  @ViewChild(TooltipContainerDirective, { read: ElementRef, static: true })
  private tooltipContainer: any;

  constructor(@Inject('tooltipConfig') private config: any) {}

  ngOnInit() {
    // const { top } = this.config.host.getBoundingClientRect();
    const { top, height } =
    this.tooltipContainer.nativeElement.getBoundingClientRect();
    // console.log( top, height)
      this.top = `${-height}px`;
  }

  ngAfterViewInit(): void {
    
  }
}
