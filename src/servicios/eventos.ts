import { Platform } from 'react-native';

import type { Evento } from '../tipos/evento';

// MISMA DIRECCIÓN QUE UTILIZAMOS PARA LOS LUGARES
const API_URL =
  Platform.OS === 'web'
    ? 'http://localhost:3000'
    : 'http://192.168.0.245:3000';

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
