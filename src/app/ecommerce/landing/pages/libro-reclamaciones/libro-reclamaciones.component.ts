import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { NavbarComponent, NavbarTypeEnum } from '../../components/navbar/navbar.component';
import { FooterComponent } from '../../components/footer/footer.component';

interface ReclamacionFormData {
    // Datos del consumidor
    nombreConsumidor: string;
    documentoConsumidor: string;
    tipoDocumento: string;
    telefonoConsumidor: string;
    emailConsumidor: string;
    direccionConsumidor: string;
    distritoConsumidor: string;
    provinciaConsumidor: string;
    departamentoConsumidor: string;

    // Datos del proveedor (empresa)
    nombreProveedor: string;
    rucProveedor: string;
    direccionProveedor: string;

    // Detalle del producto/servicio
    tipoReclamacion: 'reclamo' | 'queja';
    descripcionBien: string;
    montoReclamado?: number;

    // Detalle de la reclamación
    detalleReclamacion: string;
    pedidoConsumidor: string;

    // Archivos adjuntos
    archivos?: FileList;
}

@Component({
    selector: 'app-libro-reclamaciones',
    standalone: true,
    imports: [CommonModule, ReactiveFormsModule, NavbarComponent, FooterComponent],
    templateUrl: './libro-reclamaciones.component.html',
    styleUrls: ['./libro-reclamaciones.component.css']
})
export class LibroReclamacionesComponent {
    private readonly formBuilder = inject(FormBuilder);
    private readonly router = inject(Router);
    type = NavbarTypeEnum
    readonly isSubmitting = signal(false);
    readonly reclamacionForm: FormGroup;

    constructor() {
        this.reclamacionForm = this.createForm();
    }

    private createForm(): FormGroup {
        return this.formBuilder.group({
            // Datos del consumidor
            nombreConsumidor: ['', [Validators.required, Validators.minLength(2)]],
            documentoConsumidor: ['', [Validators.required, Validators.minLength(8)]],
            tipoDocumento: ['', Validators.required],
            telefonoConsumidor: ['', [Validators.required, Validators.pattern(/^\d{9}$/)]],
            emailConsumidor: ['', [Validators.required, Validators.email]],
            direccionConsumidor: ['', [Validators.required, Validators.minLength(10)]],
            distritoConsumidor: ['', Validators.required],
            provinciaConsumidor: ['', Validators.required],
            departamentoConsumidor: ['', Validators.required],

            // Datos del proveedor (predefinidos)
            nombreProveedor: ['MAGRO LABS S.A.C.', Validators.required],
            rucProveedor: ['20606664971', Validators.required],
            direccionProveedor: ['Av. José Larco 1232, Miraflores, Lima, Perú', Validators.required],

            // Detalle del producto/servicio
            tipoReclamacion: ['', Validators.required],
            descripcionBien: ['', [Validators.required, Validators.minLength(10)]],
            montoReclamado: [null],

            // Detalle de la reclamación
            detalleReclamacion: ['', [Validators.required, Validators.minLength(20)]],
            pedidoConsumidor: ['', [Validators.required, Validators.minLength(10)]],

            // Archivos adjuntos
            archivos: [null]
        });
    }

    isFieldInvalid(fieldName: string): boolean {
        const field = this.reclamacionForm.get(fieldName);
        return !!(field && field.invalid && (field.dirty || field.touched));
    }

    async onSubmit(): Promise<void> {
        if (this.reclamacionForm.valid && !this.isSubmitting()) {
            this.isSubmitting.set(true);

            try {
                const formData = this.reclamacionForm.value as ReclamacionFormData;

                // Aquí implementarías la lógica para enviar la reclamación
                // Por ejemplo, llamar a un servicio para enviar los datos
                console.log('Enviando reclamación:', formData);

                // Simular procesamiento
                await new Promise(resolve => setTimeout(resolve, 2000));

                // Mostrar mensaje de confirmación y redirigir
                alert('Su reclamación ha sido enviada exitosamente. Recibirá una confirmación por correo electrónico.');
                this.router.navigate(['/']);

            } catch (error) {
                console.error('Error al enviar reclamación:', error);
                alert('Ocurrió un error al enviar su reclamación. Por favor, intente nuevamente.');
            } finally {
                this.isSubmitting.set(false);
            }
        } else {
            // Marcar todos los campos como touched para mostrar errores
            Object.keys(this.reclamacionForm.controls).forEach(key => {
                this.reclamacionForm.get(key)?.markAsTouched();
            });
        }
    }

    goBack(): void {
        this.router.navigate(['/']);
    }
} 