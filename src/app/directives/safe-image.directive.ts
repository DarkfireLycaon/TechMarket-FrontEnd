import { Directive, ElementRef, HostListener, Input } from '@angular/core';

@Directive({
  selector: 'img[appSafeImage]',
  standalone: true
})
export class SafeImageDirective {
  // Recibimos la ruta del placeholder
  @Input() appSafeImage: string = '/assets/images/placeholder.jpg';

  constructor(private el: ElementRef) {}

  @HostListener('error')
  onError(): void {
    const imgElement = this.el.nativeElement;
    // Evitar bucle infinito si el placeholder también falla
    if (imgElement.src !== window.location.origin + this.appSafeImage) {
      imgElement.src = this.appSafeImage;
    }
  }
}