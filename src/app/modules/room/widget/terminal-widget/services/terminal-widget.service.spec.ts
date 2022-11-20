import { TestBed } from '@angular/core/testing';

import { TerminalWidgetService } from './terminal-widget.service';

describe('TerminalWidgetService', () => {
  let service: TerminalWidgetService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(TerminalWidgetService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
