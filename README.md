# API - Media (Text-Based CAPTCHA API)

Este proyecto consiste en el desarrollo de una API diseñada para funcionar principalmente como un sistema de **CAPTCHA basado en texto y reconocimiento cultural**. La API se encarga de servir escenas memorables, icónicas o ampliamente conocidas de series, películas y anime, donde cada escena cuenta con su respectivo subtítulo incrustado en la misma imagen. El propósito es validar la interacción humana mediante la verificación semántica o el contexto de los elementos visuales y textuales expuestos.

---

## 🚀 Características Principales

- **Filtro CAPTCHA No Convencional:** Reemplaza los captchas automáticos tradicionales por desafíos basados en el reconocimiento de escenas y subtítulos de la cultura pop.
- **Subtítulos Incrustados:** Cada recurso gráfico viene con texto integrado, permitiendo realizar dinámicas avanzadas de comparación o transcripción.
- **Estructura Extensible:** Base de datos estructurada con múltiples metadatos indexados (actores, personajes, marcas temporales exactas) para habilitar diversos tipos de validaciones automáticas.
- **Seguridad en Contraseñas:** Encriptación y hasheo mediante algoritmos robustos con **`bcrypt`** (12 salt rounds) y verificación segura sin exponer credenciales.
- **Autenticación y Autorización con JWT:** Tokens firmados (JSON Web Tokens) con control de acceso basado en roles (RBAC) y middleware de protección de rutas privadas.
- **Validaciones Rigurosas:** Validación de datos de entrada mediante expresiones regulares (RegEx) para nombres, correos y contraseñas seguras.
- **Diseño Arquitectónico Limpio:** Estructurado bajo el patrón arquitectónico Modelo-Vista-Controlador (MVC) en Node.js con Express y ES Modules.

---

## 📊 Diseño y Modelo de Datos (Persistencia)

La persistencia de datos almacena los registros de cada escena utilizando un mapeo relacional riguroso. Los campos que componen la base de datos son:

| Campo | Tipo de Datos | Descripción |
| :--- | :--- | :--- |
| `id` | `Integer` | Identificador único autoincremental de la escena (Primary Key). |
| `nombre` | `String` | Nombre oficial de la obra audiovisual (Serie, Película o Anime). |
| `imagenDeEscena` | `String` | Nombre o ruta del archivo de imagen con su respectiva extensión (ej. `.jpg`, `.png`, `.jpeg`). |
| `actor` | `String` | Nombre completo del actor o actriz de la vida real que interpreta la escena (si aplica). |
| `personaje` | `String` | Nombre del personaje de la ficción que aparece o interactúa en la escena. |
| `añoEscena` | `Integer` | Año de lanzamiento o producción original de la obra o escena correspondiente. |
| `minutoEscena` | `Double / Float` | Estampa de tiempo exacta (minuto y segundo decimal) en la que ocurre la escena dentro del metraje. |

---

## 🛠️ Puesta en Marcha / Instalación

### 1. Requisitos Previos
- **Node.js** (versión 18 o superior recomendada)
- **MySQL / MariaDB** (XAMPP o servicio local en el puerto `3306`)

### 2. Configuración de Variables de Entorno
Copia el archivo `.env.example` a `.env` y configura los accesos a tu base de datos y la seguridad JWT:
```env
PORT=3000

# Base de datos MySQL
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=
DB_NAME=api_media_db
DB_PORT=3306

# JSON Web Tokens (JWT)
JWT_SECRET=tu_clave_secreta_super_segura_aqui
JWT_EXPIRES_IN=2h
```

> [!TIP]
> Puedes generar una clave secreta segura desde la consola ejecutando:
> `node -e "import('crypto').then(c => console.log(c.randomBytes(48).toString('hex')))"`

### 3. Base de Datos
Importa el script SQL `database.sql` (para crear base de datos, tablas y datos iniciales) o `seed_data.sql` (para recarga rápida y limpia de datos de prueba) en tu gestor MySQL (phpMyAdmin o MySQL Workbench).

