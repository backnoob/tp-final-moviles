

import type { Categoria } from '../tipos/categoria';
import type { Lugar } from '../tipos/lugar';

const API_URL = process.env.EXPO_PUBLIC_API_URL ?? '';
// La API devuelve los datos dentro de la propiedad "datos".
type RespuestaApi<T> = {
  datos: T;
  meta?: unknown;
};

// Convierte localhost en la dirección accesible desde el celular.
function adaptarImagenes(lugar: Lugar): Lugar {
  return {
    ...lugar,
    imagenes: lugar.imagenes.map((imagen) =>
     imagen.replace(
  /http:\/\/(localhost|192\.168\.0\.10):3000/,
  API_URL
)
    ),
  };
}

// OBTENER TODOS LOS LUGARES ACTIVOS
export async function obtenerLugares(): Promise<Lugar[]> {
  const respuesta = await fetch(
    `${API_URL}/lugares?pagina=1&porPagina=500`
  );

  if (!respuesta.ok) {
    throw new Error('No se pudieron cargar los lugares.');
  }

  const resultado: RespuestaApi<Lugar[]> =
    await respuesta.json();

  return resultado.datos
    .filter((lugar) => lugar.activo)
    .map(adaptarImagenes);
}

// BUSCAR UN LUGAR POR SU IDENTIFICADOR
export async function obtenerLugarPorId(
  id: string
): Promise<Lugar | undefined> {
  const respuesta = await fetch(
    `${API_URL}/lugares/${encodeURIComponent(id)}`
  );

  if (respuesta.status === 404) {
    return undefined;
  }

  if (!respuesta.ok) {
    throw new Error('No se pudo cargar el lugar.');
  }

  const resultado: RespuestaApi<Lugar> =
    await respuesta.json();

  if (!resultado.datos.activo) {
    return undefined;
  }

  return adaptarImagenes(resultado.datos);
}

// OBTENER TODAS LAS CATEGORÍAS
export async function obtenerCategorias(): Promise<Categoria[]> {
  const respuesta = await fetch(
    `${API_URL}/categorias`
  );

  if (!respuesta.ok) {
    throw new Error('No se pudieron cargar las categorías.');
  }

  const resultado: RespuestaApi<Categoria[]> =
    await respuesta.json();

  return resultado.datos.sort(
    (a, b) => a.orden - b.orden
  );
}
