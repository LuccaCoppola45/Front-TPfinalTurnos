import { ComponentFixture, TestBed } from "@angular/core/testing";
import { ComercioHorarios } from "./comercio-horarios";

describe("ComercioHorarios", () => {
  let component: ComercioHorarios;
  let fixture: ComponentFixture<ComercioHorarios>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ComercioHorarios],
    }).compileComponents();

    fixture = TestBed.createComponent(ComercioHorarios);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
