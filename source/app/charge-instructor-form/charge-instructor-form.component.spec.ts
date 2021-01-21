import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import {ChargeInstructionFormComponent} from "./charge-instructor-form.component";


describe('ChargeInstructionFormComponent', () => {
  let component: ChargeInstructionFormComponent;
  let fixture: ComponentFixture<ChargeInstructionFormComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ChargeInstructionFormComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ChargeInstructionFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
