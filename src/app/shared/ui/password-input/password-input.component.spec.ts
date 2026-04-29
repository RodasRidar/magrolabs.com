import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { Component } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { PasswordInputComponent } from './password-input.component';

@Component({
  standalone: true,
  imports: [PasswordInputComponent, ReactiveFormsModule],
  template: `
    <ml-password-input
      [label]="label"
      [required]="required"
      [errors]="errors"
      [formControl]="control"
    />
  `,
})
class TestHostComponent {
  label = 'Contraseña';
  required = false;
  errors: string[] = [];
  control = new FormControl('');
}

describe('PasswordInputComponent', () => {
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
      expect(label.nativeElement.textContent.trim()).toContain('Contraseña');
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
    });
  });

  describe('Password visibility toggle', () => {
    it('should default to type="password" (hidden)', () => {
      const input = fixture.debugElement.query(By.css('input'));
      expect(input.nativeElement.type).toBe('password');
    });

    it('should change to type="text" when toggle button is clicked', () => {
      const btn = fixture.debugElement.query(By.css('button[type="button"]'));
      btn.nativeElement.click();
      fixture.detectChanges();
      const input = fixture.debugElement.query(By.css('input'));
      expect(input.nativeElement.type).toBe('text');
    });

    it('should toggle back to type="password" on second click', () => {
      const btn = fixture.debugElement.query(By.css('button[type="button"]'));
      btn.nativeElement.click();
      fixture.detectChanges();
      btn.nativeElement.click();
      fixture.detectChanges();
      const input = fixture.debugElement.query(By.css('input'));
      expect(input.nativeElement.type).toBe('password');
    });

    it('should render the toggle button with an accessible aria-label', () => {
      const btn = fixture.debugElement.query(By.css('button[type="button"]'));
      expect(btn.nativeElement.getAttribute('aria-label')).toContain('contraseña');
    });
  });

  describe('Visual states', () => {
    it('should apply normal ring classes when there are no errors', () => {
      const input = fixture.debugElement.query(By.css('input'));
      expect(input.nativeElement.className).toContain('ring-gray-300');
    });

    it('should apply error ring classes when there are errors', () => {
      host.errors = ['*Contraseña obligatoria'];
      fixture.detectChanges();
      const input = fixture.debugElement.query(By.css('input'));
      expect(input.nativeElement.className).toContain('ring-red-500');
    });

    it('should disable the native input when the form control is disabled', () => {
      host.control.disable();
      fixture.detectChanges();
      const input = fixture.debugElement.query(By.css('input'));
      expect(input.nativeElement.disabled).toBeTrue();
    });
  });

  describe('Error messages', () => {
    it('should not render error messages when errors is empty', () => {
      const errors = fixture.debugElement.queryAll(By.css('p.text-red-500'));
      expect(errors.length).toBe(0);
    });

    it('should render one error paragraph per entry in errors', () => {
      host.errors = ['*Contraseña obligatoria', '*Mínimo 8 caracteres'];
      fixture.detectChanges();
      const errors = fixture.debugElement.queryAll(By.css('p.text-red-500'));
      expect(errors.length).toBe(2);
      expect(errors[0].nativeElement.textContent).toContain('*Contraseña obligatoria');
    });
  });

  describe('ControlValueAccessor', () => {
    it('should write value to the input via writeValue', () => {
      host.control.setValue('miPassword123');
      fixture.detectChanges();
      const input = fixture.debugElement.query(By.css('input'));
      expect(input.nativeElement.value).toBe('miPassword123');
    });

    it('should propagate input changes to the form control', () => {
      const input = fixture.debugElement.query(By.css('input'));
      input.nativeElement.value = 'nuevaPassword';
      input.nativeElement.dispatchEvent(new Event('input'));
      expect(host.control.value).toBe('nuevaPassword');
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
  });
});
