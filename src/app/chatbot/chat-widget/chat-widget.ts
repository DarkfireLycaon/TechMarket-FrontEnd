import { ChangeDetectorRef, Component, ElementRef, Renderer2, signal, ViewChild, ViewEncapsulation } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { ChatService } from '../../service/chat.service';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';


@Component({
  selector: 'app-chat-widget',
  standalone: true, // ¡Standalone!
  imports: [ReactiveFormsModule,CommonModule, RouterLink],
  templateUrl: './chat-widget.html',
   styleUrl: './chat-widget.css',
  encapsulation: ViewEncapsulation.None,
  template: `
    <ng-template cdkConnectedOverlay [cdkConnectedOverlayOpen]="true">
      <div class="chat-container">
        </div>
    </ng-template>
  `,
  styles: [`
    .chat-container {
      position: fixed;
      bottom: 20px;
      right: 20px;
      z-index: 99999;
    }
  `]

})

export class ChatWidgetComponent {
mensajes = signal<{ 
  texto: string, 
  esBot: boolean, 
  productos?: { id: number, nombre: string, stockInfo: string }[],
  comparativa?: any // Añadimos esto para manejar el ComparativaDTO
}[]>([]);
  mensajeControl = new FormControl('');
  abierto = signal(false);
  

  constructor(private renderer: Renderer2, private chatService: ChatService, private el: ElementRef, private cdr: ChangeDetectorRef, private router: Router) {}
ngOnInit() {
    // Mueve el componente al final del body automáticamente
    this.renderer.appendChild(document.body, this.el.nativeElement);
  }
  enviar() {
  // 1. Capturar el valor
  const texto = this.mensajeControl.value;
  if (!texto?.trim()) return; // Validar que no esté vacío

  // 2. MOSTRAR EL MENSAJE DEL USUARIO INMEDIATAMENTE
  this.mensajes.update(m => [...m, { 
    texto: texto, 
    esBot: false 
  }]);

  // 3. LIMPIAR EL INPUT
  this.mensajeControl.setValue('');

  // 4. Llamar al servicio
  this.chatService.enviarMensaje(texto).subscribe(respuesta => {
    

    const nuevoMensaje: any = { 
      texto: "Aquí tienes la respuesta:", 
      esBot: true 
    };

    if (respuesta) {
      if (respuesta.producto1) {
        nuevoMensaje.comparativa = respuesta;
      } else if (Array.isArray(respuesta)) {
        nuevoMensaje.productos = respuesta;
      } else {
        // Por si el backend devuelve texto plano
        nuevoMensaje.texto = respuesta;
      }
    }

    // 5. AÑADIR LA RESPUESTA DEL BOT
    this.mensajes.update(m => [...m, nuevoMensaje]);
  });
}
  @ViewChild('scrollContainer') private scrollContainer!: ElementRef;

ngAfterViewChecked() {
  this.scrollToBottom();
}

private scrollToBottom(): void {
  try {
    this.scrollContainer.nativeElement.scrollTop = this.scrollContainer.nativeElement.scrollHeight;
  } catch(err) { }
}



toggleChat() {
  const estaAbierto = !this.abierto();
  this.abierto.set(estaAbierto);
  
  // Mensaje de bienvenida si el chat está vacío al abrirse
  if (estaAbierto && this.mensajes().length === 0) {
    this.mensajes.update(m => [...m, { 
      texto: "¡Hola! 👋 ¿Tienes alguna consulta sobre nuestros productos?", 
      esBot: true 
    }]);
  }
}
navegarADetalle(id: number) {
  
  
  this.abierto.set(false);
  
  this.router.navigate(['/producto', id]).then(success => {
    
  }).catch(err => {
    console.error("Error en navegación:", err);
  });
}
}