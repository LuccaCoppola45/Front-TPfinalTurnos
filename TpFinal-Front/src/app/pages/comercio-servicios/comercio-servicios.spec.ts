import { ComponentFixture, TestBed } from "@angular/core/testing";
import { ComercioServicios } from "./comercio-servicios";

describe("ComercioServicios", () => {
  let component: ComercioServicios;
  let fixture: ComponentFixture<ComercioServicios>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ComercioServicios],
    }).compileComponents();

    fixture = TestBed.createComponent(ComercioServicios);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
