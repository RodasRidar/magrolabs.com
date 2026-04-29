import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { By } from '@angular/platform-browser';
import { Component } from '@angular/core';
import { LinkButtonComponent } from './link-button.component';

@Component({
  standalone: true,
  imports: [LinkButtonComponent],
  template: `<ml-link-button [routerLink]="link" [target]="target" [type]="type" [size]="size">Ir</ml-link-button>`,
})
class TestHostComponent {
  link: string | undefined = '/test';
  target: '_blank' | '_self' = '_self';
  type: 'primary' | 'primary-outlined' = 'primary';
  size: 'md' | 'lg' = 'md';
}

describe('LinkButtonComponent', () => {
  let fixture: ComponentFixture<TestHostComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TestHostComponent, RouterTestingModule],
    }).compileComponents();

    fixture = TestBed.createComponent(TestHostComponent);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('should render an anchor with routerLink when routerLink is provided', () => {
    const anchor = fixture.debugElement.query(By.css('a'));
    expect(anchor).toBeTruthy();
  });

  it('should apply primary color classes by default', () => {
    const anchor = fixture.debugElement.query(By.css('a'));
    expect(anchor.nativeElement.className).toContain('bg-primary');
    expect(anchor.nativeElement.className).toContain('text-white');
  });

  it('should add rel="noopener noreferrer" when target is _blank', () => {
    fixture.componentInstance.target = '_blank';
    fixture.detectChanges();
    const anchor = fixture.debugElement.query(By.css('a'));
    expect(anchor.nativeElement.getAttribute('rel')).toBe('noopener noreferrer');
  });

  it('should not add rel attribute when target is _self', () => {
    fixture.componentInstance.target = '_self';
    fixture.detectChanges();
    const anchor = fixture.debugElement.query(By.css('a'));
    expect(anchor.nativeElement.getAttribute('rel')).toBeNull();
  });

  it('should apply w-full and responsive padding for size lg', () => {
    fixture.componentInstance.size = 'lg';
    fixture.detectChanges();
    const anchor = fixture.debugElement.query(By.css('a'));
    expect(anchor.nativeElement.className).toContain('w-full');
  });

  it('should render an href anchor when href is provided instead of routerLink', async () => {
    await TestBed.resetTestingModule();
    await TestBed.configureTestingModule({
      imports: [
        RouterTestingModule,
        LinkButtonComponent,
      ],
    }).compileComponents();

    const hrefFixture = TestBed.createComponent(LinkButtonComponent);
    hrefFixture.componentRef.setInput('href', 'https://example.com');
    hrefFixture.componentRef.setInput('target', '_blank');
    hrefFixture.detectChanges();

    const anchor = hrefFixture.debugElement.query(By.css('a'));
    expect(anchor.nativeElement.getAttribute('href')).toBe('https://example.com');
  });
});
