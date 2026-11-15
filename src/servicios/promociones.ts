
import { promociones } from '../mocks/promociones';

// Simula una consulta a la API del profesor
export async function obtenerPromociones() {
  return promociones;
}

// Busca una promoción por su ID
export async function obtenerPromocionPorId(id: string) {
  return promociones.find((promocion) => promocion.id === id);
}
