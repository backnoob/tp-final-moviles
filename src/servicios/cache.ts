
import Storage from 'expo-sqlite/kv-store';

export async function guardarCache<T>(
  clave: string,
  datos: T
): Promise<void> {
  await Storage.setItemAsync(clave, JSON.stringify(datos));
}

export async function leerCache<T>(
  clave: string
): Promise<T | null> {
  const contenido = await Storage.getItemAsync(clave);

  if (contenido === null) {
    return null;
  }

  return JSON.parse(contenido) as T;
}
