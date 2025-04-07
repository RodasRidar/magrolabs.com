import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PausarCancelarComponent } from './pausar-cancelar.component';

describe('PausarCancelarComponent', () => {
  let component: PausarCancelarComponent;
  let fixture: ComponentFixture<PausarCancelarComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PausarCancelarComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PausarCancelarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
