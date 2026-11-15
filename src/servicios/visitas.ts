import AsyncStorage from '@react-native-async-storage/async-storage';
import { Directory, File, Paths } from 'expo-file-system';
import * as Network from 'expo-network';
import * as SecureStore from 'expo-secure-store';
import Storage from 'expo-sqlite/kv-store';
import { Platform } from 'react-native';

const API_URL = process.env.EXPO_PUBLIC_API_URL ?? '';
const CLAVE_ANTERIOR = 'mis_visitas_colon';

export type VisitaLocal = {
  id: string;
  lugarId: string;
  lugar: string;
  comentario: string;
  fotoUri?: string | null;
  fechaHora: string;
  origen: 'qr' | 'manual';
  sincronizada: boolean;
};

async function tokenActual(): Promise<string | null> {
  if (Platform.OS === 'web') return window.localStorage.getItem('token');
  return SecureStore.getItemAsync('token');
}

// El historial queda separado por sesión, para no mezclar usuarios.
function claveVisitas(token: string): string {
  let hash = 2166136261;
  for (let i = 0; i < token.length; i++) {
    hash ^= token.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return `visitas_colon_${hash >>> 0}`;
}

let operacion: Promise<unknown> = Promise.resolve();
function enCola<T>(fn: () => Promise<T>): Promise<T> {
  const siguiente = operacion.then(fn, fn);
  operacion = siguiente.then(() => undefined, () => undefined);
  return siguiente;
}

async function leer(token: string): Promise<VisitaLocal[]> {
  const raw = await Storage.getItemAsync(claveVisitas(token));
  return raw ? JSON.parse(raw) as VisitaLocal[] : [];
}
async function escribir(token: string, visitas: VisitaLocal[]): Promise<void> {
  await Storage.setItemAsync(claveVisitas(token), JSON.stringify(visitas));
}

async function migrar(token: string): Promise<void> {
  const clave = claveVisitas(token);
  if (await Storage.getItemAsync(clave) !== null) return;
  const anterior = await AsyncStorage.getItem(CLAVE_ANTERIOR);
  const viejas: any[] = anterior ? JSON.parse(anterior) : [];
  const visitas: VisitaLocal[] = viejas.map((v, i) => {
    const codigo = String(v.lugar ?? '');
    return {
      id: String(v.id ?? `antigua-${i}`),
      lugarId: codigo.startsWith('COLON:') ? codigo.slice(6) : codigo,
      lugar: codigo,
      comentario: String(v.comentario ?? ''),
      fechaHora: new Date(Number(v.id) || Date.now()).toISOString(),
      origen: 'manual',
      sincronizada: false,
    };
  });
  await escribir(token, visitas);
}

export async function obtenerVisitasLocales(): Promise<VisitaLocal[]> {
  return enCola(async () => {
    const token = await tokenActual();
    if (!token) return [];
    await migrar(token);
    return leer(token);
  });
}

export async function guardarVisitaLocal(
  codigo: string,
  comentario: string,
  origen: 'qr' | 'manual',
  fotoTemporalUri: string | null = null
): Promise<VisitaLocal> {
  return enCola(async () => {
    const token = await tokenActual();
    if (!token) throw new Error('Iniciá sesión para registrar una visita.');
    if (!/^COLON:[A-Za-z0-9_-]+$/.test(codigo.trim())) {
      throw new Error('Ingresá un código válido, por ejemplo COLON:lug-004.');
    }
    await migrar(token);
    // Copiar antes de persistir: la URI del selector puede ser temporal.
    let fotoUri: string | null = null;
    if (fotoTemporalUri) {
      if (Platform.OS === 'web') throw new Error('Las fotos locales requieren la app móvil.');
      const carpeta = new Directory(Paths.document, 'fotos-visitas');
      carpeta.create({ idempotent: true, intermediates: true });
      const extension = /\.png(?:\?|$)/i.test(fotoTemporalUri) ? 'png' : 'jpg';
      const destino = new File(carpeta, `${Date.now()}-${Math.random().toString(36).slice(2)}.${extension}`);
      new File(fotoTemporalUri).copy(destino);
      fotoUri = destino.uri;
    }
    const visita: VisitaLocal = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
      lugarId: codigo.trim().slice(6),
      lugar: codigo.trim(),
      comentario: comentario.trim(),
      fotoUri,
      fechaHora: new Date().toISOString(),
      origen,
      sincronizada: false,
    };
    const actuales = await leer(token);
    await escribir(token, [visita, ...actuales]);
    return visita;
  });
}

let sincronizando = false;
export async function sincronizarVisitas(): Promise<number> {
  if (sincronizando || !API_URL) return 0;
  sincronizando = true;
  try {
    const estado = await Network.getNetworkStateAsync();
    if (!estado.isConnected || estado.isInternetReachable === false) return 0;
    return await enCola(async () => {
      const token = await tokenActual();
      if (!token) return 0;
      await migrar(token);
      const visitas = await leer(token);
      let cantidad = 0;
      for (const visita of visitas) {
        if (visita.sincronizada) continue;
        let respuesta: Response;
        try {
          respuesta = await fetch(`${API_URL}/yo/visitas`, {
            method: 'POST',
            headers: {
              Authorization: `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              lugarId: visita.lugarId,
              fechaHora: visita.fechaHora,
              origen: visita.origen,
              nota: visita.comentario || null,
            }),
          });
        } catch {
          break; // Sin red: permanece pendiente.
        }
        if (!respuesta.ok) {
          console.warn('Visita pendiente: API respondió', respuesta.status);
          break; // Nunca marcar sincronizada si la API la rechazó.
        }
        visita.sincronizada = true;
        await escribir(token, visitas);
        cantidad++;
      }
      return cantidad;
    });
  } finally {
    sincronizando = false;
  }
}
