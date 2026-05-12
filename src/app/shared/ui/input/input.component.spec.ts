import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { Component } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { InputComponent } from './input.component';

@Component({
    imports: [InputComponent, ReactiveFormsModule],
    template: `
    <ml-input
      [label]="label"
      [type]="type"
      [placeholder]="placeholder"
      [required]="required"
      [readonly]="readonly"
      [errors]="errors"
      [formControl]="control"
    />
  `
})
class TestHostComponent {
  label = 'Correo';
  type: string = 'text';
  placeholder = '';
  required = false;
  readonly = false;
  errors: string[] = [];
  control = new FormControl('');
}

describe('InputComponent', () => {
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

  describe('Label', () => {
    it('should render the label text', () => {
      const label = fixture.debugElement.query(By.css('label'));
      expect(label.nativeElement.textContent.trim()).toContain('Correo');
    });

    it('should link label to the input via for/id', () => {
      const label = fixture.debugElement.query(By.css('label'));
      const input = fixture.debugElement.query(By.css('input'));
      expect(label.nativeElement.getAttribute('for')).toBe(input.nativeElement.id);
    });

    it('should NOT render asterisk when required is false', () => {
      const asterisk = fixture.debugElement.query(By.css('label span.text-red-500'));
      expect(asterisk).toBeNull();
    });

    it('should render asterisk when required is true', () => {
      host.required = true;
      fixture.detectChanges();
      const asterisk = fixture.debugElement.query(By.css('label span.text-red-500'));
      expect(asterisk).toBeTruthy();
      expect(asterisk.nativeElement.textContent.trim()).toBe('*');
    });
  });

  describe('Input element', () => {
    it('should render an input with default type "text"', () => {
      const input = fixture.debugElement.query(By.css('input'));
      expect(input.nativeElement.type).toBe('text');
    });

    it('should render an input with the specified type', () => {
      host.type = 'email';
      fixture.detectChanges();
      const input = fixture.debugElement.query(By.css('input'));
      expect(input.nativeElement.type).toBe('email');
    });

    it('should render the placeholder', () => {
      host.placeholder = 'Ingresá tu correo';
      fixture.detectChanges();
      const input = fixture.debugElement.query(By.css('input'));
      expect(input.nativeElement.placeholder).toBe('Ingresá tu correo');
    });

    it('should set readonly attribute when readonly is true', () => {
      host.readonly = true;
      fixture.detectChanges();
      const input = fixture.debugElement.query(By.css('input'));
      expect(input.nativeElement.readOnly).toBeTrue();
    });
  });

  describe('Visual states', () => {
    it('should apply normal ring classes when there are no errors', () => {
      const input = fixture.debugElement.query(By.css('input'));
      expect(input.nativeElement.className).toContain('ring-gray-300');
    });

    it('should apply error ring classes when there are errors', () => {
      host.errors = ['*Campo obligatorio'];
      fixture.detectChanges();
      const input = fixture.debugElement.query(By.css('input'));
      expect(input.nativeElement.className).toContain('ring-red-500');
    });

    it('should apply disabled classes when the control is disabled', () => {
      host.control.disable();
      fixture.detectChanges();
      const input = fixture.debugElement.query(By.css('input'));
      expect(input.nativeElement.disabled).toBeTrue();
    });

    it('should apply readonly classes when readonly is true', () => {
      host.readonly = true;
      fixture.detectChanges();
      const input = fixture.debugElement.query(By.css('input'));
      expect(input.nativeElement.className).toContain('bg-gray-50');
    });
  });

  describe('Error messages', () => {
    it('should not render error messages when errors is empty', () => {
      const errors = fixture.debugElement.queryAll(By.css('p.text-red-500'));
      expect(errors.length).toBe(0);
    });

    it('should render one error paragraph per entry in errors', () => {
      host.errors = ['*Campo obligatorio', '*Formato inválido'];
      fixture.detectChanges();
      const errors = fixture.debugElement.queryAll(By.css('p.text-red-500'));
      expect(errors.length).toBe(2);
      expect(errors[0].nativeElement.textContent).toContain('*Campo obligatorio');
      expect(errors[1].nativeElement.textContent).toContain('*Formato inválido');
    });
  });

  describe('ControlValueAccessor', () => {
    it('should write value to the input via writeValue', () => {
      host.control.setValue('hola@magro.com');
      fixture.detectChanges();
      const input = fixture.debugElement.query(By.css('input'));
      expect(input.nativeElement.value).toBe('hola@magro.com');
    });

    it('should propagate input changes to the form control', () => {
      const input = fixture.debugElement.query(By.css('input'));
      input.nativeElement.value = 'nuevo@magro.com';
      input.nativeElement.dispatchEvent(new Event('input'));
      expect(host.control.value).toBe('nuevo@magro.com');
    });

    it('should mark the control as touched on blur', () => {
      const input = fixture.debugElement.query(By.css('input'));
      input.nativeElement.dispatchEvent(new Event('blur'));
      expect(host.control.touched).toBeTrue();
    });

    it('should disable the native input when the form control is disabled', () => {
      host.control.disable();
      fixture.detectChanges();
      const input = fixture.debugElement.query(By.css('input'));
      expect(input.nativeElement.disabled).toBeTrue();
    });

    it('should re-enable the native input when the form control is re-enabled', () => {
      host.control.disable();
      fixture.detectChanges();
      host.control.enable();
      fixture.detectChanges();
      const input = fixture.debugElement.query(By.css('input'));
      expect(input.nativeElement.disabled).toBeFalse();
    });
  });
});
