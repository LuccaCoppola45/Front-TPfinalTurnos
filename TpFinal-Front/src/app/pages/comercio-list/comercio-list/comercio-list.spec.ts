import { ComponentFixture, TestBed } from "@angular/core/testing";
import { ComercioList } from "./comercio-list";

describe("ComercioList", () => {
  let component: ComercioList;
  let fixture: ComponentFixture<ComercioList>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ComercioList],
    }).compileComponents();

    fixture = TestBed.createComponent(ComercioList);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
