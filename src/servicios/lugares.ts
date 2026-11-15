import type { Categoria } from '../tipos/categoria';
import type { Lugar } from '../tipos/lugar';
import { guardarCache, leerCache } from './cache';

const API_URL = process.env.EXPO_PUBLIC_API_URL ?? '';

type RespuestaApi<T> = {
  datos: T;
  meta?: unknown;
};

function adaptarImagenes(lugar: Lugar): Lugar {
  return {
    ...lugar,
    imagenes: lugar.imagenes.map((imagen) =>
      imagen.replace(/http:\/\/(localhost|192\.168\.0\.10):3000/, API_URL)
    ),
  };
}

export async function obtenerLugares(): Promise<Lugar[]> {
  try {
    const respuesta = await fetch(`${API_URL}/lugares?pagina=1&porPagina=500`);
    if (!respuesta.ok) throw new Error('No se pudieron cargar los lugares.');

    const resultado: RespuestaApi<Lugar[]> = await respuesta.json();
    const lugares = resultado.datos.filter((lugar) => lugar.activo).map(adaptarImagenes);
    await guardarCache('lugares', lugares);
    return lugares;
  } catch (error) {
    const lugaresGuardados = await leerCache<Lugar[]>('lugares');
    if (lugaresGuardados !== null) return lugaresGuardados;
    throw error;
  }
}

export async function obtenerLugarPorId(id: string): Promise<Lugar | undefined> {
  try {
    const respuesta = await fetch(`${API_URL}/lugares/${encodeURIComponent(id)}`);
    if (respuesta.status === 404) return undefined;
    if (!respuesta.ok) throw new Error('No se pudo cargar el lugar.');

    const resultado: RespuestaApi<Lugar> = await respuesta.json();
    if (!resultado.datos.activo) return undefined;

    const lugar = adaptarImagenes(resultado.datos);
    await guardarCache(`lugar-${id}`, lugar);
    return lugar;
  } catch (error) {
    const lugarGuardado = await leerCache<Lugar>(`lugar-${id}`);
    if (lugarGuardado !== null) return lugarGuardado;

    const lugares = await leerCache<Lugar[]>('lugares');
    const lugar = lugares?.find((item) => item.id === id);
    if (lugar) return lugar;
    throw error;
  }
}

export async function obtenerCategorias(): Promise<Categoria[]> {
  try {
    const respuesta = await fetch(`${API_URL}/categorias`);
    if (!respuesta.ok) throw new Error('No se pudieron cargar las categorías.');

    const resultado: RespuestaApi<Categoria[]> = await respuesta.json();
    const categorias = resultado.datos.sort((a, b) => a.orden - b.orden);
    await guardarCache('categorias', categorias);
    return categorias;
  } catch (error) {
    const categoriasGuardadas = await leerCache<Categoria[]>('categorias');
    if (categoriasGuardadas !== null) return categoriasGuardadas;
    throw error;
  }
}
