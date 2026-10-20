import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TurnoForm } from './turno-form';

describe('TurnoForm', () => {
  let component: TurnoForm;
  let fixture: ComponentFixture<TurnoForm>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TurnoForm]
    })
      .compileComponents();

    fixture = TestBed.createComponent(TurnoForm);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
