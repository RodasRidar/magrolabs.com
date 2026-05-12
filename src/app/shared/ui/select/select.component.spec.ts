import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { Component } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { SelectComponent } from './select.component';

@Component({
    imports: [SelectComponent, ReactiveFormsModule],
    template: `
    <ml-select
      [label]="label"
      [required]="required"
      [errors]="errors"
      [formControl]="control"
      (selectionChange)="onSelectionChange($event)"
    >
      <option value="">Seleccione</option>
      <option value="a">Opción A</option>
      <option value="b">Opción B</option>
    </ml-select>
  `
})
class TestHostComponent {
  label = 'Departamento';
  required = false;
  errors: string[] = [];
  control = new FormControl('');
  lastEvent: Event | null = null;
  onSelectionChange(event: Event) {
    this.lastEvent = event;
  }
}

describe('SelectComponent', () => {
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
      expect(label.nativeElement.textContent.trim()).toContain('Departamento');
    });

    it('should link label to the select via for/id', () => {
      const label = fixture.debugElement.query(By.css('label'));
      const select = fixture.debugElement.query(By.css('select'));
      expect(label.nativeElement.getAttribute('for')).toBe(select.nativeElement.id);
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

  describe('Select element', () => {
    it('should render a native select element', () => {
      const select = fixture.debugElement.query(By.css('select'));
      expect(select).toBeTruthy();
    });

    it('should project options via ng-content', () => {
      const options = fixture.debugElement.queryAll(By.css('select option'));
      expect(options.length).toBe(3);
    });
  });

  describe('Visual states', () => {
    it('should apply normal ring classes when there are no errors', () => {
      const select = fixture.debugElement.query(By.css('select'));
      expect(select.nativeElement.className).toContain('ring-gray-300');
    });

    it('should apply error ring classes when there are errors', () => {
      host.errors = ['*Campo obligatorio'];
      fixture.detectChanges();
      const select = fixture.debugElement.query(By.css('select'));
      expect(select.nativeElement.className).toContain('ring-red-500');
    });

    it('should disable the native select when the control is disabled', () => {
      host.control.disable();
      fixture.detectChanges();
      const select = fixture.debugElement.query(By.css('select'));
      expect(select.nativeElement.disabled).toBeTrue();
    });
  });

  describe('Error messages', () => {
    it('should not render error messages when errors is empty', () => {
      const errors = fixture.debugElement.queryAll(By.css('p.text-red-500'));
      expect(errors.length).toBe(0);
    });

    it('should render one error paragraph per entry in errors', () => {
      host.errors = ['*Campo obligatorio', '*Valor inválido'];
      fixture.detectChanges();
      const errors = fixture.debugElement.queryAll(By.css('p.text-red-500'));
      expect(errors.length).toBe(2);
      expect(errors[0].nativeElement.textContent).toContain('*Campo obligatorio');
    });
  });

  describe('ControlValueAccessor', () => {
    it('should write value to the select via writeValue', () => {
      host.control.setValue('a');
      fixture.detectChanges();
      const select = fixture.debugElement.query(By.css('select'));
      expect(select.nativeElement.value).toBe('a');
    });

    it('should propagate changes to the form control on native change', () => {
      const select = fixture.debugElement.query(By.css('select'));
      select.nativeElement.value = 'b';
      select.nativeElement.dispatchEvent(new Event('change'));
      expect(host.control.value).toBe('b');
    });

    it('should mark the control as touched on blur', () => {
      const select = fixture.debugElement.query(By.css('select'));
      select.nativeElement.dispatchEvent(new Event('blur'));
      expect(host.control.touched).toBeTrue();
    });

    it('should disable the native select when the form control is disabled', () => {
      host.control.disable();
      fixture.detectChanges();
      const select = fixture.debugElement.query(By.css('select'));
      expect(select.nativeElement.disabled).toBeTrue();
    });
  });

  describe('selectionChange output', () => {
    it('should emit selectionChange with the native Event on change', () => {
      const select = fixture.debugElement.query(By.css('select'));
      select.nativeElement.value = 'b';
      select.nativeElement.dispatchEvent(new Event('change'));
      expect(host.lastEvent).toBeTruthy();
      expect((host.lastEvent!.target as HTMLSelectElement).value).toBe('b');
    });
  });
});
