# 🏆 SportStock - Sistema de Inventario Deportivo

Sistema web completo para gestión de inventario de artículos deportivos con sistema de tickets integrado.

## 📌 Descripción del Proyecto

SportStock es una solución integral desarrollada en HTML, CSS y JavaScript que permite administrar inventarios deportivos, gestionar tickets de solicitudes y generar reportes estadísticos. El sistema cuenta con autenticación de usuarios, sistema de roles, operaciones CRUD completas y una interfaz moderna siguiendo principios de UI/UX.

## ✨ Características Principales

### 🔐 Sistema de Autenticación y Roles
- Inicio de sesión con validación de credenciales
- Registro de nuevos usuarios
- Auto-login después del registro
- Recuperación de contraseña
- Gestión de sesiones con LocalStorage
- **Sistema de roles: Admin y Usuario**
  - **Admin**: acceso total (crear, editar, eliminar artículos y tickets)
  - **Usuario**: acceso de solo lectura con vista de detalles

### 📦 Gestión de Inventario (CRUD)
- ✅ **Crear**: Agregar nuevos artículos al inventario *(solo Admin)*
- 📖 **Leer**: Visualizar todos los artículos en tabla *(Admin y Usuario)*
- ✏️ **Actualizar**: Editar información de artículos existentes *(solo Admin)*
- ❌ **Eliminar**: Remover artículos del inventario *(solo Admin)*
- 👁️ **Ver Detalles**: Consultar información del artículo *(Usuario)*

Campos del inventario:
- Código único
- Nombre del artículo
- Categoría (Fútbol, Basketball, Voleibol, Tenis, Otros)
- Precio (COP)
- Cantidad disponible
- Descripción

### 🎫 Sistema de Tickets (CRUD)
- ✅ **Crear**: Generar nuevos tickets de solicitud *(solo Admin)*
- 📖 **Leer**: Consultar todos los tickets *(Admin y Usuario)*
- ✏️ **Actualizar**: Modificar estado y detalles *(solo Admin)*
- ❌ **Eliminar**: Cerrar tickets completados *(solo Admin)*
- 👁️ **Ver Detalles**: Consultar información del ticket *(Usuario)*

Estados de tickets:
- 🔵 Abierto
- 🟡 En Proceso
- ⚪ Cerrado

### 🛒 Carrito de Implementos
- Agregar artículos con control de stock
- Ajustar cantidades y eliminar artículos
- Subtotales por ítem y total general
- Generación de ticket con detalle, total y solicitante del usuario

### 📊 Dashboard y Reportes
- Estadísticas en tiempo real
- Total de artículos
- Artículos disponibles
- Tickets abiertos
- Métricas de actividad

## 🎨 Diseño UI/UX

### Principios Aplicados
- **Consistencia Visual**: Paleta de colores coherente
- **Jerarquía de Información**: Títulos claros y secciones bien definidas
- **Feedback Visual**: Animaciones y estados hover
- **Responsive Design**: Adaptable a móviles, tablets y escritorio
- **Accesibilidad**: Contraste adecuado y navegación intuitiva

### Paleta de Colores
```css
--primary: #FF6B35     /* Naranja vibrante */
--accent: #00D9FF      /* Cyan brillante */
--secondary: #004E89   /* Azul oscuro */
--bg-dark: #0A1128     /* Fondo oscuro */
--success: #00E676     /* Verde éxito */
--warning: #FFD600     /* Amarillo advertencia */
--error: #FF3D3D       /* Rojo error */
```

### Tipografía
- **Títulos**: Rajdhani (700) - Fuente deportiva y moderna
- **Texto**: Outfit (400-600) - Legible y profesional

## 📁 Estructura del Proyecto

```
sportstock/
│
├── index.html              # Página de inicio y login
├── dashboard.html          # Panel principal del sistema
├── app.js                  # Lógica JavaScript (CRUD + Roles)
├── backend/                # API Java 23 (Spring Boot MVC)
├── INSTALACION_LINUX.md    # Guía de despliegue en Linux
└── README.md               # Este archivo
```

## 🚀 Instalación Rápida

### Opción 1: Uso Local (Sin servidor)
1. Descargar todos los archivos
2. Abrir `index.html` en un navegador moderno
3. Usar credenciales de prueba:
   - **Admin**: Usuario `admin` / Contraseña `admin123`
   - **Usuario**: Usuario `usuario` / Contraseña `123456`

### Opción 2: Despliegue en Linux
Ver archivo `INSTALACION_LINUX.md` para instrucciones detalladas.

## ⚙️ Backend Spring Boot (Java 23)

### Requisitos
- Java 23
- Maven 3.9+
- MySQL 8+

### Configuración
1. Edita [backend/src/main/resources/application.yml](backend/src/main/resources/application.yml):
  - `spring.datasource.username`
  - `spring.datasource.password`

### Ejecutar API
```bash
cd backend
mvn spring-boot:run
```

