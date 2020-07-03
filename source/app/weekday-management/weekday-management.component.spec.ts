import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { WeekdayManagementComponent } from './weekday-management.component';

describe('WeekdayManagementComponent', () => {
  let component: WeekdayManagementComponent;
  let fixture: ComponentFixture<WeekdayManagementComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ WeekdayManagementComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(WeekdayManagementComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
