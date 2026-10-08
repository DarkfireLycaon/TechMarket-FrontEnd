import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute, RouterLink } from '@angular/router';
import { AuthService } from '../../../service/auth';
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
      this.loginForm.markAllAsTouched(); 
      return;
    }

    const credentials = this.loginForm.value;

    this.authService.login(credentials).subscribe({
      next: (res: any) => {
        console.log('Respuesta del login:', res);

        // Obtenemos el token (puede venir en res.token o ser el objeto entero si devuelve solo el token)
        const token = res.token || (typeof res === 'string' ? res : null) || localStorage.getItem('token');
        
        if (token) {
          localStorage.setItem('token', token);

          try {
            // Decodificamos el Payload del JWT para extraer el ID o el subject (sub)
            const payload = JSON.parse(atob(token.split('.')[1]));
            console.log('Payload del token:', payload);

            // Buscamos el ID en los claims comunes del token
            const userId = payload.id || payload.userId || payload.sub || payload.usuarioId;

            if (userId) {
              localStorage.setItem('userId', userId.toString());
            }
          } catch (e) {
            console.error('Error al decodificar el token JWT', e);
          }
        }

        // Redirigimos al dashboard
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