#### 🔑 Credenciales de Prueba Precargadas:
| Usuario / Rol | Correo Electrónico | Contraseña | Permisos |
| :--- | :--- | :--- | :--- |
| **Admin Sistema** | `admin@apimedia.com` | `Admin123*` | Control total (incluye `DELETE /usuarios/:id`) |
| **Leonardo Eckert** | `leonardo@ejemplo.com` | `Cliente123*` | Rutas protegidas estándar (`/perfil`, lectura, actualización) |
| **Carlos Gomez** | `carlos.gomez@ejemplo.com` | `ClaveSegura123` | Rutas protegidas estándar |
| **Mariana Lopez** | `mariana.lopez@ejemplo.com` | `Segura2026*` | Rutas protegidas estándar |

### 4. Instalación de dependencias y ejecución
```bash
# Instalar dependencias
npm install

# Modo desarrollo (con recarga automática)
npm run dev

# Modo producción
npm start

# Ejecutar suite de pruebas de integración y unitarias (Vitest + Supertest)
npm test
```

---

## 📖 Documentación de la API para Desarrolladores

### 🌐 Información General
- **URL Base local:** `http://localhost:3000`
- **Formato de intercambio:** `JSON`
- **Headers requeridos para peticiones con cuerpo (POST / PUT):**
  ```http
  Content-Type: application/json
  Accept: application/json
  ```
- **Header de Autenticación para endpoints protegidos:**
  ```http
  Authorization: Bearer <token_jwt>
  ```

---

### 🛡️ Reglas de Validación (RegEx)

Al enviar datos a los endpoints que crean o actualizan usuarios, la API aplica validaciones mediante expresiones regulares:

| Campo | Regla / Expresión Regular | Restricciones |
| :--- | :--- | :--- |
| `nombre` | `^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s]{2,50}$` | Solo letras y espacios. Entre 2 y 50 caracteres. |
| `apellido` | `^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s]{2,50}$` | Opcional. Si se envía, solo letras y espacios (2-50 caracteres). |
| `correo` | `^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$` | Formato estándar de email (`usuario@dominio.com`). |
| `contrasena` | `^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$` | Mínimo 8 caracteres, al menos 1 mayúscula, 1 minúscula y 1 número. |

---

## 🔌 Resumen de Endpoints

| Método | Endpoint | Descripción | Acceso |
| :--- | :--- | :--- | :--- |
| `GET` | `/` | Comprobación de estado / Mensaje de bienvenida | Público |
| `POST` | `/usuarios` | Registro de un nuevo usuario con contraseña hasheada | Público |
| `POST` | `/usuarios/login` | Autenticación de credenciales y emisión de token JWT | Público |
| `GET` | `/usuarios/perfil` | Obtener perfil del usuario autenticado (extraído del token) | Requiere Token (Bearer) |
| `GET` | `/usuarios` | Obtener listado de todos los usuarios registrados | Requiere Token (Bearer) |
| `GET` | `/usuarios/:id` | Obtener detalle de un usuario por su ID | Requiere Token (Bearer) |
| `PUT` | `/usuarios/:id` | Actualizar nombre, apellido o correo de un usuario | Requiere Token (Bearer) |
| `DELETE`| `/usuarios/:id` | Eliminar un usuario por su ID | Requiere Token (Solo Admin) |

---

## 📡 Detalle de Endpoints

### 1. Mensaje de Bienvenida / Healthcheck
- **Método:** `GET`
- **Endpoint:** `/`
- **Respuesta Exitosa (200 OK):**
  ```json
  {
    "message": "Bienvenido a la API de Media!"
  }
  ```

---

### 2. Registrar Usuario
Crea una nueva cuenta de usuario. La contraseña es validada con RegEx y encriptada con **bcrypt** antes de persistirse en la base de datos.

- **Método:** `POST`
- **Endpoint:** `/usuarios`
- **Headers:** `Content-Type: application/json`
- **Cuerpo de la petición (JSON):**
  ```json
  {
    "nombre": "Carlos",
    "apellido": "Gomez",
    "correo": "carlos.gomez@ejemplo.com",
    "contrasena": "ClaveSegura123",
    "rol": "cliente"
  }
  ```
  *(Nota: `rol` es opcional, por defecto es `"cliente"`. Los roles permitidos son `"cliente"` o `"admin"`).*

