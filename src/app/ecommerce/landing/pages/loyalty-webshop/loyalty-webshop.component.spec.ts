import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LoyaltyWebshopComponent } from './loyalty-webshop.component';

describe('LoyaltyWebshopComponent', () => {
  let component: LoyaltyWebshopComponent;
  let fixture: ComponentFixture<LoyaltyWebshopComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LoyaltyWebshopComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LoyaltyWebshopComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
