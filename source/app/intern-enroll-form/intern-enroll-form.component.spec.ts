import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { InternEnrollFormComponent } from './intern-enroll-form.component';

describe('InternEnrollFormComponent', () => {
  let component: InternEnrollFormComponent;
  let fixture: ComponentFixture<InternEnrollFormComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ InternEnrollFormComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(InternEnrollFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
