import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OrderWindowComponent } from './order-window.component';

describe('OrderWindowComponent', () => {
  let component: OrderWindowComponent;
  let fixture: ComponentFixture<OrderWindowComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [OrderWindowComponent]
    });
    fixture = TestBed.createComponent(OrderWindowComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
