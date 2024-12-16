import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CreatinasComponent } from './creatinas.component';

describe('CreatinasComponent', () => {
  let component: CreatinasComponent;
  let fixture: ComponentFixture<CreatinasComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CreatinasComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CreatinasComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
