# 🗄️ Guía de Importación de la Base de Datos (XAMPP)

Esta guía detalla los pasos para importar y configurar la base de datos `api_media_db` para el proyecto **API - Media**.

---

## 📋 Requisitos Previos

1. Tener instalado **[XAMPP](https://www.apachefriends.org/)**.
2. Abrir el **XAMPP Control Panel**.
3. Iniciar los servicios:
   - **Apache** (botón *Start*)
   - **MySQL** (botón *Start*)

Ambos servicios deben figurar con fondo verde en el panel de control.

---

## 🚀 Método 1: Desde phpMyAdmin (Recomendado)

1. **Acceder a phpMyAdmin:**
   - Abre tu navegador web e ingresa a: [http://localhost/phpmyadmin](http://localhost/phpmyadmin)
   - *(O haz clic en el botón **Admin** que figura al lado de MySQL en el panel de XAMPP)*.

2. **Ir a la sección de importación:**
   - En el menú superior de phpMyAdmin, haz clic en la pestaña **Importar** (*Import*).

3. **Seleccionar el archivo SQL:**
   - En la sección *Archivo a importar*, haz clic en **Seleccionar archivo** (*Choose File*).
   - Busca y selecciona el archivo `database.sql` ubicado en la raíz de este proyecto:
     ```plaintext
     API-Media/database.sql
     ```

4. **Ejecutar la importación:**
   - Deja las opciones de formato en **SQL** y codificación en **utf-8**.
   - Desplázate hasta el final de la página y haz clic en el botón **Importar** (*Continuar* o *Import*).

5. **Verificación exitosa:**
   - phpMyAdmin mostrará un mensaje en verde confirmando que las consultas se ejecutaron correctamente.
   - En el panel lateral izquierdo verás la base de datos **`api_media_db`** con sus 6 tablas:
     - `usuarios`
     - `obras`
     - `actores`
     - `personajes`
     - `escenas`
     - `desafios_captcha`

---

## ⚡ Método 2: Mediante la Consola de XAMPP (Shell)

Si prefieres la terminal:

1. En el **XAMPP Control Panel**, haz clic en el botón **Shell** (a la derecha).
2. Dirígete a la carpeta del proyecto o ejecuta directamente:
   ```bash
   mysql -u root -p < "C:\Users\isft118\Desktop\Software 2do\API-Media\database.sql"
   ```
   *(Si el usuario `root` no tiene contraseña configurada en XAMPP, simplemente presiona `Enter` cuando pida la contraseña)*.

---

## 🔍 Consultas de Prueba Rápidas

Una vez importada la base de datos, puedes ir a la pestaña **SQL** dentro de `api_media_db` en phpMyAdmin y probar:

### Ver las escenas cargadas con subtítulos:
```sql
SELECT 
    e.id, 
    o.titulo AS obra, 
    p.nombre AS personaje, 
    a.nombre_completo AS actor, 
    e.subtitulo_texto, 
    e.minuto_escena,
    e.dificultad
FROM escenas e
JOIN obras o ON e.obra_id = o.id
LEFT JOIN personajes p ON e.personaje_id = p.id
LEFT JOIN actores a ON e.actor_id = a.id;
```

### Ver los usuarios registrados:
```sql
SELECT id, nombre, apellido, correo, rol, creado_en FROM usuarios;
```

---

## ⚠️ Solución de Problemas Comunes

* **Error: Port 3306 in use:** Si MySQL no inicia en XAMPP, asegúrate de no tener otro servicio de MySQL o MariaDB corriendo de fondo en Windows.
* **Error de claves foráneas:** El script `database.sql` incluye directivas `SET FOREIGN_KEY_CHECKS = 0;` al inicio, por lo que puedes re-importarlo tantas veces como necesites sin conflictos de dependencias.
