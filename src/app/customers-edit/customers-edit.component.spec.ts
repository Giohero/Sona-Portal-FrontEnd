import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CustomersEditComponent } from './customers-edit.component';

describe('CustomersEditComponent', () => {
  let component: CustomersEditComponent;
  let fixture: ComponentFixture<CustomersEditComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [CustomersEditComponent]
    });
    fixture = TestBed.createComponent(CustomersEditComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
