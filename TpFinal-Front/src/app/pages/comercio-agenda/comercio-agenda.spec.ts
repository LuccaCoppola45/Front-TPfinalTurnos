import { ComponentFixture, TestBed } from "@angular/core/testing";
import { ComercioAgenda } from "./comercio-agenda";

describe("ComercioAgenda", () => {
  let component: ComercioAgenda;
  let fixture: ComponentFixture<ComercioAgenda>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ComercioAgenda],
    }).compileComponents();

    fixture = TestBed.createComponent(ComercioAgenda);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
