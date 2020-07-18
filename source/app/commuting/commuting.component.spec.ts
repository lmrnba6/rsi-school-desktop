import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CommutingComponent } from './commuting.component';

describe('CommutingComponent', () => {
  let component: CommutingComponent;
  let fixture: ComponentFixture<CommutingComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CommutingComponent ]
    })
        .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CommutingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
