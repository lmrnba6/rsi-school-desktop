import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { InternManagementComponent } from './intern-management.component';

describe('InternManagementComponent', () => {
  let component: InternManagementComponent;
  let fixture: ComponentFixture<InternManagementComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ InternManagementComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(InternManagementComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
