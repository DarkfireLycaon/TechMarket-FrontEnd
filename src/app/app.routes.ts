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
import { BuscarProductos } from './core/templates/buscador/buscar-productos/buscar-productos';
import { Categorias } from './core/categorias/categorias';
import { Carrito } from './core/carrito/carrito';
import { ServiciosTechmarket } from './core/servicios-techmarket/servicios-techmarket';
import { Checkout } from './core/pagos/checkout/checkout';
import { PagoExito } from './core/pagos/pago-exito/pago-exito'; 
import { Perfil } from './perfil/perfil';
import { MisPedidos } from './perfil/mis-pedidos/mis-pedidos';
import { DetalleProducto } from './core/producto/detalle-producto/detalle-producto';
import { OfertasComponent } from './core/ofertas/ofertas-component/ofertas-component';
import { adminGuard } from './guards/admin-guard';
import { GestionProductosComponent } from './admin/gestion-productos/gestion-productos';
import { GestionPedidos } from './admin/gestion-pedidos/gestion-pedidos';
import { AdminDashboard } from './admin/admin-dashboard/admin-dashboard';
import { Error404 } from './features/error404/error404';

export const routes: Routes = [
    // --- RUTAS PÚBLICAS ---
    { path: 'login', component: Login },
    { path: 'registrar', component: Registro },
    { path: 'olvide', component: OlvidePassword },

    // --- RUTAS PROTEGIDAS PARA CLIENTES COMUNES (Bajo AuthGuard) ---
    {
        path: '',
        canActivate: [authGuard], 
        children: [
            { path: 'dashboard', component: Dashboard },
            { path: 'productos', component: ProductoLista },
            { path: 'proveedores', component: ProveedorLista },
            { path: 'agregar-proveedor', component: AgregarProveedor },
            { path: 'editar-proveedor/:id', component: EditarProveedor },
            { path: 'clientes', component: ClientesLista },
            { path: 'agregar-cliente', component: AgregarCliente },
            { path: 'editar-cliente/:id', component: EditarCliente },
            { path: 'ventas', component: VentasLista },
            { path: 'nueva-venta', component: NuevaVenta },
            { path: 'categorias/:categoria', component: Categorias },
            { path: 'productos/buscar', component: BuscarProductos },
            { path: 'carrito', component: Carrito }, 
            { path: 'servicios-techmarket', component: ServiciosTechmarket },
            { path: 'checkout', component: Checkout },
            { path: 'mis-pedidos', component: MisPedidos },
            { path: 'producto/:id', component: DetalleProducto },
            { path: 'ofertas', component: OfertasComponent },
            { path: 'pago-exito', component: PagoExito },
            { path: 'perfil', component: Perfil },
            { path: 'detalle/:id', component: DetalleProducto },
            { path: '', redirectTo: 'dashboard', pathMatch: 'full' }
        ]
    },

    // --- RUTAS EXCLUSIVAS DE ADMINISTRACIÓN (Bajo AdminGuard) ---
    {
        path: 'admin',
        canActivate: [adminGuard], 
        children: [
            // Apunta a /admin/gestion-producto (coincide con tu routerLink)
            { path: 'gestion-producto', component: GestionProductosComponent },
            {path: 'gestion-pedidos', component: GestionPedidos},
            {path: 'admin-dashboard', component: AdminDashboard}
            // Aquí puedes añadir la de pedidos cuando la tengas lista:
            // { path: 'pedidos', component: PedidosComponent }
        ]
    },

    // --- COMODÍN ---
   { path: '**', component: Error404 }
];