### Endpoints principales
- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/inventory`
- `POST /api/inventory` (admin)
- `PUT /api/inventory/{id}` (admin)
- `DELETE /api/inventory/{id}` (admin)
- `GET /api/tickets`
- `POST /api/tickets` (admin)
- `PUT /api/tickets/{id}` (admin)
- `DELETE /api/tickets/{id}` (admin)
- `POST /api/cart/checkout`

## 💻 Tecnologías Utilizadas

| Tecnología | Uso |
|------------|-----|
| HTML5 | Estructura de la aplicación |
| CSS3 | Estilos y diseño responsive |
| JavaScript (ES6+) | Lógica de negocio y CRUD |
| LocalStorage | Persistencia de datos (frontend) |
| Boxicons | Iconografía profesional |
| Java 23 | Backend API |
| Spring Boot MVC | Controladores y seguridad |
| MySQL | Base de datos (opcional, backend) |
| Apache2 | Servidor web (despliegue Linux) |

## 📖 Manual de Uso

### 1. Iniciar Sesión
1. Abrir `index.html`
2. Ingresar credenciales
3. Click en "Iniciar Sesión"

### 2. Gestionar Inventario
1. Ir a pestaña "Inventario"
2. Click en "+ Nuevo Artículo" *(requiere rol Admin)*
3. Llenar formulario y guardar
4. Editar/Eliminar usando botones de acción *(requiere rol Admin)*
5. Usuarios con rol Usuario pueden usar "Ver Detalles"

### 3. Crear Tickets
1. Ir a pestaña "Tickets"
2. Click en "+ Nuevo Ticket" *(requiere rol Admin)*
3. Completar información requerida
4. Cambiar estado según avance *(requiere rol Admin)*

### 4. Ver Reportes
1. Ir a pestaña "Reportes"
2. Visualizar estadísticas
3. Analizar métricas del sistema

### 5. Usar el Carrito
1. Ir a "Inventario" y agregar artículos al carrito
2. Ajustar cantidades en "Carrito"
3. Ver subtotales y total general
4. Confirmar préstamo para generar ticket

## 🔑 Sistema de Roles

| Acción | Admin | Usuario |
|--------|-------|---------|
| Ver inventario | ✅ | ✅ |
| Ver detalles artículo | ✅ | ✅ |
| Crear / Editar / Eliminar artículo | ✅ | ❌ |
| Ver tickets | ✅ | ✅ |
| Ver detalles ticket | ✅ | ✅ |
| Crear / Editar / Eliminar ticket | ✅ | ❌ |
| Ver dashboard y reportes | ✅ | ✅ |

El badge de rol del usuario es visible en el encabezado del dashboard:
- 👤 con borde dorado y ⚙️ → Administrador
- 👤 estándar → Usuario

## 🔒 Seguridad

- Validación de formularios en cliente
- Protección contra campos vacíos
- Verificación de sesión activa
- Control de acceso por roles
- Mensajes de error informativos
- Confirmación antes de eliminar datos

**Nota**: Para producción se recomienda:
- Implementar backend con validación servidor
- Hash de contraseñas (bcrypt)
- Tokens JWT para sesiones
- Sanitización de inputs
- HTTPS obligatorio

## 📊 Base de Datos MySQL

### Tablas Principales

**users**
- id (INT, PK, AUTO_INCREMENT)
- username (VARCHAR, UNIQUE)
- email (VARCHAR, UNIQUE)
- password (VARCHAR)
- name (VARCHAR)
- role (ENUM: admin, usuario)
- created_at (TIMESTAMP)

**inventory**
- id (INT, PK, AUTO_INCREMENT)
- code (VARCHAR, UNIQUE)
- name (VARCHAR)
- category (VARCHAR)
- price (DECIMAL)
- quantity (INT)
- description (TEXT)
- created_at (TIMESTAMP)
- updated_at (TIMESTAMP)

**tickets**
- id (INT, PK, AUTO_INCREMENT)
- title (VARCHAR)
- requester (VARCHAR)
- status (ENUM: Abierto, En Proceso, Cerrado)
- description (TEXT)
- created_at (TIMESTAMP)
- updated_at (TIMESTAMP)

Ver script SQL completo en `INSTALACION_LINUX.md`

## 🌐 Navegadores Soportados

| Navegador | Versión Mínima |
|-----------|----------------|
| Chrome | 90+ |
| Firefox | 88+ |
| Safari | 14+ |
| Edge | 90+ |
| Opera | 76+ |

## 📱 Responsive Breakpoints

- **Desktop**: 1024px+
- **Tablet**: 768px - 1023px
- **Mobile**: < 768px

## 🐛 Problemas Conocidos

## ✅ Plan para versión profesional (backend + seguridad + QA)

### Fase 1: Backend mínimo viable
- API REST para usuarios, inventario, tickets y carrito
- Persistencia real en MySQL/PostgreSQL
- Autenticación con JWT y roles

### Fase 2: Seguridad y validación
- Hash de contraseñas (bcrypt/argon2)
- Validación y sanitización en servidor
- Protección CSRF, rate limiting y políticas CORS

### Fase 3: Reportes reales
- Reportes filtrables por fecha y estado
- Exportación a PDF/Excel
- Gráficos con métricas reales

### Fase 4: Calidad y despliegue
- Pruebas unitarias e интегración (inventario, tickets, carrito)
- Logs y monitoreo básicos
- Variables de entorno y pipeline de despliegue

1. LocalStorage tiene límite de 5MB
2. Sin sincronización entre pestañas
3. Datos se pierden al limpiar caché

**Solución**: Implementar backend con base de datos real

## 🔄 Roadmap Futuro

- [ ] Backend en PHP/Node.js
- [ ] API RESTful
- [ ] Autenticación JWT
- [ ] Exportar reportes a PDF/Excel
- [ ] Notificaciones push
- [ ] Búsqueda y filtros avanzados
- [ ] Historial de cambios
- [ ] Integración con código de barras
- [ ] App móvil nativa

## 👥 Créditos

**Desarrollado por**: Estiven Castro
**Curso**: Proyecto de Aula II - Desarrollo Front-End
**Fecha**: Abril 2026

## 📄 Licencia

Este proyecto es de uso educativo.

---

⚡ **SportStock** - Gestión deportiva eficiente
