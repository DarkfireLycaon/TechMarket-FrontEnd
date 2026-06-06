import { Component, OnInit } from '@angular/core';
import { Router, RouterModule } from '@angular/router';

import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common'; // <--- Importante para ngIf
import Swal from 'sweetalert2';
import { AuthService } from '../../../service/auth';

@Component({
  selector: 'app-registro',
  standalone: true,
  // Agregamos CommonModule para poder usar las clases de error en el HTML
  imports: [ReactiveFormsModule, CommonModule, RouterModule], 
  templateUrl: './registro.html',
})
export class Registro implements OnInit {
  
  registroForm!: FormGroup;
  registroExitoso = false;

  // Un solo constructor con todas las inyecciones
  constructor(
    private fb: FormBuilder, 
    private authService: AuthService, 
    private router: Router,
    
  ) {}

  ngOnInit(): void {
    this.registroForm = this.fb.group({
      nombre: ['', [Validators.required, Validators.minLength(3)]],
      email: ['', [Validators.required, Validators.email]],
      
      // NUEVOS CAMPOS OBLIGATORIOS (Tienen Validators.required)
      telefono: ['', [Validators.required]],
      ciudad: ['', [Validators.required]],
      
      // NUEVOS CAMPOS OPCIONALES (No llevan Validators.required)
      direccion: [''],
      codigoPostal: [''],
      
      password: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  // Getter para acceder fácil a los campos en el HTML
  get f() { return this.registroForm.controls; }

  onRegistro() {
    if (this.registroForm.invalid) {
      this.registroForm.markAllAsTouched(); // Resalta los errores si el usuario intenta enviar
      return;
    }

    // Al hacer click en Registrarse, "this.registroForm.value" recolectará automáticamente 
    // todo el JSON incluyendo nombre, email, telefono, ciudad, direccion, codigoPostal y password.
    this.authService.registrar(this.registroForm.value).subscribe({
      next: (res) => {
        Swal.fire({
          title: '¡Registro Exitoso!',
          text: 'Te hemos enviado un correo de confirmación. Revisa tu bandeja de entrada.',
          icon: 'success',
          confirmButtonColor: '#198754',
          timer: 5000,
          timerProgressBar: true
        });

        this.registroExitoso = true;
        this.registroForm.reset(); // Limpia el formulario
      },
      error: (err) => {
        Swal.fire({
          title: 'Error al registrar',
          text: err.error?.mensaje || 'El correo ya está en uso o los datos son inválidos.',
          icon: 'error',
          confirmButtonColor: '#d33'
        });
      }
    });
  }
}