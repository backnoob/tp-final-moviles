import { useAudioPlayer, useAudioPlayerStatus } from 'expo-audio';
import { Directory, File, Paths } from 'expo-file-system';
import { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

type Props = { url: string };

// Cada URL tiene su propio archivo, evitando colisiones entre audioguías.
function nombreArchivo(url: string): string {
  let hash = 2166136261;
  for (let i = 0; i < url.length; i++) {
    hash ^= url.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  const extension = /\.mp3(?:[?#]|$)/i.test(url) ? 'mp3' :
    /\.m4a(?:[?#]|$)/i.test(url) ? 'm4a' :
    /\.wav(?:[?#]|$)/i.test(url) ? 'wav' : 'mp3';
  return `audioguia-${hash >>> 0}.${extension}`;
}

export default function ReproductorAudioguia({ url }: Props) {
  const player = useAudioPlayer(null);
  const status = useAudioPlayerStatus(player);
  const [rutaLocal, setRutaLocal] = useState<string | null>(null);
  const [revisando, setRevisando] = useState(true);
  const [descargando, setDescargando] = useState(false);

  useEffect(() => {
    let vigente = true;
    const carpeta = new Directory(Paths.document, 'audioguias');
    const archivo = new File(carpeta, nombreArchivo(url));

    async function cargar() {
      setRevisando(true);
      setRutaLocal(null);
      try {
        // Si existe un archivo descargado, siempre preferirlo a la red.
        const local = archivo.exists && archivo.size > 0 ? archivo.uri : null;
        if (!vigente) return;
        setRutaLocal(local);
        player.pause();
        player.replace({ uri: local ?? url });
      } catch (error) {
        console.warn('No se pudo consultar la audioguía local:', error);
        if (vigente) player.replace({ uri: url });
      } finally {
        if (vigente) setRevisando(false);
      }
    }
    void cargar();
    return () => {
      vigente = false;
      player.pause();
    };
  }, [url, player]);

  async function descargar() {
    if (descargando || rutaLocal) return;
    setDescargando(true);
    try {
      const carpeta = new Directory(Paths.document, 'audioguias');
      if (!carpeta.exists) carpeta.create({ intermediates: true, idempotent: true });
      const destino = new File(carpeta, nombreArchivo(url));
      const temporal = new File(Paths.cache, `descarga-${Date.now()}-${nombreArchivo(url)}`);
      try {
        const descargado = await File.downloadFileAsync(url, temporal);
        if (!descargado.exists || descargado.size <= 0) {
          throw new Error('El archivo descargado está vacío.');
        }
        if (destino.exists) destino.delete();
        descargado.move(destino);
        player.pause();
        player.replace({ uri: destino.uri });
        setRutaLocal(destino.uri);
        Alert.alert('Audioguía descargada', 'Ya podés escucharla sin internet.');
      } finally {
        if (temporal.exists) temporal.delete();
      }
    } catch (error) {
      console.warn('Error al descargar audioguía:', error);
      Alert.alert('No se pudo descargar', 'Revisá la conexión e intentá nuevamente.');
    } finally {
      setDescargando(false);
    }
  }

  const duracion = status.duration || 0;
  const posicion = status.currentTime || 0;

  function formatoTiempo(segundos: number) {
    const total = Math.floor(Number.isFinite(segundos) ? segundos : 0);
    const minutos = Math.floor(total / 60);
    return `${minutos}:${String(total % 60).padStart(2, '0')}`;
  }

  async function reproducirPausar() {
    if (!status.isLoaded) {
      Alert.alert('Audioguía', 'El audio todavía no está disponible. Si no tenés internet, descargalo previamente.');
      return;
    }
    if (status.playing) {
      player.pause();
    } else {
      if (status.didJustFinish) await player.seekTo(0);
      player.play();
    }
  }

  async function adelantar() {
    if (status.isLoaded) await player.seekTo(Math.min(posicion + 10, duracion));
  }

  async function retroceder() {
    if (status.isLoaded) await player.seekTo(Math.max(posicion - 10, 0));
  }

  return (
    <View style={styles.contenedor}>
      <Text style={styles.titulo}>Escuchar audioguía</Text>
      <Text style={styles.tiempo}>{formatoTiempo(posicion)} / {formatoTiempo(duracion)}</Text>
      <View style={styles.controles}>
        <TouchableOpacity onPress={retroceder} style={styles.boton}>
          <Text style={styles.textoBoton}>-10 s</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => void reproducirPausar()} style={styles.botonPrincipal}>
          <Text style={styles.textoPrincipal}>{status.playing ? 'Pausar' : 'Reproducir'}</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={adelantar} style={styles.boton}>
          <Text style={styles.textoBoton}>+10 s</Text>
        </TouchableOpacity>
      </View>
      <Text style={styles.estado}>
        {revisando ? 'Buscando descarga...' : rutaLocal ? '✓ Disponible sin internet' : 'Requiere internet para reproducir'}
      </Text>
      {!rutaLocal && !revisando && (
        <TouchableOpacity onPress={() => void descargar()} disabled={descargando} style={styles.botonDescarga}>
          {descargando ? <ActivityIndicator color="#17624F" /> :
            <Text style={styles.textoDescarga}>↓ Descargar para escuchar sin internet</Text>}
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  contenedor: { marginTop: 12, padding: 14, backgroundColor: '#E9F1EC', borderRadius: 12 },
  titulo: { color: '#17624F', fontSize: 14, fontWeight: '600', marginBottom: 10 },
  tiempo: { textAlign: 'center', color: '#626B65', marginBottom: 12 },
  controles: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  boton: { padding: 10 },
  textoBoton: { color: '#17624F', fontWeight: '600' },
  botonPrincipal: { backgroundColor: '#17624F', paddingHorizontal: 15, paddingVertical: 12, borderRadius: 10 },
  textoPrincipal: { color: '#FFFFFF', fontWeight: '600' },
  estado: { textAlign: 'center', color: '#626B65', fontSize: 12, marginTop: 14 },
  botonDescarga: { borderWidth: 1, borderColor: '#17624F', borderRadius: 10, padding: 12, marginTop: 10, alignItems: 'center' },
  textoDescarga: { color: '#17624F', fontWeight: '600', fontSize: 13 },
});
