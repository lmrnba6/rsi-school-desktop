import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CommuteFormComponent } from './commute-form.component';

describe('CommuteFormComponent', () => {
  let component: CommuteFormComponent;
  let fixture: ComponentFixture<CommuteFormComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CommuteFormComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CommuteFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