- **Respuesta Exitosa (201 Created):**
  ```json
  {
    "message": "Usuario creado con éxito",
    "usuario": {
      "id": 2,
      "nombre": "Carlos",
      "apellido": "Gomez",
      "correo": "carlos.gomez@ejemplo.com",
      "rol": "cliente",
      "creado_en": "2026-09-30T22:30:00.000Z"
    }
  }
  ```
  *(Nota de seguridad: la contraseña nunca se retorna en la respuesta).*

- **Respuestas de Error:**
  - **400 Bad Request** (Faltan campos obligatorios o falla validación RegEx):
    ```json
    { "message": "Nombre, correo y contraseña son obligatorios" }
    ```
    ```json
    { "message": "La contraseña debe tener al menos 8 caracteres, incluir al menos una letra mayúscula, una minúscula y un número" }
    ```
  - **409 Conflict** (El correo ya está registrado):
    ```json
    { "message": "El correo ya se encuentra registrado" }
    ```

---

### 3. Iniciar Sesión (Login)
Autentica las credenciales de un usuario existente comparando la contraseña ingresada con el hash bcrypt almacenado.

- **Método:** `POST`
- **Endpoint:** `/usuarios/login`
- **Headers:** `Content-Type: application/json`
- **Cuerpo de la petición (JSON):**
  ```json
  {
    "correo": "carlos.gomez@ejemplo.com",
    "contrasena": "ClaveSegura123"
  }
  ```

- **Respuesta Exitosa (200 OK):**
  ```json
  {
    "message": "Inicio de sesión exitoso",
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "usuario": {
      "id": 2,
      "nombre": "Carlos",
      "apellido": "Gomez",
      "correo": "carlos.gomez@ejemplo.com",
      "rol": "cliente",
      "creado_en": "2026-09-30T22:30:00.000Z",
      "actualizado_en": "2026-09-30T22:30:00.000Z"
    }
  }
  ```

- **Respuestas de Error:**
  - **400 Bad Request** (Campos vacíos o correo inválido):
    ```json
    { "message": "Correo y contraseña son obligatorios" }
    ```
  - **401 Unauthorized** (Contraseña incorrecta o usuario no encontrado):
    ```json
    { "message": "Credenciales inválidas" }
    ```

---

### 4. Obtener Perfil del Usuario Autenticado
Retorna los datos del usuario en sesión a partir de la identidad codificada en su token JWT.

- **Método:** `GET`
- **Endpoint:** `/usuarios/perfil`
- **Headers:** `Authorization: Bearer <token_jwt>`
- **Respuesta Exitosa (200 OK):**
  ```json
  {
    "id": 2,
    "nombre": "Carlos",
    "apellido": "Gomez",
    "correo": "carlos.gomez@ejemplo.com",
    "rol": "cliente",
    "creado_en": "2026-09-30T22:30:00.000Z"
  }
  ```
- **Respuestas de Error:**
  - **401 Unauthorized** (Token ausente o expirado):
    ```json
    { "message": "Token de autenticación no proporcionado" }
    ```
  - **403 Forbidden** (Token manipulado o firma inválida):
    ```json
    { "message": "Token inválido o alterado" }
    ```

---

### 5. Obtener Todos los Usuarios
Recupera el listado completo de los usuarios dados de alta en el sistema. Requiere token de autenticación.

- **Método:** `GET`
- **Endpoint:** `/usuarios`
- **Headers:** `Authorization: Bearer <token_jwt>`
- **Respuesta Exitosa (200 OK):**
  ```json
  [
    {
      "id": 1,
      "nombre": "Admin",
      "apellido": "Sistema",
      "correo": "admin@apimedia.com",
      "rol": "admin",
      "creado_en": "2026-09-09T22:32:00.000Z"
    },
    {
      "id": 2,
      "nombre": "Carlos",
      "apellido": "Gomez",
      "correo": "carlos.gomez@ejemplo.com",
      "rol": "cliente",
      "creado_en": "2026-09-30T22:30:00.000Z"
    }
  ]
  ```

