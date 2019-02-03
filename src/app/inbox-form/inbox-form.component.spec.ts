import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { InboxFormComponent } from './inbox-form.component';

describe('InboxFormComponent', () => {
  let component: InboxFormComponent;
  let fixture: ComponentFixture<InboxFormComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ InboxFormComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(InboxFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
