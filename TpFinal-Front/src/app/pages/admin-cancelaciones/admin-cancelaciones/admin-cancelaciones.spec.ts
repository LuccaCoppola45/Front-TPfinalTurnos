import { ComponentFixture, TestBed } from "@angular/core/testing";
import { AdminCancelaciones } from "./admin-cancelaciones";

describe("AdminCancelaciones", () => {
  let component: AdminCancelaciones;
  let fixture: ComponentFixture<AdminCancelaciones>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AdminCancelaciones],
    }).compileComponents();

    fixture = TestBed.createComponent(AdminCancelaciones);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