---

### 6. Obtener Usuario por ID
Recupera los datos de un usuario en específico a través de su identificador numérico.

- **Método:** `GET`
- **Endpoint:** `/usuarios/:id`
- **Headers:** `Authorization: Bearer <token_jwt>`
- **Parámetros de Ruta:**
  - `id` *(número entero obligatorio)*: ID del usuario (ej. `/usuarios/2`).
- **Respuesta Exitosa (200 OK):**
  ```json
  {
    "id": 2,
    "nombre": "Carlos",
    "apellido": "Gomez",
    "correo": "carlos.gomez@ejemplo.com",
    "rol": "cliente",
    "creado_en": "2026-09-30T22:30:00.000Z"
  }
  ```
- **Respuestas de Error:**
  - **400 Bad Request** (ID no numérico):
    ```json
    { "message": "El ID proporcionado debe ser un número válido" }
    ```
  - **401 Unauthorized** (Sin token o expirado):
    ```json
    { "message": "Token de autenticación no proporcionado" }
    ```
  - **404 Not Found** (No existe el ID):
    ```json
    { "message": "Usuario no encontrado" }
    ```

---

### 7. Actualizar Usuario
Modifica los datos generales (`nombre`, `apellido`, `correo`) de un usuario existente. Solo es necesario enviar los campos que se deseen cambiar.

- **Método:** `PUT`
- **Endpoint:** `/usuarios/:id`
- **Headers:**
  ```http
  Content-Type: application/json
  Authorization: Bearer <token_jwt>
  ```
- **Parámetros de Ruta:**
  - `id` *(número entero obligatorio)*: ID del usuario a modificar.
- **Cuerpo de la petición (JSON):**
  ```json
  {
    "nombre": "Carlos Actualizado",
    "apellido": "Gomez Perez"
  }
  ```
- **Respuesta Exitosa (200 OK):**
  ```json
  {
    "message": "Usuario actualizado correctamente",
    "usuario": {
      "id": 2,
      "nombre": "Carlos Actualizado",
      "apellido": "Gomez Perez",
      "correo": "carlos.gomez@ejemplo.com",
      "rol": "cliente",
      "creado_en": "2026-09-30T22:30:00.000Z"
    }
  }
  ```
- **Respuestas de Error:**
  - **400 Bad Request** (Cuerpo vacío o fallos en formato RegEx):
    ```json
    { "message": "Debe enviar al menos un campo para actualizar" }
    ```
  - **401 Unauthorized** (Sin token o expirado):
    ```json
    { "message": "Token de autenticación no proporcionado" }
    ```
  - **404 Not Found** (Usuario inexistente):
    ```json
    { "message": "Usuario no encontrado" }
    ```
  - **409 Conflict** (Si se intenta cambiar a un correo que ya pertenece a otro usuario):
    ```json
    { "message": "El nuevo correo ya está en uso por otro usuario" }
    ```

---

### 8. Eliminar Usuario
Da de baja a un usuario de la base de datos. Requiere privilegios de administrador (`rol: admin`).

- **Método:** `DELETE`
- **Endpoint:** `/usuarios/:id`
- **Headers:** `Authorization: Bearer <token_admin>`
- **Parámetros de Ruta:**
  - `id` *(número entero obligatorio)*: ID del usuario a eliminar.
- **Respuesta Exitosa (200 OK):**
  ```json
  {
    "message": "Usuario eliminado correctamente",
    "usuario": {
      "id": 2,
      "nombre": "Carlos Actualizado",
      "apellido": "Gomez Perez",
      "correo": "carlos.gomez@ejemplo.com",
      "rol": "cliente",
      "creado_en": "2026-09-30T22:30:00.000Z"
    }
  }
  ```
