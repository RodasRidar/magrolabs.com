import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FlowWidgetAddCardComponent } from './flow-widget-add-card.component';

describe('FlowWidgetAddCardComponent', () => {
  let component: FlowWidgetAddCardComponent;
  let fixture: ComponentFixture<FlowWidgetAddCardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FlowWidgetAddCardComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FlowWidgetAddCardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
