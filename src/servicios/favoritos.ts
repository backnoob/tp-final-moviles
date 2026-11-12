
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

const API_URL = process.env.EXPO_PUBLIC_API_URL;

export type Favorito = {
  id: string;
  usuarioId: string;
  lugarId: string;
  creadoEn: string;
};

type RespuestaApi<T> = {
  datos: T;
  meta?: unknown;
};

// RECUPERAR EL TOKEN DEL USUARIO
async function obtenerToken(): Promise<string | null> {
  if (Platform.OS === 'web') {
    return window.localStorage.getItem('token');
  }

  return SecureStore.getItemAsync('token');
}

// OBTENER LOS FAVORITOS DEL USUARIO
export async function obtenerFavoritos(): Promise<Favorito[]> {
  const token = await obtenerToken();

  if (!token) {
    throw new Error(
      'Necesitás iniciar sesión para ver tus favoritos.'
    );
  }

  const respuesta = await fetch(
    `${API_URL}/yo/favoritos?pagina=1&porPagina=20`,
    {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  if (!respuesta.ok) {
    throw new Error(
      'No se pudieron cargar los favoritos.'
    );
  }

  const resultado: RespuestaApi<Favorito[]> =
    await respuesta.json();

  return resultado.datos;
}

// GUARDAR UN LUGAR COMO FAVORITO
export async function guardarFavorito(
  lugarId: string
): Promise<void> {
  const token = await obtenerToken();

  if (!token) {
    throw new Error(
      'Necesitás iniciar sesión para guardar favoritos.'
    );
  }

  const respuesta = await fetch(
    `${API_URL}/yo/favoritos/${encodeURIComponent(lugarId)}`,
    {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  if (!respuesta.ok) {
    throw new Error(
      'No se pudo guardar el favorito.'
    );
  }
}

// QUITAR UN LUGAR DE FAVORITOS
export async function quitarFavorito(
  lugarId: string
): Promise<void> {
  const token = await obtenerToken();

  if (!token) {
    throw new Error(
      'Necesitás iniciar sesión para quitar favoritos.'
    );
  }

  const respuesta = await fetch(
    `${API_URL}/yo/favoritos/${encodeURIComponent(lugarId)}`,
    {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  if (!respuesta.ok) {
    throw new Error(
      'No se pudo quitar el favorito.'
    );
  }
}
