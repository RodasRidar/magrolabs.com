import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CookiesBannerComponent } from './cookies-banner.component';

describe('CookiesBannerComponent', () => {
  let component: CookiesBannerComponent;
  let fixture: ComponentFixture<CookiesBannerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CookiesBannerComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CookiesBannerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
