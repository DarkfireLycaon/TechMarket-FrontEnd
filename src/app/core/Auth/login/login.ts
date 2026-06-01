import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute, RouterLink } from '@angular/router';
import { AuthService } from '../../service/auth';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-login',
  standalone: true,
  templateUrl: './login.html',
  styleUrls: ['./login.css'],
  imports: [CommonModule, ReactiveFormsModule, RouterLink] // Mantenemos lo necesario para formularios reactivos
 // Mantenemos lo necesario para formularios reactivos
})
export class Login implements OnInit {
  
  loginForm!: FormGroup; // Nombre correcto para este componente
  cuentaActivada = false;

  constructor(
    private authService: AuthService, 
    private router: Router,
    private route: ActivatedRoute,
    private fb: FormBuilder
  ) {}

  ngOnInit() {
    // Detectar si el usuario viene de confirmar su correo
    this.route.queryParams.subscribe(params => {
      if (params['activado'] === 'true') {
        this.cuentaActivada = true;
      }
    });

    // Inicializamos el formulario de acceso
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  // Getter para validaciones en el HTML
  get f() { return this.loginForm.controls; }

  onLogin() {
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched(); // Marcamos errores visualmente
      return;
    }

    // Usamos directamente los valores del formulario
    const credentials = this.loginForm.value;

    this.authService.login(credentials).subscribe({
      next: (res) => {
        // El AuthService se encarga de guardar el token en localStorage
        this.router.navigate(['/dashboard']); 
      },
      error: (err) => {
        Swal.fire({
          title: 'Error de acceso',
          text: 'Credenciales incorrectas o cuenta aún no activada.',
          icon: 'error',
          confirmButtonColor: '#6f42c1'
        });
      }
    });
  }
}