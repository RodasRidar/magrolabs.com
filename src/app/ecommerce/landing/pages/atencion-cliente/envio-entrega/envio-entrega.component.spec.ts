import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EnvioEntregaComponent } from './envio-entrega.component';

describe('EnvioEntregaComponent', () => {
  let component: EnvioEntregaComponent;
  let fixture: ComponentFixture<EnvioEntregaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EnvioEntregaComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EnvioEntregaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
