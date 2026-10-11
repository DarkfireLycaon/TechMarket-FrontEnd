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
    comparativa?: any
  }[]>([]);

  mensajeControl = new FormControl('');
  abierto = signal(false);

  sugerencias = [
    '¿Hay stock de laptops?',
    'Compara Samsung TV y LG TV',
    'Precio de iPhone',
    'Productos gaming',
    '¿Qué me recomiendas para trabajo?',
    'Mostrar ofertas del día'
  ];

  constructor(
    private renderer: Renderer2,
    private chatService: ChatService,
    private el: ElementRef,
    private cdr: ChangeDetectorRef,
    private router: Router
  ) {}

  ngOnInit() {
    this.renderer.appendChild(document.body, this.el.nativeElement);
  }

  usarSugerencia(texto: string) {
    this.mensajeControl.setValue(texto);
    this.enviar();
  }

  enviar() {
    const texto = this.mensajeControl.value;
    if (!texto?.trim()) return;

    this.mensajes.update(m => [...m, {
      texto: texto,
      esBot: false
    }]);

    this.mensajeControl.setValue('');

    this.chatService.enviarMensaje(texto).subscribe(respuesta => {
      const nuevoMensaje: any = {
        texto: 'Aquí tienes la respuesta:',
        esBot: true
      };

      if (respuesta) {
        if (respuesta.producto1) {
          nuevoMensaje.comparativa = respuesta;
        } else if (Array.isArray(respuesta)) {
          nuevoMensaje.productos = respuesta;
        } else if (typeof respuesta === 'object') {
          nuevoMensaje.texto = respuesta.texto || nuevoMensaje.texto;
          nuevoMensaje.productos = Array.isArray(respuesta.productos) ? respuesta.productos : undefined;
        } else {
          nuevoMensaje.texto = respuesta;
        }
      }

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
    } catch (err) { }
  }

  toggleChat() {
    const estaAbierto = !this.abierto();
    this.abierto.set(estaAbierto);

    if (estaAbierto && this.mensajes().length === 0) {
      this.mensajes.update(m => [...m, {
        texto: '¡Hola! 👋 Puedes preguntarme por stock, precios, comparaciones o recomendaciones. Prueba una de estas opciones o escribe tu consulta.',
        esBot: true
      }]);
    }
  }

  navegarADetalle(id: number) {
    this.abierto.set(false);

    this.router.navigate(['/producto', id]).then(() => {
    }).catch(err => {
      console.error('Error en navegación:', err);
    });
  }
}