- **Respuestas de Error:**
  - **401 Unauthorized** (Sin token de sesión):
    ```json
    { "message": "Token de autenticación no proporcionado" }
    ```
  - **403 Forbidden** (El usuario no tiene rol 'admin'):
    ```json
    { "message": "Acceso denegado: se requieren privilegios de administrador" }
    ```
  - **404 Not Found**:
    ```json
    { "message": "Usuario no encontrado" }
    ```

---

## 💻 Ejemplos de Consumo Práctico

### Ejemplo 1: Enviar petición con JavaScript (Fetch API moderna)

#### Registrar Usuario:
```javascript
async function registrarUsuario() {
  try {
    const respuesta = await fetch("http://localhost:3000/usuarios", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        nombre: "Mariana",
        apellido: "Lopez",
        correo: "mariana@ejemplo.com",
        contrasena: "Segura2026*",
      }),
    });

    const datos = await respuesta.json();
    if (!respuesta.ok) {
      throw new Error(datos.message || "Error al registrar usuario");
    }

    console.log("Usuario registrado con éxito:", datos.usuario);
  } catch (error) {
    console.error("Fallo:", error.message);
  }
}
```

#### Iniciar Sesión (Login) y Obtención de Token:
```javascript
async function iniciarSesion(correo, contrasena) {
  try {
    const respuesta = await fetch("http://localhost:3000/usuarios/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ correo, contrasena }),
    });

    const datos = await respuesta.json();
    if (!respuesta.ok) {
      throw new Error(datos.message);
    }

    console.log("Token JWT:", datos.token);
    console.log("Bienvenido:", datos.usuario.nombre);
    return datos.token;
  } catch (error) {
    console.error("Error de autenticación:", error.message);
  }
}
```

#### Consultar Perfil con Bearer Token:
```javascript
async function consultarMiPerfil(token) {
  try {
    const respuesta = await fetch("http://localhost:3000/usuarios/perfil", {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${token}`,
      },
    });

    const perfil = await respuesta.json();
    if (!respuesta.ok) {
      throw new Error(perfil.message);
    }

    console.log("Perfil del usuario:", perfil);
  } catch (error) {
    console.error("Error al obtener perfil:", error.message);
  }
}
```

---

### Ejemplo 2: Probar con `cURL` desde la Terminal

#### 1. Registro:
```bash
curl -X POST http://localhost:3000/usuarios \
  -H "Content-Type: application/json" \
  -d "{\"nombre\":\"Mariana\",\"apellido\":\"Lopez\",\"correo\":\"mariana@ejemplo.com\",\"contrasena\":\"Segura2026\"}"
```

#### 2. Inicio de Sesión (Obtener JWT):
```bash
curl -X POST http://localhost:3000/usuarios/login \
  -H "Content-Type: application/json" \
  -d "{\"correo\":\"mariana@ejemplo.com\",\"contrasena\":\"Segura2026\"}"
```

#### 3. Consultar Perfil Propio con Token:
```bash
curl -X GET http://localhost:3000/usuarios/perfil \
  -H "Authorization: Bearer <TOKEN_OBTENIDO>"
```

#### 4. Consultar listado de usuarios con Token:
```bash
curl -X GET http://localhost:3000/usuarios \
  -H "Authorization: Bearer <TOKEN_OBTENIDO>"
```

---

## 🚦 Códigos de Estado HTTP Utilizados

- `200 OK`: Operación exitosa (lectura, modificación o eliminación completada).
- `201 Created`: Recurso creado exitosamente (registro de usuario).
- `400 Bad Request`: Parámetros faltantes o datos que no cumplen el formato RegEx requerido.
- `401 Unauthorized`: Fallo de autenticación en login o token ausente / expirado en endpoints protegidos.
- `403 Forbidden`: Acceso denegado (token adulterado, firma inválida o rol insuficiente como en eliminación de usuarios).
- `404 Not Found`: El recurso o ID especificado no existe.
- `409 Conflict`: Conflicto de unicidad en la base de datos (ej. correo ya registrado).
- `500 Internal Server Error`: Error interno imprevisto en el servidor.