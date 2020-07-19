import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CommentInstructorComponent } from './comment-instructor.component';

describe('CommentComponent', () => {
  let component: CommentInstructorComponent;
  let fixture: ComponentFixture<CommentInstructorComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CommentInstructorComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CommentInstructorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
