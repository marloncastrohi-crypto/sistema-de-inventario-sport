# Guía de Instalación - SportStock en Linux

## 📋 Requisitos del Sistema

- **Sistema Operativo**: Ubuntu 20.04+ / Debian 10+ / CentOS 8+
- **Servidor Web**: Apache2 o Nginx
- **Base de Datos**: MySQL 8.0+ o MariaDB 10.5+
- **PHP**: 7.4+ (opcional, para futuras extensiones)
- **Espacio en disco**: Mínimo 500MB

## 🚀 Instalación Paso a Paso

### 1. Actualizar el Sistema

```bash
sudo apt update
sudo apt upgrade -y
```

### 2. Instalar Apache2

```bash
# Instalar Apache
sudo apt install apache2 -y

# Habilitar Apache
sudo systemctl start apache2
sudo systemctl enable apache2

# Verificar estado
sudo systemctl status apache2
```

### 3. Instalar MySQL

```bash
# Instalar MySQL Server
sudo apt install mysql-server -y

# Iniciar MySQL
sudo systemctl start mysql
sudo systemctl enable mysql

# Configurar seguridad
sudo mysql_secure_installation
```

### 4. Crear Base de Datos

```bash
# Acceder a MySQL
sudo mysql -u root -p

# Ejecutar los siguientes comandos SQL:
```

```sql
-- Crear base de datos
CREATE DATABASE sportstock;

-- Crear usuario
CREATE USER 'sportstock_user'@'localhost' IDENTIFIED BY 'tu_contraseña_segura';

-- Dar permisos
GRANT ALL PRIVILEGES ON sportstock.* TO 'sportstock_user'@'localhost';
FLUSH PRIVILEGES;

-- Usar la base de datos
USE sportstock;

-- Crear tabla de usuarios (con campo role)
CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    name VARCHAR(100) NOT NULL,
    role ENUM('admin', 'usuario') DEFAULT 'usuario',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Crear tabla de inventario
CREATE TABLE inventory (
    id INT AUTO_INCREMENT PRIMARY KEY,
    code VARCHAR(20) UNIQUE NOT NULL,
    name VARCHAR(100) NOT NULL,
    category VARCHAR(50) NOT NULL,
    price DECIMAL(12, 2) DEFAULT 0,
    quantity INT DEFAULT 0,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Crear tabla de tickets
CREATE TABLE tickets (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(200) NOT NULL,
    requester VARCHAR(100) NOT NULL,
    status ENUM('Abierto', 'En Proceso', 'Cerrado') DEFAULT 'Abierto',
    description TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Insertar usuario administrador (contraseña: admin123)
INSERT INTO users (username, email, password, name, role) VALUES 
('admin', 'admin@sportstock.com', 'admin123', 'Administrador', 'admin');

-- Insertar usuario estándar (contraseña: 123456)
INSERT INTO users (username, email, password, name, role) VALUES 
('usuario', 'usuario@sportstock.com', '123456', 'Usuario', 'usuario');

-- Insertar datos de ejemplo en inventario
INSERT INTO inventory (code, name, category, price, quantity, description) VALUES
('BF-001', 'Balón de Fútbol', 'Fútbol', 85000, 15, 'Balón profesional Nike'),
('BB-012', 'Balón de Basketball', 'Basketball', 92000, 20, 'Balón Spalding oficial'),
('RT-003', 'Raqueta de Tenis', 'Tenis', 180000, 8, 'Raqueta Wilson Pro Staff');

-- Insertar tickets de ejemplo
INSERT INTO tickets (title, requester, status, description) VALUES
('Solicitud de balones', 'Juan Pérez', 'Abierto', 'Necesito 3 balones de fútbol para entrenamiento'),
('Reparación de red', 'María González', 'En Proceso', 'La red de voleibol necesita reparación');

-- Salir de MySQL
EXIT;
```

### 5. Desplegar la Aplicación

```bash
# Crear directorio del proyecto
sudo mkdir -p /var/www/sportstock

# Copiar archivos del proyecto
sudo cp index.html /var/www/sportstock/
sudo cp dashboard.html /var/www/sportstock/
sudo cp app.js /var/www/sportstock/

# Establecer permisos
sudo chown -R www-data:www-data /var/www/sportstock
sudo chmod -R 755 /var/www/sportstock
```

## ⚙️ Backend Spring Boot (Java 23)

### 9. Configurar variables del backend
Editar el archivo:
`backend/src/main/resources/application.yml`

Valores clave:
- `spring.datasource.username`
- `spring.datasource.password`

### 10. Ejecutar API
```bash
cd /ruta/al/proyecto/backend
mvn spring-boot:run
```

