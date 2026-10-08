# TechMarket - Frontend Angular

Este proyecto es la aplicación frontend de un sistema de inventario y e-commerce con autenticación, carrito, wishlist, historial de visitas, pedidos, dashboard y recomendaciones personalizadas.

## Stack principal

- Angular 21
- TypeScript
- RxJS
- Bootstrap 5
- Swiper
- SweetAlert2
- JWT en localStorage
- Consumo REST del backend Spring Boot

## Objetivo del sistema

El frontend permite:

- registrar e iniciar sesión
- gestionar perfil de usuario
- ver productos, ofertas y categorías
- agregar productos al carrito y wishlist
- registrar visitas
- ver historial de compras y pedidos
- consultar el dashboard con recomendaciones
- acceder al panel administrativo

## Estructura general

```text
src/
  app/
    admin/
    chatbot/
    core/
    dashboard/
    directives/
    features/
    guards/
    interceptors/
    perfil/
    service/
    app.routes.ts
    app.ts
```

### Carpetas principales

- `app/core`: autenticación, categorías, carrito, ofertas, productos y plantillas generales.
- `app/dashboard`: dashboard principal con productos visitados y recomendaciones.
- `app/perfil`: perfil del usuario, historial, pedidos y wishlist.
- `app/admin`: administración del sistema.
- `app/service`: servicios HTTP y lógica de negocio del cliente.
- `app/guards`: control de acceso por sesión y roles.
- `app/interceptors`: inyección de Authorization header.

## Rutas principales

Las rutas más relevantes se definen en `src/app/app.routes.ts`:

- `/login`
- `/registro`
- `/dashboard`
- `/perfil`
- `/ofertas`
- `/wishlist`
- `/historial-visitas`
- `/detalle/:id`
- `/admin/...`

## Autenticación

El flujo de autenticación usa:

- `AuthService` en `src/app/service/auth.ts`
- `localStorage` para guardar `token` y `usuario`
- interceptor para enviar el `Authorization: Bearer ...` en cada request protegido

### Token y usuario

El login guarda:

- `token`
- `usuario`
- `userId` cuando el JWT incluye el identificador

## Servicios clave

- `ProductoService`: productos, ofertas, filtros, categorías y detalle.
- `AuthService`: login, registro, perfil, reset de password y autenticación.
- `CarritoService`: carrito del usuario.
- `WishlistService`: favoritos del usuario.
- `HistorialService`: visitas y recomendaciones.
- `PedidoService`: pedidos y administración.
- `VentaService`: ventas y datos transaccionales.

## Dashboard

El dashboard muestra:

- hero banner
- productos visitados recientemente
- ofertas flash
- recomendaciones para el usuario

La carga de estas listas se hace con `Observable` y `async` pipe, y la vista se vuelve a renderizar con `ChangeDetectorRef` cuando el backend responde.

## Recomendaciones

La recomendación se calcula a partir del historial del usuario y se obtiene desde el backend con la ruta:

```ts
/api/dashboard/recomendaciones/:userId
```

El flujo de frontend usa `HistorialService.getRecomendaciones()`.

## Comandos útiles

### Servidor de desarrollo

```bash
npm install
npm start
```

Luego abrir:

```text
http://localhost:4200
```

### Build

```bash
npm run build
```

### Tests

```bash
npm run test
```

## Variables de entorno

El proyecto usa el archivo:

- `src/environments/environment.ts`
- `src/environments/environment.development.ts`

Con configuración de:

- API base URL del backend
- entornos de desarrollo y producción

## Dependencias importantes

- `@angular/core`
- `@angular/router`
- `@angular/common/http`
- `bootstrap`
- `swiper`
- `sweetalert2`

## Buenas prácticas

- mantener el JWT en localStorage y proteger rutas con guards
- no exponer tokens ni datos sensibles en el DOM
- validar los campos del backend antes de guardar información
- utilizar `ChangeDetectorRef` cuando hay cambios que Angular no detecta en flujos async

## Repositorio relacionado

El backend del proyecto está en un repositorio separado, normalmente corriendo en:

```text
http://localhost:8080
```

El frontend se comunica con este backend mediante la URL configurada en entorno.

## Nota de desarrollo

Este frontend está adaptado a una arquitectura con Spring Boot + JWT + JPA. La integración se hace a través de endpoints REST, no mediante sockets ni APIs internas.

---

Si se quiere ampliar la documentación, se recomienda agregar:

- documentación del backend
- diagramas de flujo de login
- diagrama de entidades del dominio
- guía para despliegue en Render/Vercel/Heroku

## Despliegue a Render y preparación del frontend

- 1) Configurar la URL del backend en producción:

  - Edita el archivo `src/environments/environment.prod.ts` y reemplaza `https://<tu-backend-en-render>.onrender.com` por la URL real de tu servicio en Render.

- 2) Hacer la build de producción:

```bash
npm install
npm run build
```

La build generará los archivos en la carpeta `dist/`.

- 3) Desplegar en Render (opciones):

  Opción A — Deploy estático (Static Site) en Render:

  - Crea un nuevo "Static Site" en Render.
  - Conecta tu repositorio de GitHub (ver sección siguiente).
  - Indica el comando de build: `npm run build`.
  - Public directory: `dist/` (o `dist/<nombre-del-proyecto>` si aplica).

  Opción B — Deploy como servicio web (Docker/Node) si necesitas server-side:

  - Crea un nuevo servicio en Render (Web Service) y configura el build y start apropiados.

## Subir el frontend a GitHub

1) Inicializar repositorio local (si no existe):

```bash
git init
git add .
git commit -m "Initial commit - frontend"
```

2) Crear repositorio en GitHub (UI) y copiar la URL remota. Luego enlazar y subir:

```bash
git remote add origin https://github.com/tu-usuario/tu-repo-frontend.git
git branch -M main
git push -u origin main
```

3) Si ya tienes cambios y solo quieres subirlos:

```bash
git add .
git commit -m "Actualiza configuración para despliegue en Render"
git push
```

4) Conectar en Render:

  - En Render, al crear el servicio estático o Web Service, elige conectar con GitHub y autoriza el repositorio.
  - Configura el branch a desplegar (por ejemplo `main`) y Render ejecutará `npm run build` y publicará la carpeta `dist/`.

## Nota sobre CORS y seguridad

- Asegúrate de que el backend en Render permita peticiones desde el dominio donde desplegarás el frontend (configurar CORS en Spring Boot).
- No incluyas credenciales ni tokens en el código. Usa variables de entorno en el backend.

