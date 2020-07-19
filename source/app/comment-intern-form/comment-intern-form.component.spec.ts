import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CommentInternFormComponent } from './comment-intern-form.component';

describe('CommentFormComponent', () => {
  let component: CommentInternFormComponent;
  let fixture: ComponentFixture<CommentInternFormComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CommentInternFormComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CommentInternFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
