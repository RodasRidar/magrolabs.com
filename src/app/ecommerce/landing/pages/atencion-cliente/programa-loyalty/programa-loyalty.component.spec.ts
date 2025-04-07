import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProgramaLoyaltyComponent } from './programa-loyalty.component';

describe('ProgramaLoyaltyComponent', () => {
  let component: ProgramaLoyaltyComponent;
  let fixture: ComponentFixture<ProgramaLoyaltyComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProgramaLoyaltyComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ProgramaLoyaltyComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
