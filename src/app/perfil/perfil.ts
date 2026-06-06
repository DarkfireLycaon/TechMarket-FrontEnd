import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import Swal from 'sweetalert2';
import { AuthService } from '../service/auth'; // Ajusta la ruta a tu servicio

@Component({
  selector: 'app-perfil',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule, RouterModule],
  templateUrl: './perfil.html',
})
export class Perfil implements OnInit {
  
  perfilForm!: FormGroup;
  cargando: boolean = true;
  procesando: boolean = false;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private cdr: ChangeDetectorRef // Inyectado correctamente aquí
  ) {}

  ngOnInit(): void {
    // 1. Inicializamos el formulario vacío
    this.perfilForm = this.fb.group({
      nombre: ['', [Validators.required, Validators.minLength(3)]],
      email: [{ value: '', disabled: true }], // El email se deshabilita para que no se pueda editar
      telefono: ['', [Validators.required]],
      ciudad: ['', [Validators.required]],
      direccion: [''],
      codigoPostal: ['']
    });

    // 2. Cargamos los datos actuales del usuario
    this.obtenerDatosPerfil();
  }

  // Getter abreviado para los errores del HTML
  get f() { return this.perfilForm.controls; }

  obtenerDatosPerfil(): void {
    this.cargando = true;
    this.cdr.detectChanges(); // Forzamos a renderizar el spinner de carga inicial

    this.authService.obtenerPerfil().subscribe({
      next: (usuario) => {
        if (usuario) {
          // Rellenamos el formulario con los datos que vienen de la Base de Datos
          this.perfilForm.patchValue({
            nombre: usuario.nombre,
            email: usuario.email,
            telefono: usuario.telefono,
            ciudad: usuario.ciudad, // Recuerda que en Java lo llamamos 'ciudad' en el getter
            direccion: usuario.direccion,
            codigoPostal: usuario.codigoPostal
          });
        }
      
        this.cargando = false;
        this.cdr.detectChanges(); // Forzamos a Angular a quitar el spinner y pintar los datos en los inputs
      },
      error: (err) => {
        console.error('Error al cargar el perfil:', err);
        this.cargando = false;
        this.cdr.detectChanges(); // Quitamos el spinner antes de mostrar la alerta
        Swal.fire('Error', 'No se pudieron cargar tus datos de perfil.', 'error');
      }
    });
  }

  onGuardarCambios(): void {
    if (this.perfilForm.invalid) {
      this.perfilForm.markAllAsTouched();
      this.cdr.detectChanges(); // Sincroniza visualmente los bordes rojos de error si los hubiera
      return;
    }

    this.procesando = true;
    this.cdr.detectChanges(); // Forzamos a cambiar el texto del botón a "Procesando..." inmediatamente

    // Obtenemos los valores del formulario.
    this.authService.actualizarPerfil(this.perfilForm.value).subscribe({
      next: (res) => {
        this.procesando = false;
        this.cdr.detectChanges(); // Sincronizamos el estado del botón antes de disparar la modal
        
        Swal.fire({
          title: '¡Perfil Actualizado!',
          text: 'Tus datos se han modificado correctamente.',
          icon: 'success',
          confirmButtonColor: '#198754'
        });
      },
      error: (err) => {
        this.procesando = false;
        this.cdr.detectChanges(); // Desbloqueamos el botón visualmente si ocurre un error en el servidor
        
        Swal.fire({
          title: 'Error al actualizar',
          text: err.error?.mensaje || 'Hubo un problema al guardar los cambios.',
          icon: 'error',
          confirmButtonColor: '#d33'
        });
      }
    });
  }
}