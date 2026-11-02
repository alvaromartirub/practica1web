// Validación de asignaturas. Devuelve TODAS las incidencias de una vez,
// con el formato { field, message }, para que el cliente pueda marcarlas por campo.

const AREAS = ['programacion', 'matematicas', 'datos-ia', 'sistemas', 'etica'];

const reglas = {
  nombre(v) {
    if (typeof v !== 'string') return 'El nombre debe ser un texto';
    const len = v.trim().length;
    if (len < 3 || len > 80) return 'El nombre debe tener entre 3 y 80 caracteres';
    return null;
  },
  creditos(v) {
    if (!Number.isInteger(v) || v < 1 || v > 12) return 'Los créditos deben ser un número entero entre 1 y 12';
    return null;
  },
  curso(v) {
    if (!Number.isInteger(v) || v < 1 || v > 5) return 'El curso debe ser un número entero entre 1 y 5';
    return null;
  },
  obligatoria(v) {
    if (typeof v !== 'boolean') return 'obligatoria debe ser true o false';
    return null;
  },
  area(v) {
    if (!AREAS.includes(v)) return `El área debe ser una de: ${AREAS.join(', ')}`;
    return null;
  },
};

// partial = false (POST, PUT): todos los campos son obligatorios.
// partial = true (PATCH): solo se validan los campos presentes, pero debe haber al menos uno.
function validateAsignatura(body, { partial = false } = {}) {
  const errors = [];

  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    return { errors: [{ field: 'body', message: 'El cuerpo debe ser un objeto JSON' }] };
  }

  let presentes = 0;
  for (const campo of Object.keys(reglas)) {
    if (body[campo] === undefined) {
      if (!partial) errors.push({ field: campo, message: 'Campo obligatorio' });
      continue;
    }
    presentes++;
    const mensaje = reglas[campo](body[campo]);
    if (mensaje) errors.push({ field: campo, message: mensaje });
  }

  if (partial && presentes === 0) {
    errors.push({ field: 'body', message: 'Indica al menos un campo a modificar' });
  }

  return { errors };
}

module.exports = { validateAsignatura, AREAS };
