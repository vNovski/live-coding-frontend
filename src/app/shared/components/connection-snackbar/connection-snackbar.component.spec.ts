import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ConnectionSnackbarComponent } from './connection-snackbar.component';

describe('ConnectionSnackbarComponent', () => {
  let component: ConnectionSnackbarComponent;
  let fixture: ComponentFixture<ConnectionSnackbarComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ConnectionSnackbarComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ConnectionSnackbarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
