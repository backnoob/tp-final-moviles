
import type { Coordenadas } from '../tipos/lugar';

// Calcula la distancia en kilómetros entre dos coordenadas.
// Utiliza la fórmula de Haversine.
export function calcularDistancia(
  origen: Coordenadas,
  destino: Coordenadas
): number {
  const radioTierra = 6371;

  const convertirRadianes = (grados: number) =>
    (grados * Math.PI) / 180;

  const diferenciaLatitud = convertirRadianes(
    destino.latitud - origen.latitud
  );

  const diferenciaLongitud = convertirRadianes(
    destino.longitud - origen.longitud
  );

  const a =
    Math.sin(diferenciaLatitud / 2) ** 2 +
    Math.cos(convertirRadianes(origen.latitud)) *
      Math.cos(convertirRadianes(destino.latitud)) *
      Math.sin(diferenciaLongitud / 2) ** 2;

  const distancia =
    2 *
    radioTierra *
    Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return distancia;
}
