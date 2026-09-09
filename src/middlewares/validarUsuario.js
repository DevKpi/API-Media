// Expresiones regulares (RegEx) para validación de datos de usuario

// Solo letras (con soporte de acentos, diéresis y ñ) y espacios, entre 2 y 50 caracteres
export const REGEX_NOMBRE = /^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s]{2,50}$/;

// Formato de correo electrónico estándar: usuario@dominio.extension
export const REGEX_CORREO = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

// Contraseña segura: mínimo 8 caracteres, al menos una mayúscula, una minúscula y un número
export const REGEX_CONTRASENA = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;

/**
 * Middleware para validar los campos requeridos y formatos RegEx al registrar un usuario
 */
export const validarRegistroUsuario = (req, res, next) => {
  const { nombre, apellido, correo, contrasena } = req.body;

  // 1. Campos obligatorios
  if (!nombre || !correo || !contrasena) {
    return res.status(400).json({
      message: "Nombre, correo y contraseña son obligatorios",
    });
  }

  // 2. Validación de nombre
  if (!REGEX_NOMBRE.test(nombre.trim())) {
    return res.status(400).json({
      message: "El nombre solo debe contener letras y tener entre 2 y 50 caracteres",
    });
  }

  // 3. Validación de apellido (si fue provisto)
  if (apellido && !REGEX_NOMBRE.test(apellido.trim())) {
    return res.status(400).json({
      message: "El apellido solo debe contener letras y tener entre 2 y 50 caracteres",
    });
  }

  // 4. Validación de correo electrónico
  if (!REGEX_CORREO.test(correo.trim())) {
    return res.status(400).json({
      message: "El formato del correo electrónico no es válido (ej: usuario@dominio.com)",
    });
  }

  // 5. Validación de complejidad de contraseña
  if (!REGEX_CONTRASENA.test(contrasena)) {
    return res.status(400).json({
      message:
        "La contraseña debe tener al menos 8 caracteres, incluir al menos una letra mayúscula, una minúscula y un número",
    });
  }

  next();
};

/**
 * Middleware para validar formatos RegEx al actualizar un usuario existente
 */
export const validarActualizacionUsuario = (req, res, next) => {
  const { nombre, apellido, correo } = req.body;

  if (nombre === undefined && apellido === undefined && correo === undefined) {
    return res.status(400).json({
      message: "Debe enviar al menos un campo para actualizar",
    });
  }

  if (nombre !== undefined && !REGEX_NOMBRE.test(nombre.trim())) {
    return res.status(400).json({
      message: "El nombre solo debe contener letras y tener entre 2 y 50 caracteres",
    });
  }

  if (apellido !== undefined && !REGEX_NOMBRE.test(apellido.trim())) {
    return res.status(400).json({
      message: "El apellido solo debe contener letras y tener entre 2 y 50 caracteres",
    });
  }

  if (correo !== undefined && !REGEX_CORREO.test(correo.trim())) {
    return res.status(400).json({
      message: "El formato del correo electrónico no es válido (ej: usuario@dominio.com)",
    });
  }

  next();
};
