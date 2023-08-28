import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DialogAddcustomComponent } from './dialog-addcustom.component';

describe('DialogAddcustomComponent', () => {
  let component: DialogAddcustomComponent;
  let fixture: ComponentFixture<DialogAddcustomComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [DialogAddcustomComponent]
    });
    fixture = TestBed.createComponent(DialogAddcustomComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
