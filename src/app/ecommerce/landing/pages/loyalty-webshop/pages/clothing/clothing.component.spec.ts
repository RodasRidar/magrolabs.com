import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ClothingComponent } from './clothing.component';

describe('ClothingComponent', () => {
  let component: ClothingComponent;
  let fixture: ComponentFixture<ClothingComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ClothingComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ClothingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
