import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { WeekdayFormComponent } from './weekday-form.component';

describe('WeekdayFormComponent', () => {
  let component: WeekdayFormComponent;
  let fixture: ComponentFixture<WeekdayFormComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ WeekdayFormComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(WeekdayFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
