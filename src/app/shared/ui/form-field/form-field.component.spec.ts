import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { Component } from '@angular/core';
import { FormFieldComponent } from './form-field.component';

@Component({
    imports: [FormFieldComponent],
    template: `
    <ml-form-field [label]="label" [inputId]="inputId" [required]="required" [errors]="errors">
      <input id="test-input" />
    </ml-form-field>
  `
})
class TestHostComponent {
  label = 'Correo';
  inputId = 'test-input';
  required = false;
  errors: string[] = [];
}

describe('FormFieldComponent', () => {
  let fixture: ComponentFixture<TestHostComponent>;
  let host: TestHostComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TestHostComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(TestHostComponent);
    host = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(host).toBeTruthy();
  });

  it('should render the label text', () => {
    const label = fixture.debugElement.query(By.css('label'));
    expect(label.nativeElement.textContent).toContain('Correo');
  });

  it('should link label to input via for/id', () => {
    const label = fixture.debugElement.query(By.css('label'));
    expect(label.nativeElement.getAttribute('for')).toBe('test-input');
  });

  it('should NOT show asterisk when required is false', () => {
    const asterisk = fixture.debugElement.query(By.css('label span'));
    expect(asterisk).toBeNull();
  });

  it('should show asterisk when required is true', () => {
    host.required = true;
    fixture.detectChanges();
    const asterisk = fixture.debugElement.query(By.css('label span'));
    expect(asterisk).toBeTruthy();
    expect(asterisk.nativeElement.textContent).toContain('*');
  });

  it('should not render error paragraphs when errors array is empty', () => {
    const errors = fixture.debugElement.queryAll(By.css('p.text-red-500'));
    expect(errors.length).toBe(0);
  });

  it('should render one error paragraph per message', () => {
    host.errors = ['*Campo obligatorio', '*Formato inválido'];
    fixture.detectChanges();
    const errors = fixture.debugElement.queryAll(By.css('p.text-red-500'));
    expect(errors.length).toBe(2);
    expect(errors[0].nativeElement.textContent).toContain('*Campo obligatorio');
    expect(errors[1].nativeElement.textContent).toContain('*Formato inválido');
  });

  it('should project slotted content (input)', () => {
    const input = fixture.debugElement.query(By.css('input'));
    expect(input).toBeTruthy();
  });
});
