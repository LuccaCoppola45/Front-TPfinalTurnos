import { ComponentFixture, TestBed } from "@angular/core/testing";
import { ComercioDetail } from "./comercio-detail";

describe("ComercioDetail", () => {
  let component: ComercioDetail;
  let fixture: ComponentFixture<ComercioDetail>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ComercioDetail],
    }).compileComponents();

    fixture = TestBed.createComponent(ComercioDetail);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
