import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { LogoComponent, LogoVariant } from './logo.component';

describe('LogoComponent', () => {
  let fixture: ComponentFixture<LogoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LogoComponent],
      providers: [provideHttpClient(), provideHttpClientTesting()],
    }).compileComponents();

    fixture = TestBed.createComponent(LogoComponent);
    fixture.detectChanges();
  });

  it('renderiza con role img y aria-label default', () => {
    const span = fixture.debugElement.query(By.css('span'));
    expect(span.nativeElement.getAttribute('role')).toBe('img');
    expect(span.nativeElement.getAttribute('aria-label')).toBe('Magrolabs');
  });

  it('usa el label custom si se provee', () => {
    fixture.componentRef.setInput('label', 'Inicio Magrolabs');
    fixture.detectChanges();
    const span = fixture.debugElement.query(By.css('span'));
    expect(span.nativeElement.getAttribute('aria-label')).toBe('Inicio Magrolabs');
  });

  it('cambia el variant', () => {
    fixture.componentRef.setInput('variant', 'isotipo' as LogoVariant);
    fixture.detectChanges();
    expect(fixture.componentInstance).toBeTruthy();
  });
});
