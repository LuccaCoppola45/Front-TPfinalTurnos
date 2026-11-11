import { ComponentFixture, TestBed } from "@angular/core/testing";
import { ComercioDatos } from "./comercio-datos";

describe("ComercioDatos", () => {
  let component: ComercioDatos;
  let fixture: ComponentFixture<ComercioDatos>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ComercioDatos],
    }).compileComponents();

    fixture = TestBed.createComponent(ComercioDatos);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
