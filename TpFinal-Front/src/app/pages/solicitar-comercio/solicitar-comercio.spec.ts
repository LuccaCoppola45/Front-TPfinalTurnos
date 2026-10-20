import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SolicitarComercio } from './solicitar-comercio';

describe('SolicitarComercio', () => {
  let component: SolicitarComercio;
  let fixture: ComponentFixture<SolicitarComercio>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SolicitarComercio]
    })
      .compileComponents();

    fixture = TestBed.createComponent(SolicitarComercio);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
