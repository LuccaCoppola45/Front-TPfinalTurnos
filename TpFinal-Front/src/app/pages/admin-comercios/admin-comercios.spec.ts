import { ComponentFixture, TestBed } from "@angular/core/testing";
import { AdminComercios } from "./admin-comercios";

describe("AdminComercios", () => {
  let component: AdminComercios;
  let fixture: ComponentFixture<AdminComercios>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AdminComercios],
    }).compileComponents();

    fixture = TestBed.createComponent(AdminComercios);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
