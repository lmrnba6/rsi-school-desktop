import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PvComponent } from './pv.component';

describe('PvComponent', () => {
  let component: PvComponent;
  let fixture: ComponentFixture<PvComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PvComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PvComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
