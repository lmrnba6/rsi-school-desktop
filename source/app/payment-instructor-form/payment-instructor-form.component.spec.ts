import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import {PaymentInstructorFormComponent} from "./payment-instructor-form.component";


describe('PaymentInstructorFormComponent', () => {
  let component: PaymentInstructorFormComponent;
  let fixture: ComponentFixture<PaymentInstructorFormComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PaymentInstructorFormComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PaymentInstructorFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
