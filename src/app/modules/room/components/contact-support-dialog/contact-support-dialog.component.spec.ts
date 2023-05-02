import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ContactSupportDialogComponent } from './contact-support-dialog.component';

describe('ContactSupportDialogComponent', () => {
  let component: ContactSupportDialogComponent;
  let fixture: ComponentFixture<ContactSupportDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ContactSupportDialogComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ContactSupportDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
