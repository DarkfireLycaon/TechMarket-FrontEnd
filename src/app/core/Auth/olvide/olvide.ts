import { ChangeDetectorRef, Component, inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { AuthService } from '../../service/auth';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-olvide-password',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './olvide.html'
})
export class OlvidePassword {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
private cdRef = inject(ChangeDetectorRef);
  olvideForm: FormGroup = this.fb.group({
    email: ['', [Validators.required, Validators.email]]
  });

  enviarEnlace() {
    if (this.olvideForm.invalid) return;

    const email = this.olvideForm.value.email;

    this.authService.enviarEnlaceRecuperacion(email).subscribe({
      next: () => {
        Swal.fire({
          title: 'Correo enviado',
          text: 'Si el correo está registrado, recibirás un enlace de recuperación en unos minutos.',
          icon: 'success',
          confirmButtonColor: '#6f42c1'
        });
      },
      error: () => {
        // Por seguridad, damos la misma respuesta para no confirmar qué emails existen
        Swal.fire('Proceso iniciado', 'Revisa tu bandeja de entrada.', 'info');
      }
     
    });
  }
}