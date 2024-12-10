import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReferidoPorAmigoComponent } from './referido-por-amigo.component';

describe('ReferidoPorAmigoComponent', () => {
  let component: ReferidoPorAmigoComponent;
  let fixture: ComponentFixture<ReferidoPorAmigoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ReferidoPorAmigoComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ReferidoPorAmigoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
