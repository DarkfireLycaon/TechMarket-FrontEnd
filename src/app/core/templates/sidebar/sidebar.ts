import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-sidebar-categorias',
  templateUrl: './sidebar.html',
  styleUrls: ['./sidebar.css'],
  standalone: true,
  imports: [CommonModule, RouterModule]
})
export class sidebar implements OnInit {
  categorias = [
    { nombre: 'Televisiones', icono: 'fas fa-tv', ruta: '/categorias/televisiones', count: 45 },
    { nombre: 'Informática', icono: 'fas fa-laptop', ruta: '/categorias/informatica', count: 128 },
    { nombre: 'Videojuegos', icono: 'fas fa-gamepad', ruta: '/categorias/videojuegos', count: 89 },
    { nombre: 'Telefonía', icono: 'fas fa-mobile-alt', ruta: '/categorias/telefonia', count: 67 },
    { nombre: 'Electrodomésticos', icono: 'fas fa-blender', ruta: '/categorias/electrodomesticos', count: 56 },
    { nombre: 'Audio', icono: 'fas fa-headphones', ruta: '/categorias/audio', count: 43 },
    { nombre: 'Fotografía', icono: 'fas fa-camera', ruta: '/categorias/fotografia', count: 34 },
    { nombre: 'Smart Home', icono: 'fas fa-home', ruta: '/categorias/smart-home', count: 28 },
    { nombre: 'Accesorios', icono: 'fas fa-plug', ruta: '/categorias/accesorios', count: 112 },
    { nombre: 'Impresión', icono: 'fas fa-print', ruta: '/categorias/impresion', count: 37 }
  ];

  constructor() { }

  ngOnInit(): void { }
}