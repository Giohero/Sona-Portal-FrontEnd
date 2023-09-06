import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SnackbarsComponent } from './snackbars.component';

describe('SnackbarsComponent', () => {
  let component: SnackbarsComponent;
  let fixture: ComponentFixture<SnackbarsComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [SnackbarsComponent]
    });
    fixture = TestBed.createComponent(SnackbarsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
