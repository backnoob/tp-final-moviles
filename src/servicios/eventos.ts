
import type { Evento } from '../tipos/evento';

const API_URL = process.env.EXPO_PUBLIC_API_URL ?? '';
type RespuestaApi<T> = {
  datos: T;
  meta?: unknown;
};

// ADAPTAR LA URL DE LA FOTO PARA EXPO GO
function adaptarImagen(evento: Evento): Evento {
  return {
    ...evento,
    imagenUrl: evento.imagenUrl
      ? evento.imagenUrl.replace(
          'http://localhost:3000',
          API_URL
        )
      : null,
  };
}

// OBTENER LOS EVENTOS DESDE LA API
export async function obtenerEventos(): Promise<Evento[]> {
  const respuesta = await fetch(
    `${API_URL}/eventos?pagina=1&porPagina=100`
  );

  if (!respuesta.ok) {
    throw new Error('No se pudieron cargar los eventos.');
  }

  const resultado: RespuestaApi<Evento[]> =
    await respuesta.json();

  return resultado.datos.map(adaptarImagen);
}
