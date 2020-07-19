import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CommentInstructorFormComponent } from './comment-instructor-form.component';

describe('CommentFormComponent', () => {
  let component: CommentInstructorFormComponent;
  let fixture: ComponentFixture<CommentInstructorFormComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CommentInstructorFormComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CommentInstructorFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
