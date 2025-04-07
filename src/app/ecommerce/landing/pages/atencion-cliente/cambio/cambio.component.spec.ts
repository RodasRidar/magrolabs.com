import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CambioComponent } from './cambio.component';

describe('CambioComponent', () => {
  let component: CambioComponent;
  let fixture: ComponentFixture<CambioComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CambioComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CambioComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
