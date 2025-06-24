import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { LibroReclamacionesComponent } from './libro-reclamaciones.component';

describe('LibroReclamacionesComponent', () => {
  let component: LibroReclamacionesComponent;
  let fixture: ComponentFixture<LibroReclamacionesComponent>;
  let mockRouter: jasmine.SpyObj<Router>;

  beforeEach(async () => {
    const routerSpy = jasmine.createSpyObj('Router', ['navigate']);

    await TestBed.configureTestingModule({
      imports: [LibroReclamacionesComponent, ReactiveFormsModule],
      providers: [
        { provide: Router, useValue: routerSpy }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(LibroReclamacionesComponent);
    component = fixture.componentInstance;
    mockRouter = TestBed.inject(Router) as jasmine.SpyObj<Router>;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize form with default values', () => {
    expect(component.reclamacionForm).toBeDefined();
    expect(component.reclamacionForm.get('nombreProveedor')?.value).toBe('MAGRO LABS S.A.C.');
    expect(component.reclamacionForm.get('rucProveedor')?.value).toBe('20606664971');
  });

  it('should validate required fields', () => {
    const form = component.reclamacionForm;
    
    expect(form.get('nombreConsumidor')?.valid).toBeFalsy();
    expect(form.get('documentoConsumidor')?.valid).toBeFalsy();
    expect(form.get('emailConsumidor')?.valid).toBeFalsy();
    expect(form.get('tipoReclamacion')?.valid).toBeFalsy();
    expect(form.get('detalleReclamacion')?.valid).toBeFalsy();
  });

  it('should validate email format', () => {
    const emailControl = component.reclamacionForm.get('emailConsumidor');
    
    emailControl?.setValue('invalid-email');
    expect(emailControl?.valid).toBeFalsy();
    
    emailControl?.setValue('valid@email.com');
    expect(emailControl?.valid).toBeTruthy();
  });

  it('should validate phone number format', () => {
    const phoneControl = component.reclamacionForm.get('telefonoConsumidor');
    
    phoneControl?.setValue('123');
    expect(phoneControl?.valid).toBeFalsy();
    
    phoneControl?.setValue('987654321');
    expect(phoneControl?.valid).toBeTruthy();
  });

  it('should return true for invalid field when field is invalid and touched', () => {
    const control = component.reclamacionForm.get('nombreConsumidor');
    control?.markAsTouched();
    
    expect(component.isFieldInvalid('nombreConsumidor')).toBeTruthy();
  });

  it('should navigate back when goBack is called', () => {
    component.goBack();
    expect(mockRouter.navigate).toHaveBeenCalledWith(['/']);
  });

  it('should mark all fields as touched when form is invalid on submit', () => {
    spyOn(component.reclamacionForm, 'markAllAsTouched');
    
    component.onSubmit();
    
    expect(component.reclamacionForm.markAllAsTouched).toHaveBeenCalled();
  });

  it('should submit valid form', async () => {
    // Arrange
    const validFormData = {
      nombreConsumidor: 'Juan Pérez García',
      documentoConsumidor: '12345678',
      tipoDocumento: 'dni',
      telefonoConsumidor: '987654321',
      emailConsumidor: 'juan@email.com',
      direccionConsumidor: 'Av. Test 123',
      distritoConsumidor: 'Miraflores',
      provinciaConsumidor: 'Lima',
      departamentoConsumidor: 'Lima',
      tipoReclamacion: 'reclamo',
      descripcionBien: 'Producto de prueba para testing',
      detalleReclamacion: 'Detalle de la reclamación de prueba para el testing',
      pedidoConsumidor: 'Solicito reembolso completo'
    };

    component.reclamacionForm.patchValue(validFormData);
    
    spyOn(window, 'alert');
    
    // Act
    await component.onSubmit();
    
    // Assert
    expect(mockRouter.navigate).toHaveBeenCalledWith(['/']);
    expect(window.alert).toHaveBeenCalledWith(
      'Su reclamación ha sido enviada exitosamente. Recibirá una confirmación por correo electrónico.'
    );
  });
}); 