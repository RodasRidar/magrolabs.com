import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';

import { WhatsappFabComponent } from './whatsapp-fab.component';

describe('WhatsappFabComponent', () => {
  let component: WhatsappFabComponent;
  let fixture: ComponentFixture<WhatsappFabComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [WhatsappFabComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(WhatsappFabComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('phone', '51999999999');
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('builds the WhatsApp href with phone and url-encoded message', () => {
    fixture.componentRef.setInput('message', 'Hola, necesito ayuda');
    fixture.detectChanges();

    const anchor = fixture.debugElement.query(By.css('a')).nativeElement as HTMLAnchorElement;
    expect(anchor.href).toBe(
      'https://api.whatsapp.com/send?phone=51999999999&text=Hola%2C%20necesito%20ayuda',
    );
  });

  it('adds max-sm:bottom-20 only when shifted is true', () => {
    let anchor = fixture.debugElement.query(By.css('a')).nativeElement as HTMLAnchorElement;
    expect(anchor.className).not.toContain('max-sm:bottom-20');

    fixture.componentRef.setInput('shifted', true);
    fixture.detectChanges();

    anchor = fixture.debugElement.query(By.css('a')).nativeElement as HTMLAnchorElement;
    expect(anchor.className).toContain('max-sm:bottom-20');
  });
});
