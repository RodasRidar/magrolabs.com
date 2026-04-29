import { Component, OnInit, inject, signal, OnDestroy, PLATFORM_ID, Inject } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators, FormControl } from '@angular/forms';
import { AuthService } from '../../../shared/services/auth.service';
import { UserService } from '../../../shared/services/user.service';
import { finalize, takeUntil, debounceTime, distinctUntilChanged, filter, catchError, EMPTY, Subscription, Subject, Observable, tap, switchMap, map, of } from 'rxjs';
import { UpdatePasswordRequest, UserDetailResponse, UpdateUserRequest } from '../../../shared/interfaces/user.interfaces';
import { TypeDocument } from '../../../shared/interfaces/auth.interfaces';
import { ToastService } from '../../../shared/services/toast.service';
import { AddressService, PlaceAPI, Ubigeo } from '../../../shared/services/address-service.service';
import { AddressApiService } from '../../../shared/services/address-api.service';
import { CreateAddressRequest } from '../../../shared/interfaces/address.interfaces';
import { ActivatedRoute, Router } from '@angular/router';
import { FormFieldComponent } from '../../../shared/ui/form-field/form-field.component';
import { InputComponent } from '../../../shared/ui/input/input.component';
import { SelectComponent } from '../../../shared/ui/select/select.component';
import { PasswordInputComponent } from '../../../shared/ui/password-input/password-input.component';
import { CardComponent } from '../../../shared/ui/card/card.component';
import { PageHeaderComponent } from '../../../shared/ui/page-header/page-header.component';

// Ahora que hemos añadido birth_date a la interfaz original, solo necesitamos definir address_id
declare module '../../../shared/interfaces/user.interfaces' {
  interface UserDetailResponse {
    address_id?: string;
  }
}

@Component({
  selector: 'app-perfil',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormFieldComponent, InputComponent, SelectComponent, PasswordInputComponent, CardComponent, PageHeaderComponent],
  templateUrl: './perfil.component.html',
  styleUrl: './perfil.component.css'
})
export class PerfilComponent implements OnInit, OnDestroy {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private userService = inject(UserService);
  private toastService = inject(ToastService);
  private addressService = inject(AddressService);
  private addressApiService = inject(AddressApiService);
  private destroy$ = new Subject<void>();
  private platformId = inject(PLATFORM_ID);
  private router = inject(Router);
  private activatedRoute = inject(ActivatedRoute);
  
  // Query param para detectar si viene del flujo de creatina gratis
  isFromFreeCreatineFlow = signal(false);
  
  // Formularios
  profileForm!: FormGroup;
  passwordForm!: FormGroup;
  addressForm!: FormGroup;
  
  // Estado de UI
  isEditingProfile = signal(false);
  isEditingPassword = signal(false);
  isEditingAddress = signal(false);
  isLoading = signal(true); // Comenzamos con estado de carga
  submitAttempted = signal(false);
  formSubmitted = signal(false);
  
  // Mensajes
  successMessage = signal('');
  errorMessage = signal('');
  
  // Estados adicionales
  isProfileError = signal(false);
  loadingProfile = signal(true);
  loadingPassword = signal(false);
  loadingAddress = signal(false);
  isProcessing = signal(false);
  isSearchingAddress = signal(false);
  isSavingAddress = signal(false);
  
  // Datos de usuario
  userData: UserDetailResponse | null = null;

  // Tipos de documento
  typeDocuments = [
    { value: 'DNI', label: 'DNI' },
    { value: 'CE', label: 'Carnet de Extranjería' },
    { value: 'PASSPORT', label: 'Pasaporte' }
  ];
  
  // Dirección
  addressList: PlaceAPI[] = [];
  userAddress: PlaceAPI | null = null;
  isSearched = signal(false);
  hideSearching = signal(false);
  departmentUbigeo = '';
  provinceUbigeo = '';
  districtUbigeo = '';
  
  // Listas de ubigeos para la interfaz
  departmentsList: Ubigeo[] = [];
  provincesList: Ubigeo[] = [];
  districtsList: Ubigeo[] = [];
  
  departments$: Observable<Ubigeo[]> = this.addressService.getDepartments();
  provinces$: Observable<Ubigeo[]> = of([]);
  districts$: Observable<Ubigeo[]> = of([]);
  
  // Sujetos para validaciones asíncronas
  private emailSubject = new Subject<string>();
  private phoneSubject = new Subject<string>();
  private documentSubject = new Subject<string>();
  private subscriptions: Subscription[] = [];
  
