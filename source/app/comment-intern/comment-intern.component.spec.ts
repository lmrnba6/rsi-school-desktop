import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CommentInternComponent } from './comment-intern.component';

describe('CommentComponent', () => {
  let component: CommentInternComponent;
  let fixture: ComponentFixture<CommentInternComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CommentInternComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CommentInternComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
