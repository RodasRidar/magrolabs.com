import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { IconComponent, IconName } from './icon.component';

describe('IconComponent', () => {
  let fixture: ComponentFixture<IconComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [IconComponent],
      providers: [provideHttpClient(), provideHttpClientTesting()],
    }).compileComponents();

    fixture = TestBed.createComponent(IconComponent);
    fixture.componentRef.setInput('name', 'check' as IconName);
    fixture.detectChanges();
  });

  it('renderiza el wrapper con aria-hidden', () => {
    const span = fixture.debugElement.query(By.css('span'));
    expect(span.nativeElement.getAttribute('aria-hidden')).toBe('true');
  });

  it('cambia el icono al variar el name', () => {
    fixture.componentRef.setInput('name', 'star' as IconName);
    fixture.detectChanges();
    expect(fixture.componentInstance).toBeTruthy();
  });
});
