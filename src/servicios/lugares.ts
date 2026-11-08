
import { categorias } from '../mocks/categorias';
import { lugares } from '../mocks/lugares';

import type { Categoria } from '../tipos/categoria';
import type { Lugar } from '../tipos/lugar';

// OBTENER TODOS LOS LUGARES ACTIVOS
export async function obtenerLugares(): Promise<Lugar[]> {
  return lugares.filter((lugar) => lugar.activo);
}

// BUSCAR UN LUGAR POR SU IDENTIFICADOR
export async function obtenerLugarPorId(
  id: string
): Promise<Lugar | undefined> {
  return lugares.find(
    (lugar) => lugar.id === id && lugar.activo
  );
}

// OBTENER TODAS LAS CATEGORÍAS
export async function obtenerCategorias(): Promise<Categoria[]> {
  return [...categorias].sort(
    (a, b) => a.orden - b.orden
  );
}
