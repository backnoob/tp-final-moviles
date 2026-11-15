import {
  PlusJakartaSans_400Regular,
  PlusJakartaSans_500Medium,
  PlusJakartaSans_600SemiBold,
  PlusJakartaSans_700Bold,
  useFonts,
} from '@expo-google-fonts/plus-jakarta-sans';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator, Alert, AppState, ScrollView, StyleSheet,
  Text, TextInput, TouchableOpacity, View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { obtenerLugares } from '../../servicios/lugares';
import {
  guardarVisitaLocal, obtenerVisitasLocales, sincronizarVisitas, VisitaLocal,
} from '../../servicios/visitas';
import type { Lugar } from '../../tipos/lugar';

export default function RecorridoScreen() {
  const [fontsLoaded] = useFonts({
    PlusJakartaSans_400Regular, PlusJakartaSans_500Medium,
    PlusJakartaSans_600SemiBold, PlusJakartaSans_700Bold,
  });
  const [permission, requestPermission] = useCameraPermissions();
  const [abrirCamara, setAbrirCamara] = useState(false);
  const [codigoActual, setCodigoActual] = useState('');
  const [origen, setOrigen] = useState<'qr' | 'manual'>('manual');
  const [nota, setNota] = useState('');
  const [guardando, setGuardando] = useState(false);
  const [listaVisitas, setListaVisitas] = useState<VisitaLocal[]>([]);
  const [lugaresPorId, setLugaresPorId] = useState<Record<string, Lugar>>({});

  useEffect(() => {
    let activo = true;
    obtenerLugares().then(lugares => {
      if (activo) setLugaresPorId(Object.fromEntries(lugares.map(l => [l.id, l])));
    }).catch(error => console.warn('No se pudieron cargar nombres de lugares:', error));
    return () => { activo = false; };
  }, []);

  useEffect(() => {
    let activo = true;
    async function actualizar() {
      try {
        await sincronizarVisitas();
        const visitas = await obtenerVisitasLocales();
        if (activo) setListaVisitas(visitas);
      } catch (error) {
        console.warn('Recorrido:', error);
      }
    }
    void actualizar();
    // Mientras la pantalla está abierta, reintenta al volver la conexión.
    const intervalo = setInterval(() => void actualizar(), 15000);
    const suscripcion = AppState.addEventListener('change', estado => {
      if (estado === 'active') void actualizar();
    });
    return () => {
      activo = false;
      clearInterval(intervalo);
      suscripcion.remove();
    };
  }, []);

  const handleScanned = ({ data }: { data: string }) => {
    if (/^COLON:[A-Za-z0-9_-]+$/.test(data)) {
      setCodigoActual(data);
      setOrigen('qr');
      setAbrirCamara(false);
    } else {
      setAbrirCamara(false);
      Alert.alert('QR inválido', 'Este código QR no pertenece a Mi Ciudad Colón.');
    }
  };

  const guardar = async () => {
    if (guardando) return;
    setGuardando(true);
    try {
      await guardarVisitaLocal(codigoActual, nota, origen);
      setListaVisitas(await obtenerVisitasLocales());
      setCodigoActual('');
      setNota('');
      setOrigen('manual');
      const sincronizadas = await sincronizarVisitas();
      setListaVisitas(await obtenerVisitasLocales());
      Alert.alert('Visita guardada', sincronizadas
        ? 'Se guardó y sincronizó con la API.'
        : 'Se guardó en el teléfono. Se sincronizará cuando haya conexión.');
    } catch (error) {
      Alert.alert('No se pudo guardar', error instanceof Error ? error.message : 'Error inesperado.');
    } finally {
      setGuardando(false);
    }
  };

  if (!fontsLoaded) {
    return <View style={styles.cargandoPantalla}>
      <ActivityIndicator size="large" color="#17624F" />
    </View>;
  }

  if (!permission) return <View />;
  if (!permission.granted) {
    return <SafeAreaView style={styles.container}>
      <View style={styles.estado}>
        <Text style={styles.tituloVacio}>Necesitamos permisos</Text>
        <Text style={styles.descripcionVacio}>Requerimos acceso a la cámara para leer códigos QR.</Text>
        <TouchableOpacity style={styles.botonExplorar} onPress={requestPermission}>
          <Text style={styles.textoBotonExplorar}>Dar permisos</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>;
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.contenido} showsVerticalScrollIndicator={false}>
        <View style={styles.navegacion}>
          <TouchableOpacity onPress={() => router.back()} accessibilityRole="button" accessibilityLabel="Volver atrás">
            <Text style={styles.volver}>← Volver</Text>
          </TouchableOpacity>
          <Text style={styles.marca}>MI RECORRIDO</Text>
        </View>
        <Text style={styles.titulo}>Mi recorrido</Text>
        <Text style={styles.subtitulo}>Registrá tus visitas, incluso sin conexión.</Text>
        {abrirCamara ? (
          <View style={styles.camaraBox}>
            <CameraView style={{ flex: 1 }} barcodeScannerSettings={{ barcodeTypes: ['qr'] }}
              onBarcodeScanned={handleScanned} />
            <TouchableOpacity style={[styles.botonExplorar, { backgroundColor: '#C45159', marginTop: 10 }]}
              onPress={() => setAbrirCamara(false)}>
              <Text style={styles.textoBotonExplorar}>Cancelar escaneo</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <TouchableOpacity style={styles.botonExplorar} onPress={() => setAbrirCamara(true)}>
            <Text style={styles.textoBotonExplorar}>📷 Escanear QR</Text>
          </TouchableOpacity>
        )}
        {!abrirCamara && (
          <View style={styles.card}>
            <Text style={styles.lugarDetectado}>Registro de visita</Text>
            <TextInput style={styles.input} placeholder="Ej: COLON:lug-004"
              placeholderTextColor="#929292" value={codigoActual}
              onChangeText={texto => { setCodigoActual(texto); setOrigen('manual'); }} />
            <TextInput style={styles.input} placeholder="Escribí una nota sobre tu visita..."
              placeholderTextColor="#929292" value={nota} onChangeText={setNota} />
            <TouchableOpacity disabled={guardando}
              style={[styles.botonExplorar, { backgroundColor: '#2E7D32', opacity: guardando ? 0.6 : 1 }]}
              onPress={guardar}>
              <Text style={styles.textoBotonExplorar}>
                {guardando ? 'Guardando...' : 'Guardar visita en el recorrido'}
              </Text>
            </TouchableOpacity>
          </View>
        )}
        <Text style={[styles.titulo, { fontSize: 20, marginTop: 25 }]}>
          Lugares visitados ({listaVisitas.length})
        </Text>
        {listaVisitas.length === 0 ? (
          <View style={styles.estado}>
            <Text style={styles.iconoVacio}>📍</Text>
            <Text style={styles.tituloVacio}>Todavía no registraste visitas</Text>
            <Text style={styles.descripcionVacio}>Escaneá los QR para armar tu historial.</Text>
          </View>
        ) : listaVisitas.map(item => {
          const lugar = lugaresPorId[item.lugarId];
          const nombre = lugar?.nombre ?? (item.lugar && !item.lugar.startsWith('COLON:') ? item.lugar : 'Lugar visitado');
          return (
            <TouchableOpacity
              key={item.id}
              style={styles.tarjetaVisita}
              accessibilityRole="button"
              accessibilityLabel={`Ver detalles de ${nombre}`}
              onPress={() => router.push({ pathname: '/principal/[id]', params: { id: item.lugarId } })}
            >
              <Text style={styles.nombreVisita}>📍 {nombre}  ›</Text>
              <Text style={styles.notaVisita}>
                {new Date(item.fechaHora).toLocaleString('es-AR', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
              </Text>
              <Text style={styles.notaVisita}>
                {item.sincronizada ? '✓ Sincronizada' : '⏳ Pendiente de sincronización'}
              </Text>
              {item.comentario ? <Text style={styles.notaVisita}>Nota: "{item.comentario}"</Text> : null}
              <Text style={[styles.notaVisita, { color: '#17624F', marginTop: 6 }]}>Ver detalles y mapa →</Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  cargandoPantalla: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
  contenido: {
    paddingHorizontal: 22,
    paddingTop: 22,
    paddingBottom: 70,
  },
  navegacion: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 34,
  },
  volver: {
    color: '#17624F',
    fontSize: 14,
    fontFamily: 'PlusJakartaSans_500Medium',
  },
  marca: {
    color: '#17624F',
    fontSize: 12,
    fontFamily: 'PlusJakartaSans_700Bold',
    letterSpacing: 1,
  },
  titulo: {
    color: '#202724',
    fontSize: 29,
    fontFamily: 'PlusJakartaSans_600SemiBold',
    marginBottom: 10,
  },
  subtitulo: {
    color: '#777D79',
    fontSize: 14,
    fontFamily: 'PlusJakartaSans_400Regular',
    lineHeight: 23,
    marginBottom: 20,
  },
  camaraBox: {
    height: 320,
    width: '100%',
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 20,
    backgroundColor: '#000',
  },
  card: {
    padding: 18,
    backgroundColor: '#F5F8F6',
    borderRadius: 13,
    borderWidth: 1,
    borderColor: '#ECEDEB',
    marginBottom: 20,
  },
  lugarDetectado: {
    fontSize: 15,
    fontFamily: 'PlusJakartaSans_600SemiBold',
    color: '#17624F',
    marginBottom: 12,
  },
  input: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#ECEDEB',
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: 10,
    fontSize: 14,
    fontFamily: 'PlusJakartaSans_400Regular',
    color: '#202724',
    marginBottom: 12,
  },
  tarjetaVisita: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#ECEDEB',
    borderRadius: 13,
    padding: 16,
    marginBottom: 12,
  },
  nombreVisita: {
    fontSize: 15,
    fontFamily: 'PlusJakartaSans_600SemiBold',
    color: '#202724',
    marginBottom: 4,
  },
  notaVisita: {
    fontSize: 13,
    fontFamily: 'PlusJakartaSans_400Regular',
    color: '#777D79',
    fontStyle: 'italic',
  },
  estado: {
    backgroundColor: '#F5F8F6',
    borderRadius: 16,
    paddingHorizontal: 25,
    paddingVertical: 35,
    alignItems: 'center',
    marginVertical: 10,
  },
  iconoVacio: {
    color: '#17624F',
    fontSize: 38,
    marginBottom: 12,
  },
  tituloVacio: {
    color: '#202724',
    fontSize: 17,
    fontFamily: 'PlusJakartaSans_600SemiBold',
    textAlign: 'center',
    marginBottom: 8,
  },
  descripcionVacio: {
    color: '#777D79',
    fontSize: 13,
    fontFamily: 'PlusJakartaSans_400Regular',
    lineHeight: 20,
    textAlign: 'center',
    marginBottom: 18,
  },
  botonExplorar: {
    backgroundColor: '#17624F',
    borderRadius: 11,
    paddingHorizontal: 23,
    paddingVertical: 14,
    alignItems: 'center',
    marginBottom: 10,
  },
  textoBotonExplorar: {
    color: '#FFFFFF',
    fontSize: 13,
    fontFamily: 'PlusJakartaSans_600SemiBold',
  },
  pie: {
    color: '#A0A5A1',
    fontSize: 12,
    fontFamily: 'PlusJakartaSans_400Regular',
    textAlign: 'center',
    marginTop: 30,
  },
});