  ngOnInit(): void {
    // Detectar si viene del flujo de creatina gratis
    this.activatedRoute.queryParams.subscribe(params => {
      if (params['isFromFreeCreatineFlow'] === 'true') {
        this.isFromFreeCreatineFlow.set(true);
        this.toastService.info('Completa tu dirección', 'Por favor, completa tu dirección para continuar con la activación de tu prueba.');
        
        // Activar automáticamente la edición de dirección
        setTimeout(() => {
          this.isEditingAddress.set(true);
          this.addressForm.enable();
        }, 500);
      }
    });
    
    this.initForms();
    this.setupValidators();
    this.setupAddressObservables();
    this.loadUserData();
  }
  
  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }
  
  private initForms(): void {
    // Formulario de perfil
    this.profileForm = this.fb.group({
      first_name: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(100), Validators.pattern(/^([A-Za-zÑñÁáÉéÍíÓóÚú ]+['-]{0,1}[A-Za-zÑñÁáÉéÍíÓóÚú ]+)(n+([A-Za-zÑñÁáÉéÍíÓóÚú ]+['-]{0,1}[A-Za-zÑñÁáÉéÍíÓóÚú ]+))*$/)]],
      last_name: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(100), Validators.pattern(/^([A-Za-zÑñÁáÉéÍíÓóÚú ]+['-]{0,1}[A-Za-zÑñÁáÉéÍíÓóÚú ]+)(n+([A-Za-zÑñÁáÉéÍíÓóÚú ]+['-]{0,1}[A-Za-zÑñÁáÉéÍíÓóÚú ]+))*$/)]],
      phone: ['', [Validators.required, Validators.minLength(9), Validators.maxLength(9), Validators.pattern(/^9[0-9]{8}$/)]],
      documentNumber: ['', [Validators.required, Validators.minLength(8), Validators.maxLength(12), Validators.pattern(/^[0-9A-Za-z]{8,12}$/)]],
      documentType: ['DNI', [Validators.required]],
      birth_date: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.email]]
    });
    
    // Formulario de contraseña
    this.passwordForm = this.fb.group({
      current_password: ['', [Validators.required]],
      new_password: ['', [Validators.required, Validators.minLength(8)]],
      confirm_password: ['', [Validators.required]]
    }, { validators: this.passwordMatchValidator });
    
    // Formulario de dirección
    this.addressForm = this.fb.group({
      searchAddress: ['', [Validators.minLength(3)]],
      streetAddress: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(150), Validators.pattern(/^[0-9A-Za-zÑñÁáÉéÍíÓóÚú \.\-\(\)#, ]{3,70}$/)]],
      department: ['', [Validators.required]],
      province: [{ value: '', disabled: true }, [Validators.required]],
      district: [{ value: '', disabled: true }, [Validators.required]],
      number: ['', [Validators.required, Validators.minLength(1), Validators.maxLength(20), Validators.pattern(/^[0-9A-Za-zÑñ\/\.,\-\s]{1,20}$/)]],
      reference: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(250), Validators.pattern(/^[0-9A-Za-zÑñÁáÉéÍíÓóÚú \.\-\(\)#, ]{3,250}$/)]],
      postalCode: ['', [Validators.minLength(5), Validators.maxLength(5), Validators.pattern(/^[0-9]{5}$/)]]
    });
    
    // Desactivar formularios inicialmente
    this.profileForm.disable();
    this.passwordForm.disable();
    this.addressForm.disable();
  }

  private setupValidators(): void {
    // Configurar debounce para email
    const emailSubscription = this.emailSubject.pipe(
      debounceTime(500),
      distinctUntilChanged(),
      filter(email => !!email && email.length > 5 && this.isValidEmail(email))
    ).subscribe(email => {
      this.validateEmailWithServer(email);
    });

    // Configurar validación en tiempo real para teléfono
    const phoneSubscription = this.phoneSubject.pipe(
      debounceTime(500),
      distinctUntilChanged(),
      filter(phone => !!phone && phone.length === 9)
    ).subscribe(phone => {
      this.validatePhoneWithServer(phone);
    });

    // Configurar validación en tiempo real para documento
    const documentSubscription = this.documentSubject.pipe(
      debounceTime(500),
      distinctUntilChanged(),
      filter(document => {
        const typeDoc = this.profileForm.get('documentType')?.value;
        if (typeDoc === 'DNI') return !!document && document.length === 8;
        return !!document && document.length >= 8 && document.length <= 12;
      })
    ).subscribe(document => {
      this.validateDocumentWithServer(document, this.profileForm.get('documentType')?.value);
    });

    this.subscriptions.push(emailSubscription, phoneSubscription, documentSubscription);

    // Escuchar cambios en el email
    this.profileForm.get('email')?.valueChanges.subscribe(val => {
      if (val && this.isEditingProfile()) {
        this.emailSubject.next(val);
      }
    });

    // Escuchar cambios en el teléfono
    this.profileForm.get('phone')?.valueChanges.subscribe(val => {
      if (val && this.isEditingProfile()) {
        this.phoneSubject.next(val);
      }
    });

    // Escuchar cambios en el documento
    this.profileForm.get('documentNumber')?.valueChanges.subscribe(val => {
      if (val && this.isEditingProfile()) {
        this.documentSubject.next(val);
      }
    });

    // Escuchar cambios en el tipo de documento
    this.profileForm.get('documentType')?.valueChanges.subscribe(val => {
      if (val && this.isEditingProfile()) {
        const documentNumber = this.profileForm.get('documentNumber')?.value;
        if (documentNumber) {
          this.documentSubject.next(documentNumber);
        }
      }
    });
  }
  
  private setupAddressObservables(): void {
    // Configurar búsqueda de direcciones
    const searchSubscription = this.addressForm.get('searchAddress')?.valueChanges.pipe(
      debounceTime(300),
      tap(() => this.isSearchingAddress.set(true)),
      switchMap(value => this.addressService.searchAddress(value || '')),
    ).subscribe((results: PlaceAPI[]) => {
      this.addressList = results;
      this.isSearchingAddress.set(false);
    });
    
    if (searchSubscription) {
      this.subscriptions.push(searchSubscription);
    }
    
    // Cargar listas de ubigeos
    this.departments$.subscribe(departments => {
      this.departmentsList = departments;
    });
  }
  
  private passwordMatchValidator(form: FormGroup): {[key: string]: boolean} | null {
    const newPassword = form.get('new_password')?.value;
    const confirmPassword = form.get('confirm_password')?.value;
    
    return newPassword === confirmPassword ? null : { passwordMismatch: true };
  }
  
  private loadUserData(): void {
    this.loadingProfile.set(true);
    this.isProfileError.set(false);
    
    this.userService.getCurrentUser()
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => {
          this.loadingProfile.set(false);
          this.isLoading.set(false);
        })
      )
      .subscribe({
        next: (userData) => {
          this.userData = userData;
          this.updateProfileFormValues(userData);
          this.loadUserAddress(userData.address_id);
        },
        error: (error) => {
          console.error('Error al cargar datos del usuario:', error);
          this.errorMessage.set('No se pudieron cargar los datos del usuario');
          this.isProfileError.set(true);
          
          // Intentar cargar datos de nuevo después de 5 segundos
          setTimeout(() => {
            if (this.isProfileError()) {
              this.errorMessage.set('Intentando cargar datos nuevamente...');
              this.loadUserData();
            }
          }, 5000);
        }
      });
  }
  
  private loadUserAddress(addressId?: string): void {
    if (!addressId) {
      this.loadingAddress.set(false);
      return;
    }
    
    this.loadingAddress.set(true);
    
    this.addressApiService.getAddressById(addressId)
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => {
          this.loadingAddress.set(false);
        })
      )
      .subscribe({
        next: (addressData) => {
          if (addressData?.data?.address) {
            const address = addressData.data.address;
            
            // Configurar los ubigeos
            this.departmentUbigeo = address.department_ubigeo || '';
            this.provinceUbigeo = address.province_ubigeo || '';
            this.districtUbigeo = address.district_ubigeo || '';
            
            // Actualizar selects encadenados
            if (this.departmentUbigeo) {
              this.provinces$ = this.addressService.getProvinces(this.departmentUbigeo);
              this.provinces$.subscribe(provinces => {
                this.provincesList = provinces;
              });
              this.addressForm.get('province')?.enable();
              
              if (this.provinceUbigeo) {
                this.districts$ = this.addressService.getDistricts(this.provinceUbigeo);
                this.districts$.subscribe(districts => {
                  this.districtsList = districts;
                });
                this.addressForm.get('district')?.enable();
              }
            }
            
            // Actualizar el formulario
            this.addressForm.patchValue({
              streetAddress: address.avenue || '',
              department: this.departmentUbigeo,
              province: this.provinceUbigeo,
              district: this.districtUbigeo,
              number: address.number || '',
              reference: address.reference || '',
              postalCode: address.postalcode || ''
            });
            
            this.isSearched.set(true);
            this.hideSearching.set(true);
          }
        },
        error: (error) => {
          console.error('Error al cargar dirección del usuario:', error);
        }
      });
  }

  // Verificar si el email tiene un formato válido
  private isValidEmail(email: string): boolean {
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return emailRegex.test(email);
  }

  // Validar email con el servidor
  private validateEmailWithServer(email: string): void {
    this.isProcessing.set(true);
    const control = this.profileForm.get('email');
    
    // Ignorar validación si es el mismo email del usuario actual
    if (email === this.userData?.email) {
      this.isProcessing.set(false);
      return;
    }
    
    if (control && !control.hasError('email')) {
      this.userService.validateEmail(email).pipe(
        catchError(() => EMPTY),
        finalize(() => this.isProcessing.set(false))
      ).subscribe(response => {
        if (response.data.exists) {
          control.setErrors({ emailExists: true });
        }
      });
    } else {
      this.isProcessing.set(false);
    }
  }

  // Validar teléfono con el servidor
  private validatePhoneWithServer(phone: string): void {
    this.isProcessing.set(true);
    const control = this.profileForm.get('phone');
    
    // Ignorar validación si es el mismo teléfono del usuario actual
    if (phone === this.userData?.phone) {
      this.isProcessing.set(false);
      return;
    }
    
    if (control && !control.hasError('pattern')) {
      this.userService.validatePhone(phone).pipe(
        catchError(() => EMPTY),
        finalize(() => this.isProcessing.set(false))
      ).subscribe(response => {
        if (response.data.exists) {
          control.setErrors({ phoneExists: true });
        }
      });
    } else {
      this.isProcessing.set(false);
    }
  }

  // Validar documento con el servidor
  private validateDocumentWithServer(document: string, typeDoc: TypeDocument): void {
    this.isProcessing.set(true);
    const control = this.profileForm.get('documentNumber');
    
    // Ignorar validación si es el mismo documento del usuario actual
    if (document === this.userData?.documentNumber && typeDoc === this.userData?.documentType) {
      this.isProcessing.set(false);
      return;
    }
    
    if (control && !control.hasError('pattern') && typeDoc) {
      this.userService.validateDocument(document, typeDoc).pipe(
        catchError(() => EMPTY),
        finalize(() => this.isProcessing.set(false))
      ).subscribe(response => {
        if (response.data.exists) {
          control.setErrors({ documentExists: true });
        }
      });
    } else {
      this.isProcessing.set(false);
    }
  }
  
  private updateProfileFormValues(userData: UserDetailResponse): void {
    if (!userData) return;
    console.log('Datos del usuario:', userData);
    
    // Formatear la fecha de nacimiento para el input date (YYYY-MM-DD)
    let formattedBirthDate = '';
    if (userData.birth_date) {
      try {
        const birthDate = new Date(userData.birth_date);
        formattedBirthDate = birthDate.toISOString().split('T')[0];
        console.log('Fecha formateada:', formattedBirthDate);
      } catch (e) {
        console.error('Error al formatear la fecha de nacimiento:', e);
      }
    }
    
    this.profileForm.patchValue({
      first_name: userData.first_name || '',
      last_name: userData.last_name || '',
      documentNumber: userData.documentNumber || '',
      documentType: userData.documentType || 'DNI',
      birth_date: formattedBirthDate,
      phone: userData.phone || '',
      email: userData.email || ''
    });
  }
  
  // Método para obtener nombres de ubicaciones
  getUbigeoName(type: 'department' | 'province' | 'district'): string {
    const ubigeoValue = this.addressForm.get(type)?.value;
    if (!ubigeoValue) return '';
    
    let result = '';
    
    switch (type) {
      case 'department':
        result = this.departmentsList.find(d => d.id_ubigeo === ubigeoValue)?.nombre_ubigeo || '';
        break;
      case 'province':
        result = this.provincesList.find(p => p.id_ubigeo === ubigeoValue)?.nombre_ubigeo || '';
        break;
      case 'district':
        result = this.districtsList.find(d => d.id_ubigeo === ubigeoValue)?.nombre_ubigeo || '';
        break;
    }
    
    return result;
  }
  
  // Métodos para edición de perfil
  toggleProfileEdit(): void {
    if (this.isEditingProfile()) {
      this.isEditingProfile.set(false);
      this.profileForm.disable();
      this.updateProfileFormValues(this.userData!);
    } else {
      this.isEditingProfile.set(true);
      this.profileForm.enable();
      // Mantener email deshabilitado
      this.profileForm.get('email')?.disable();
    }
  }
  
  saveProfile(): void {
    this.submitAttempted.set(true);
    
    if (this.profileForm.invalid) {
      // Mostrar errores en los campos
      Object.keys(this.profileForm.controls).forEach(key => {
        const control = this.profileForm.get(key);
        if (control) {
          control.markAsTouched();
        }
      });
      
      this.toastService.error('Error', 'Por favor, corrige los errores en el formulario antes de continuar.');
      return;
    }
    
    this.isLoading.set(true);
    this.formSubmitted.set(true);
    
    // Construir el objeto de actualización
    const userData: UpdateUserRequest = {
      first_name: this.profileForm.get('first_name')?.value,
      last_name: this.profileForm.get('last_name')?.value,
      phone: this.profileForm.get('phone')?.value,
      documentNumber: this.profileForm.get('documentNumber')?.value,
      documentType: this.profileForm.get('documentType')?.value
    };
    
    // Formatear correctamente la fecha de nacimiento en formato ISO
    const birthDateValue = this.profileForm.get('birth_date')?.value;
    if (birthDateValue) {
      try {
        // Convertir YYYY-MM-DD a ISO-8601 completo
        const date = new Date(birthDateValue);
        // Usar setUTCHours para asegurar que la fecha se mantenga correcta independientemente de la zona horaria
        date.setUTCHours(0, 0, 0, 0);
        userData.birth_date = date.toISOString();
      } catch (e) {
        console.error('Error al formatear la fecha de nacimiento:', e);
        // Si hay un error, no enviamos el campo birth_date
      }
    }
    
    const userId = this.userData?.id || '';
    
    this.userService.updateUser(userId, userData)
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => {
          this.isLoading.set(false);
          this.formSubmitted.set(false);
        })
      )
      .subscribe({
        next: (response) => {
          this.successMessage.set('Perfil actualizado correctamente');
          this.userData = response;
          this.toggleProfileEdit();
          
          setTimeout(() => {
            this.successMessage.set('');
          }, 3000);
        },
        error: (error) => {
          console.error('Error al actualizar el perfil:', error);
          this.errorMessage.set('No se pudo actualizar el perfil');
          
          setTimeout(() => {
            this.errorMessage.set('');
          }, 3000);
        }
      });
  }
  
  // Métodos para cambio de contraseña
  togglePasswordEdit(): void {
    if (this.isEditingPassword()) {
      this.isEditingPassword.set(false);
      this.passwordForm.disable();
      this.passwordForm.reset();
    } else {
      this.isEditingPassword.set(true);
      this.passwordForm.enable();
    }
  }
  
  changePassword(): void {
    this.submitAttempted.set(true);
    
    if (this.passwordForm.invalid) {
      return;
    }
    
    this.loadingPassword.set(true);
    this.formSubmitted.set(true);
    
    const passwordData:UpdatePasswordRequest = {
      currentPassword: this.passwordForm.get('current_password')?.value,
      newPassword: this.passwordForm.get('new_password')?.value,
      confirmPassword: this.passwordForm.get('confirm_password')?.value
    };
    
    this.userService.updatePassword(passwordData)
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => {
          this.loadingPassword.set(false);
          this.formSubmitted.set(false);
        })
      )
      .subscribe({
        next: () => {
          this.successMessage.set('Contraseña actualizada correctamente');
          this.togglePasswordEdit();
          this.passwordForm.reset();
          
          setTimeout(() => {
            this.successMessage.set('');
          }, 3000);
        },
        error: (error) => {
          console.error('Error al cambiar la contraseña:', error);
          this.errorMessage.set('No se pudo actualizar la contraseña');
          
          setTimeout(() => {
            this.errorMessage.set('');
          }, 3000);
        }
      });
  }
  
  // Métodos para gestión de dirección
  toggleAddressEdit(): void {
    if (this.isEditingAddress()) {
      this.isEditingAddress.set(false);
      this.addressForm.disable();
      // Recargar los datos originales de la dirección
      if (this.userData?.address_id) {
        this.loadUserAddress(this.userData.address_id);
      }
    } else {
      this.isEditingAddress.set(true);
      this.addressForm.enable();
      // Mantener algunos campos deshabilitados si es necesario
      if (!this.departmentUbigeo) {
        this.addressForm.get('province')?.disable();
        this.addressForm.get('district')?.disable();
      } else if (!this.provinceUbigeo) {
        this.addressForm.get('district')?.disable();
      }
    }
  }
  
  saveAddress(): void {
    this.submitAttempted.set(true);
    
    if (this.addressForm.invalid) {
      // Mostrar errores en los campos
      Object.keys(this.addressForm.controls).forEach(key => {
        const control = this.addressForm.get(key);
        if (control) {
          control.markAsTouched();
        }
      });
      
      this.toastService.error('Error', 'Por favor, corrige los errores en el formulario de dirección antes de continuar.');
      return;
    }
    
    this.isSavingAddress.set(true);
    
    // Obtener los datos de las listas para construir el objeto de dirección
    const department = this.departmentsList.find((x) => x.id_ubigeo === this.departmentUbigeo);
    const province = this.provincesList.find((x) => x.id_ubigeo === this.provinceUbigeo);
    const district = this.districtsList.find((x) => x.id_ubigeo === this.districtUbigeo);
    
    const addressRequest: CreateAddressRequest = {
      avenue: this.addressForm.get('streetAddress')?.value || '',
      department: department?.nombre_ubigeo || '',
      department_ubigeo: this.departmentUbigeo,
      province: province?.nombre_ubigeo || '',
      province_ubigeo: this.provinceUbigeo,
      district: district?.nombre_ubigeo || '',
      district_ubigeo: this.districtUbigeo,
      number: this.addressForm.get('number')?.value || '',
      reference: this.addressForm.get('reference')?.value || '',
    };
    
    // Agregar campo opcional de código postal si tiene valor
    const postalCode = this.addressForm.get('postalCode')?.value;
    if (postalCode) {
      addressRequest.postalcode = postalCode;
    }
    
    // Determinar si crear o actualizar la dirección
    if (this.userData?.address_id) {
      // Actualizar dirección existente
      this.addressApiService.updateAddress(this.userData.address_id, addressRequest)
        .pipe(
          takeUntil(this.destroy$),
          finalize(() => {
            this.isSavingAddress.set(false);
          })
        )
        .subscribe({
          next: (response) => {
            this.toastService.success('¡Listo!', 'Dirección actualizada correctamente');
            this.toggleAddressEdit();
            
            // Redireccionar si viene del flujo de creatina gratis
            if (this.isFromFreeCreatineFlow()) {
              setTimeout(() => {
                this.router.navigate(['/cuenta/mi-cuenta']);
              }, 1500);
            }
          },
          error: (error) => {
            console.error('Error al actualizar la dirección:', error);
            this.toastService.error('Ups!', 'No se pudo actualizar la dirección. Por favor, intenta nuevamente.');
          }
        });
    } else {
      // Crear nueva dirección
      this.addressApiService.createAddress(addressRequest)
        .pipe(
          switchMap(response => {
            const addressId = response.data.address.id;
            // Actualizar el usuario con la nueva dirección
            return this.userService.updateUser(this.userData?.id || '', { address_id: addressId });
          }),
          takeUntil(this.destroy$),
          finalize(() => {
            this.isSavingAddress.set(false);
          })
        )
        .subscribe({
          next: () => {
            this.toastService.success('¡Listo!', 'Dirección guardada correctamente');
            this.toggleAddressEdit();
            
            // Recargar los datos del usuario para obtener el nuevo address_id
            this.loadUserData();
            
            // Redireccionar si viene del flujo de creatina gratis
            if (this.isFromFreeCreatineFlow()) {
              setTimeout(() => {
                this.router.navigate(['/cuenta/mi-cuenta']);
              }, 1500);
            }
          },
          error: (error) => {
            console.error('Error al guardar la dirección:', error);
            this.toastService.error('Ups!', 'No se pudo guardar la dirección. Por favor, intenta nuevamente.');
          }
        });
    }
  }
  
  selectAddress(address: PlaceAPI): void {
    this.userAddress = address;
    this.isSearched.set(true);
    this.hideSearching.set(true);
    
    // Configurar ubicación
    this.addressService.getDepartments().pipe(
      map((departments) => {
        this.departmentsList = departments;
        this.departmentUbigeo = this.findIdUbigeo(address.address.region == 'Province of Lima' ? 'Lima' : address.address.region, departments);
        this.provinces$ = this.addressService.getProvinces(this.departmentUbigeo);
        return this.departmentUbigeo;
      }),
      switchMap((departmentUbigeo) =>
        this.addressService.getProvinces(departmentUbigeo).pipe(
          map((provinces) => {
            this.provincesList = provinces;
            this.provinceUbigeo = this.findIdUbigeo(address.address.city == 'Lima Metropolitana' ? 'Lima' : address.address.city ?? address.address.state ?? '', provinces);
            this.districts$ = this.addressService.getDistricts(this.provinceUbigeo);
            return this.provinceUbigeo;
          })
        )
      ),
      switchMap((provinceUbigeo) =>
        this.addressService.getDistricts(provinceUbigeo).pipe(
          map((districts) => {
            this.districtsList = districts;
            this.districtUbigeo = this.findIdUbigeo(address.address.suburb, districts);
            return this.districtUbigeo;
          })
        )
      )
    ).subscribe(() => {
      // Actualizar formulario con datos de la dirección seleccionada
      this.addressForm.patchValue({
        streetAddress: address.address.road ?? '',
        postalCode: address.address.postcode ?? '',
        department: this.departmentUbigeo,
        province: this.provinceUbigeo,
        district: this.districtUbigeo,
        number: address.address.house_number ?? ''
      });
      
      // Habilitar campos según la selección
      this.addressForm.get('province')?.enable();
      this.addressForm.get('district')?.enable();
    });
  }
  
  selectDepartment(event: any): void {
    this.districts$ = this.addressService.getDistricts('');
    this.departmentUbigeo = event.target.value;
    this.provinces$ = this.addressService.getProvinces(this.departmentUbigeo);
    
    // Actualizar la lista de provincias
    this.provinces$.subscribe(provinces => {
      this.provincesList = provinces;
    });
    
    this.addressForm.get('province')?.enable();
    this.addressForm.get('district')?.disable();
    
    // Resetear los valores de provincia y distrito
    this.addressForm.patchValue({
      province: '',
      district: ''
    });
  }

  selectProvince(event: any): void {
    this.provinceUbigeo = event.target.value;
    this.districts$ = this.addressService.getDistricts(this.provinceUbigeo);
    
    // Actualizar la lista de distritos
    this.districts$.subscribe(districts => {
      this.districtsList = districts;
    });
    
    this.addressForm.get('district')?.enable();
    
    // Resetear el valor de distrito
    this.addressForm.patchValue({
      district: ''
    });
  }

  selectDistrict(event: any): void {
    this.districtUbigeo = event.target.value;
  }

  findIdUbigeo(name: string | undefined, list: Ubigeo[]): string {
    if (!name) {
      return '';
    }
    return list.find((x) => x.nombre_ubigeo === name)?.id_ubigeo || '';
  }
  
  // Reintentar carga después de error
  retryLoad(): void {
    this.errorMessage.set('');
    this.isProfileError.set(false);
    this.loadUserData();
  }
  
  // Validación de campos
  hasError(form: FormGroup, controlName: string, errorType?: string): boolean {
    const control = form.get(controlName);
    if (!control) return false;
    
    if (errorType) {
      return (control.touched || this.submitAttempted()) && control.hasError(errorType);
    }
    
    return (control.touched || this.submitAttempted()) && control.invalid;
  }
  
  // Validaciones específicas
  hasEmailExistsError(): boolean {
    return this.profileForm.get('email')?.hasError('emailExists') || false;
  }
  
  hasPhoneExistsError(): boolean {
    return this.profileForm.get('phone')?.hasError('phoneExists') || false;
  }
  
  hasDocumentExistsError(): boolean {
    return this.profileForm.get('documentNumber')?.hasError('documentExists') || false;
  }
  
  // Obtener mensajes de error personalizados
  getDocumentLabel(): string {
    const documentType = this.profileForm.get('documentType')?.value;
    switch (documentType) {
      case 'DNI': return 'DNI';
      case 'CE': return 'Carnet de Extranjería';
      case 'PASSPORT': return 'Pasaporte';
      default: return 'Documento';
    }
  }
  
  // Obtener longitud requerida para documento
  getDocumentMinLength(): number {
    const documentType = this.profileForm.get('documentType')?.value;
    return documentType === 'DNI' ? 8 : 8;
  }
  
  getDocumentMaxLength(): number {
    const documentType = this.profileForm.get('documentType')?.value;
    return documentType === 'DNI' ? 8 : 12;
  }
  
  // Limitar dígitos en campos numéricos
  limitDigits(field: string, maxLength: number): void {
    const control = this.profileForm.get(field) || this.addressForm.get(field);
    if (control) {
      const value = control.value?.toString() || '';
      if (value.length > maxLength) {
        control.setValue(value.slice(0, maxLength));
      }
    }
  }
  
  getPasswordMatchError(): boolean {
    return (
      this.submitAttempted() && 
      this.passwordForm.hasError('passwordMismatch') && 
      this.passwordForm.get('confirm_password')?.value
    );
  }

  // --- ml-form-field error getters ---

  // profileForm
  get firstNameErrors(): string[] {
    if (this.hasError(this.profileForm, 'first_name', 'required')) return ['El nombre es obligatorio'];
    return [];
  }

  get lastNameErrors(): string[] {
    if (this.hasError(this.profileForm, 'last_name', 'required')) return ['El apellido es obligatorio'];
    return [];
  }

  get documentTypeErrors(): string[] {
    if (this.hasError(this.profileForm, 'documentType', 'required')) return ['El tipo de documento es obligatorio'];
    return [];
  }

  get documentNumberErrors(): string[] {
    if (this.hasError(this.profileForm, 'documentNumber', 'required')) return ['El número de documento es obligatorio'];
    if (this.hasError(this.profileForm, 'documentNumber', 'minlength') || this.hasError(this.profileForm, 'documentNumber', 'maxlength'))
      return [`El ${this.getDocumentLabel()} debe tener entre ${this.getDocumentMinLength()} y ${this.getDocumentMaxLength()} caracteres`];
    if (this.hasError(this.profileForm, 'documentNumber', 'pattern')) return ['El formato del documento no es válido'];
    if (this.hasDocumentExistsError()) return ['Este número de documento ya está registrado'];
    return [];
  }

  get birthDateErrors(): string[] {
    if (this.hasError(this.profileForm, 'birth_date', 'required')) return ['La fecha de nacimiento es obligatoria'];
    return [];
  }

  get phoneErrors(): string[] {
    if (this.hasError(this.profileForm, 'phone', 'required')) return ['El teléfono es obligatorio'];
    if (this.hasError(this.profileForm, 'phone', 'pattern')) return ['Ingrese un número válido que comience con 9 seguido de 8 dígitos'];
    if (this.hasPhoneExistsError()) return ['Este número de teléfono ya está registrado'];
    return [];
  }

  // addressForm
  get addrStreetAddressErrors(): string[] {
    if (this.hasError(this.addressForm, 'streetAddress', 'required')) return ['La calle/avenida es obligatoria'];
    if (this.hasError(this.addressForm, 'streetAddress', 'pattern')) return ['El formato de la calle/avenida no es válido'];
    return [];
  }

  get addrNumberErrors(): string[] {
    if (this.hasError(this.addressForm, 'number', 'required')) return ['Campo obligatorio'];
    if (this.hasError(this.addressForm, 'number', 'pattern')) return ['Solo se permiten caracteres alfanuméricos y . - / (máximo 20 caracteres)'];
    return [];
  }

  get addrDepartmentErrors(): string[] {
    if (this.hasError(this.addressForm, 'department', 'required')) return ['El departamento es obligatorio'];
    return [];
  }

  get addrProvinceErrors(): string[] {
    if (this.hasError(this.addressForm, 'province', 'required')) return ['La provincia es obligatoria'];
    return [];
  }

  get addrDistrictErrors(): string[] {
    if (this.hasError(this.addressForm, 'district', 'required')) return ['El distrito es obligatorio'];
    return [];
  }

  get addrPostalCodeErrors(): string[] {
    if (this.hasError(this.addressForm, 'postalCode', 'pattern')) return ['El código postal debe tener 5 dígitos numéricos'];
    return [];
  }

  get addrReferenceErrors(): string[] {
    if (this.hasError(this.addressForm, 'reference', 'required')) return ['La referencia es obligatoria'];
    if (this.hasError(this.addressForm, 'reference', 'pattern')) return ['La referencia contiene caracteres no permitidos'];
    if (this.hasError(this.addressForm, 'reference', 'minlength')) return ['La referencia debe tener al menos 3 caracteres'];
    return [];
  }

  // passwordForm
  get currentPasswordErrors(): string[] {
    if (this.hasError(this.passwordForm, 'current_password', 'required')) return ['La contraseña actual es obligatoria'];
    return [];
  }

  get newPasswordErrors(): string[] {
    if (this.hasError(this.passwordForm, 'new_password', 'required')) return ['La nueva contraseña es obligatoria'];
    if (this.hasError(this.passwordForm, 'new_password', 'minlength')) return ['La contraseña debe tener al menos 8 caracteres'];
    return [];
  }

  get confirmPasswordErrors(): string[] {
    if (this.hasError(this.passwordForm, 'confirm_password', 'required')) return ['Debes confirmar la contraseña'];
    if (this.getPasswordMatchError()) return ['Las contraseñas no coinciden'];
    return [];
  }
}
