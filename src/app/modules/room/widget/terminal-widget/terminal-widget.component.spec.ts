import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TerminalWidgetComponent } from './terminal-widget.component';

describe('TerminalWidgetComponent', () => {
  let component: TerminalWidgetComponent;
  let fixture: ComponentFixture<TerminalWidgetComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ TerminalWidgetComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(TerminalWidgetComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
