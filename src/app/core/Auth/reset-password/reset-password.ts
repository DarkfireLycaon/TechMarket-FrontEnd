import { Component, inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import Swal from 'sweetalert2';
import { AuthService } from '../../service/auth';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-reset-password',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './reset-password.html',
  styleUrl: './reset-password.css',
})
export class ResetPassword implements OnInit {
resetForm!: FormGroup;
  token: string | null = '';

  // Inyectamos las herramientas necesarias
  private fb = inject(FormBuilder);
  private route = inject(ActivatedRoute); // Para leer la URL
  private authService = inject(AuthService);
  private router = inject(Router);

  ngOnInit(): void {
    // 1. Extraer el token de la URL: ?token=xxxx-yyyy-zzzz
    this.token = this.route.snapshot.queryParamMap.get('token');

    // Si no hay token, lo mandamos de vuelta al login
    if (!this.token) {
      Swal.fire('Error', 'Acceso no válido. Solicita un nuevo enlace.', 'error');
      this.router.navigate(['/login']);
      return;
    }

    // 2. Inicializar el formulario con validación de coincidencia
    this.resetForm = this.fb.group({
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', [Validators.required]]
    }, { 
      validators: this.passwordMatchValidator // Validador personalizado
    });
  }

  // Lógica para comparar las contraseñas
  passwordMatchValidator(g: FormGroup) {
    const password = g.get('password')?.value;
    const confirmPassword = g.get('confirmPassword')?.value;
    return password === confirmPassword ? null : { mismatch: true };
  }

  onReset(): void {
    if (this.resetForm.invalid || !this.token) return;

    const nuevaPassword = this.resetForm.value.password;

    // 3. Llamada al servicio enviando el token y la clave
    this.authService.resetearPassword(this.token, nuevaPassword).subscribe({
      next: () => {
        Swal.fire({
          title: '¡Contraseña Actualizada!',
          text: 'Ya puedes iniciar sesión con tu nueva clave.',
          icon: 'success',
          confirmButtonColor: '#198754'
        }).then(() => {
          this.router.navigate(['/login']);
        });
      },
      error: (err) => {
        Swal.fire('Error', 'El enlace ha expirado o es inválido. Intenta de nuevo.', 'error');
      }
    });
  }
}