### Nota sobre usuarios
El backend usa contrasenas hasheadas (bcrypt). Si quieres crear usuarios iniciales en MySQL, debes almacenar el hash generado. Alternativamente, crea usuarios usando el endpoint `POST /api/auth/register`.

### 6. Configurar Apache Virtual Host

```bash
# Crear archivo de configuración
sudo nano /etc/apache2/sites-available/sportstock.conf
```

Agregar el siguiente contenido:

```apache
<VirtualHost *:80>
    ServerName sportstock.local
    ServerAlias www.sportstock.local
    DocumentRoot /var/www/sportstock
    
    <Directory /var/www/sportstock>
        Options Indexes FollowSymLinks
        AllowOverride All
        Require all granted
    </Directory>
    
    ErrorLog ${APACHE_LOG_DIR}/sportstock_error.log
    CustomLog ${APACHE_LOG_DIR}/sportstock_access.log combined
</VirtualHost>
```

```bash
# Habilitar el sitio
sudo a2ensite sportstock.conf

# Deshabilitar sitio por defecto
sudo a2dissite 000-default.conf

# Reiniciar Apache
sudo systemctl restart apache2
```

### 7. Configurar Firewall (Opcional)

```bash
# Permitir tráfico HTTP
sudo ufw allow 80/tcp

# Permitir tráfico HTTPS (si se configura SSL)
sudo ufw allow 443/tcp

# Habilitar firewall
sudo ufw enable
```

### 8. Configurar archivo hosts (Para pruebas locales)

```bash
# Editar hosts
sudo nano /etc/hosts

# Agregar:
127.0.0.1   sportstock.local
```

## 🔧 Verificación de Instalación

### Verificar Apache
```bash
sudo systemctl status apache2
```

### Verificar MySQL
```bash
sudo systemctl status mysql
```

### Verificar conexión a base de datos
```bash
mysql -u sportstock_user -p sportstock
```

### Acceder a la aplicación
Abrir navegador y visitar:
```
http://localhost
```
o
```
http://sportstock.local
```

## 📝 Credenciales de Acceso

**Administrador** (acceso total):
- Usuario: `admin`
- Contraseña: `admin123`

**Usuario estándar** (solo lectura):
- Usuario: `usuario`
- Contraseña: `123456`

## 🔑 Sistema de Roles

| Acción | Admin | Usuario |
|--------|-------|---------|
| Ver inventario | ✅ | ✅ |
| Crear / Editar / Eliminar artículo | ✅ | ❌ |
| Ver tickets | ✅ | ✅ |
| Crear / Editar / Eliminar ticket | ✅ | ❌ |
| Ver dashboard y reportes | ✅ | ✅ |

## 🔒 Seguridad Adicional (Recomendado)

### 1. Configurar HTTPS con Let's Encrypt

```bash
# Instalar Certbot
sudo apt install certbot python3-certbot-apache -y

# Obtener certificado SSL
sudo certbot --apache -d sportstock.local
```

### 2. Cambiar contraseñas por defecto

```sql
-- Cambiar contraseña de admin
UPDATE users SET password = 'nueva_contraseña_segura' WHERE username = 'admin';

-- Cambiar contraseña de usuario estándar
UPDATE users SET password = 'nueva_contraseña_segura' WHERE username = 'usuario';
```

### 3. Configurar permisos estrictos

```bash
# Archivos solo lectura para Apache
sudo chmod 644 /var/www/sportstock/*.html
sudo chmod 644 /var/www/sportstock/*.js

# Directorio solo accesible por Apache
sudo chmod 755 /var/www/sportstock
```

## 🐛 Solución de Problemas

### Apache no inicia
```bash
# Verificar errores
sudo journalctl -xeu apache2

# Verificar configuración
sudo apache2ctl configtest
```

### MySQL no conecta
```bash
# Verificar servicio
sudo systemctl status mysql

# Verificar logs
sudo tail -f /var/log/mysql/error.log
```

### Permisos denegados
```bash
# Restablecer permisos
sudo chown -R www-data:www-data /var/www/sportstock
sudo chmod -R 755 /var/www/sportstock
```

## 📚 Recursos Adicionales

- [Documentación Apache](https://httpd.apache.org/docs/)
- [Documentación MySQL](https://dev.mysql.com/doc/)
- [Guía de Seguridad Ubuntu](https://ubuntu.com/security)

## 🆘 Soporte

Para problemas o dudas:
1. Revisar logs: `/var/log/apache2/`
2. Verificar configuración de base de datos
3. Consultar documentación oficial

---

**Desarrollado por**: Estiven Castro
**Proyecto**: Sistema de Inventario Deportivo - SportStock
**Fecha**: Abril 2026
