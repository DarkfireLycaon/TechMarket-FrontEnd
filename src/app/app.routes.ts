import { Routes } from '@angular/router';
import { Dashboard } from './dashboard/dashboard';
import { ProductoLista } from './features/producto/producto-lista/producto-lista';
import { AgregarProducto } from './features/producto/agregar-producto/agregar-producto';
import { EditarProducto } from './features/producto/editar-producto/editar-producto';
import { ProveedorLista } from './features/proveedores/proveedor-lista/proveedor-lista';
import { AgregarProveedor } from './features/proveedores/agregar-proveedor/agregar-proveedor';
import { EditarProveedor } from './features/proveedores/editar-proveedor/editar-proveedor';
import { ClientesLista } from './features/clientes/clientes-lista/clientes-lista';
import { AgregarCliente } from './features/clientes/agregar-cliente/agregar-cliente';
import { VentasLista } from './features/ventas/ventas-lista/ventas-lista';
import { NuevaVenta } from './features/ventas/nueva-venta/nueva-venta';
import { EditarCliente } from './features/clientes/editar-cliente/editar-cliente';
import { Login } from './core/Auth/login/login';
import { Registro } from './core/Auth/registro/registro';
import { authGuard } from './guards/auth-guard';
import { OlvidePassword } from './core/Auth/olvide/olvide';
import { sidebar } from './core/templates/sidebar/sidebar';
import { Ofertas } from './core/ofertas/ofertas';
import { BuscarProductos } from './core/templates/buscador/buscar-productos/buscar-productos';
import { Categorias } from './core/categorias/categorias';
import { Carrito } from './core/carrito/carrito';
import { ServiciosTechmarket } from './core/servicios-techmarket/servicios-techmarket';
import { Checkout } from './core/pagos/checkout/checkout';
import { MisPedidos } from './core/mis-pedidos/mis-pedidos';

// ... (todos tus imports se mantienen igual)

export const routes: Routes = [
    // --- RUTAS PÚBLICAS ---
    { path: 'login', component: Login },
    { path: 'registrar', component: Registro },
    { path: 'olvide', component: OlvidePassword},

    // --- RUTAS PROTEGIDAS (Agrupadas) ---
    {
        path: '',
        canActivate: [authGuard], // El portero vigila todas las de abajo
        children: [
            { path: 'dashboard', component: Dashboard },
            { path: 'productos', component: ProductoLista },
            { path: 'agregar-producto', component: AgregarProducto },
            { path: 'editar-producto/:id', component: EditarProducto },
            { path: 'proveedores', component: ProveedorLista },
            { path: 'agregar-proveedor', component: AgregarProveedor },
            { path: 'editar-proveedor/:id', component: EditarProveedor },
            { path: 'clientes', component: ClientesLista },
            { path: 'agregar-cliente', component: AgregarCliente },
            { path: 'editar-cliente/:id', component: EditarCliente },
            { path: 'ventas', component: VentasLista },
            { path: 'nueva-venta', component: NuevaVenta },
            {path: 'ofertas', component: Ofertas},
            { path: 'categorias/:categoria', component: Categorias},
            { path: 'productos/buscar', component: BuscarProductos },
            { path: 'carrito', component: Carrito }, 
            { path: 'servicios-techmarket', component: ServiciosTechmarket }, // ← Asegurar que existe
            // Redirección por defecto si el usuario está logueado pero entra a la raíz
            { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
             { path: 'checkout', component: Checkout },
  { path: 'mis-pedidos', component: MisPedidos}
        ]
    },

    // --- COMODÍN ---
    // Si escriben cualquier otra cosa, los manda al login
    { path: '**', redirectTo: 'login' }
];