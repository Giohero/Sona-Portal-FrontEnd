import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ScannerItemComponent } from './scanner-item.component';

describe('ScannerItemComponent', () => {
  let component: ScannerItemComponent;
  let fixture: ComponentFixture<ScannerItemComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ScannerItemComponent]
    });
    fixture = TestBed.createComponent(ScannerItemComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
