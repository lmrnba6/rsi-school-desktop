import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import {PaymentInstructorComponent} from "./payment-instructor.component";



describe('PaymentInstructor', () => {
  let component: PaymentInstructorComponent;
  let fixture: ComponentFixture<PaymentInstructorComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PaymentInstructorComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PaymentInstructorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
