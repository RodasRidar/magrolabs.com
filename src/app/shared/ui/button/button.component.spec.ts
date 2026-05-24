import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { ButtonComponent, ButtonVariant } from './button.component';

describe('ButtonComponent', () => {
  let fixture: ComponentFixture<ButtonComponent>;
  let component: ButtonComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ButtonComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(ButtonComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('name', 'Continuar');
    fixture.detectChanges();
  });

  it('renderiza el nombre', () => {
    const button = fixture.debugElement.query(By.css('button'));
    expect(button.nativeElement.textContent.trim()).toBe('Continuar');
  });

  it('aplica clases primary por defecto', () => {
    const button = fixture.debugElement.query(By.css('button'));
    expect(button.nativeElement.className).toContain('bg-primary');
    expect(button.nativeElement.className).toContain('text-white');
  });

  it('aplica clases secondary cuando type=secondary', () => {
    fixture.componentRef.setInput('type', 'secondary' as ButtonVariant);
    fixture.detectChanges();
    const button = fixture.debugElement.query(By.css('button'));
    expect(button.nativeElement.className).toContain('bg-fg');
    expect(button.nativeElement.className).toContain('text-bg');
  });

  it('aplica clases secondary-outlined cuando type=secondary-outlined', () => {
    fixture.componentRef.setInput('type', 'secondary-outlined' as ButtonVariant);
    fixture.detectChanges();
    const button = fixture.debugElement.query(By.css('button'));
    expect(button.nativeElement.className).toContain('bg-bg');
    expect(button.nativeElement.className).toContain('border-border-strong');
  });

  it('disabled deshabilita el botón', () => {
    fixture.componentRef.setInput('isDisabled', true);
    fixture.detectChanges();
    const button = fixture.debugElement.query(By.css('button'));
    expect(button.nativeElement.disabled).toBeTrue();
  });

  it('muestra spinner cuando isProcessing es true', () => {
    fixture.componentRef.setInput('isProcessing', true);
    fixture.detectChanges();
    expect(fixture.debugElement.query(By.css('svg'))).toBeTruthy();
  });

  it('no muestra spinner cuando isProcessing es false', () => {
    expect(fixture.debugElement.query(By.css('svg'))).toBeNull();
  });
});
