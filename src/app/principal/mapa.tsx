import * as ExpoLocation from 'expo-location';
import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import MapView, { Callout, Marker } from 'react-native-maps';
import { SafeAreaView } from 'react-native-safe-area-context';

import { obtenerCategorias, obtenerLugares } from '../../servicios/lugares';
import type { Categoria } from '../../tipos/categoria';
import type { Lugar } from '../../tipos/lugar';

export default function Mapa() {
  const [lugares, setLugares] = useState<Lugar[]>([]);
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [categoriaSeleccionada, setCategoriaSeleccionada] = useState<string | null>(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(false);
  const [permisoUbicacion, setPermisoUbicacion] = useState(false);

  useEffect(() => {
    let activo = true;

    async function cargarDatos() {
      try {
        const [resultadoLugares, resultadoCategorias] = await Promise.all([
          obtenerLugares(),
          obtenerCategorias(),
        ]);

        if (activo) {
          setLugares(resultadoLugares);
          setCategorias(resultadoCategorias);
        }
      } catch (errorCarga) {
        console.error('Error al cargar lugares y categorías del mapa:', errorCarga);
        if (activo) setError(true);
      } finally {
        if (activo) setCargando(false);
      }
    }

    cargarDatos();
    return () => { activo = false; };
  }, []);

  useEffect(() => {
    let activo = true;

    async function solicitarUbicacion() {
      try {
        const permiso = await ExpoLocation.requestForegroundPermissionsAsync();
        if (activo) setPermisoUbicacion(permiso.status === 'granted');
      } catch (errorUbicacion) {
        console.error('Error al solicitar ubicación:', errorUbicacion);
      }
    }

    solicitarUbicacion();
    return () => { activo = false; };
  }, []);

  const lugaresConCoordenadas = lugares.filter((lugar) => {
    if (categoriaSeleccionada !== null && lugar.categoriaId !== categoriaSeleccionada) {
      return false;
    }

    const latitud = Number(lugar.coordenadas?.latitud);
    const longitud = Number(lugar.coordenadas?.longitud);
    return (
      Number.isFinite(latitud) &&
      Number.isFinite(longitud) &&
      latitud >= -90 && latitud <= 90 &&
      longitud >= -180 && longitud <= 180
    );
  });

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.contenido}>
        <View style={styles.navegacion}>
          <TouchableOpacity
            onPress={() => router.replace('/principal')}
            accessibilityRole="button"
            accessibilityLabel="Volver a lugares para visitar"
          >
            <Text style={styles.volver}>← Volver</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => router.replace('/principal/bienvenida')}
            accessibilityRole="button"
            accessibilityLabel="Volver al inicio"
          >
            <Text style={styles.inicio}>Inicio</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.titulo}>Explorá Colón</Text>
        <Text style={styles.subtitulo}>Descubrí los lugares turísticos cerca tuyo.</Text>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.filtros}
          contentContainerStyle={styles.contenidoFiltros}
        >
          <TouchableOpacity
            onPress={() => setCategoriaSeleccionada(null)}
            style={[styles.botonFiltro, categoriaSeleccionada === null && styles.botonFiltroActivo]}
          >
            <Text style={[styles.textoFiltro, categoriaSeleccionada === null && styles.textoFiltroActivo]}>
              Todos
            </Text>
          </TouchableOpacity>
          {categorias.map((categoria) => (
            <TouchableOpacity
              key={categoria.id}
              onPress={() => setCategoriaSeleccionada(categoria.id)}
              style={[styles.botonFiltro, categoriaSeleccionada === categoria.id && styles.botonFiltroActivo]}
            >
              <Text style={[styles.textoFiltro, categoriaSeleccionada === categoria.id && styles.textoFiltroActivo]}>
                {categoria.nombre}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        <View style={styles.contenedorMapa}>
          <MapView
            style={StyleSheet.absoluteFill}
            mapType="standard"
            showsUserLocation={permisoUbicacion}
            showsMyLocationButton={permisoUbicacion}
            initialRegion={{
              latitude: -32.2231,
              longitude: -58.1443,
              latitudeDelta: 0.08,
              longitudeDelta: 0.08,
            }}
          >
            {lugaresConCoordenadas.map((lugar) => (
              <Marker
                key={lugar.id}
                coordinate={{
                  latitude: Number(lugar.coordenadas!.latitud),
                  longitude: Number(lugar.coordenadas!.longitud),
                }}
                title={lugar.nombre}
                pinColor="#17624F"
              >
                <Callout
                  onPress={() => router.push({
                    pathname: '/principal/[id]',
                    params: { id: String(lugar.id) },
                  })}
                >
                  <View style={styles.contenidoMarcador}>
                    <Text style={styles.nombreMarcador}>{lugar.nombre}</Text>
                    <Text style={styles.verDetalle}>Tocar para ver detalles</Text>
                  </View>
                </Callout>
              </Marker>
            ))}
          </MapView>

          {cargando && (
            <View style={styles.avisoCarga} pointerEvents="none">
              <ActivityIndicator size="small" color="#17624F" />
              <Text style={styles.textoAviso}>Cargando lugares...</Text>
            </View>
          )}
          {error && (
            <View style={styles.avisoError} pointerEvents="none">
              <Text style={styles.textoError}>No se pudieron cargar los lugares.</Text>
            </View>
          )}
        </View>

        {!cargando && !error && (
          <Text style={styles.contador}>{lugaresConCoordenadas.length} lugares en el mapa</Text>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFFFF' },
  contenido: { flex: 1, padding: 22 },
  navegacion: {
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'center', marginBottom: 28,
  },
  volver: { color: '#17624F', fontSize: 14, fontFamily: 'PlusJakartaSans_500Medium' },
  inicio: { color: '#17624F', fontSize: 14, fontFamily: 'PlusJakartaSans_600SemiBold' },
  titulo: {
    fontSize: 29, color: '#202724',
    fontFamily: 'PlusJakartaSans_600SemiBold', marginBottom: 10,
  },
  subtitulo: {
    fontSize: 14, color: '#777D79', fontFamily: 'PlusJakartaSans_400Regular',
    lineHeight: 23, marginBottom: 15,
  },
  filtros: { flexGrow: 0, marginBottom: 15 },
  contenidoFiltros: { gap: 8, alignItems: 'center' },
  botonFiltro: {
    backgroundColor: '#F5F6F4', paddingHorizontal: 14,
    paddingVertical: 10, borderRadius: 20,
  },
  botonFiltroActivo: { backgroundColor: '#17624F' },
  textoFiltro: { color: '#626B65', fontSize: 12, fontWeight: '600' },
  textoFiltroActivo: { color: '#FFFFFF' },
  contenedorMapa: { flex: 1, minHeight: 300, backgroundColor: '#E9F1EC' },
  contenidoMarcador: { minWidth: 150, maxWidth: 220, padding: 8 },
  nombreMarcador: { color: '#202724', fontSize: 15, fontWeight: '600', marginBottom: 6 },
  verDetalle: { color: '#17624F', fontSize: 13 },
  avisoCarga: {
    position: 'absolute', top: 12, alignSelf: 'center',
    backgroundColor: '#FFFFFF', paddingHorizontal: 14,
    paddingVertical: 10, borderRadius: 10,
    flexDirection: 'row', alignItems: 'center', gap: 8,
  },
  textoAviso: { color: '#17624F', fontSize: 13 },
  avisoError: {
    position: 'absolute', top: 12, alignSelf: 'center',
    backgroundColor: '#FFFFFF', padding: 12, borderRadius: 10,
  },
  textoError: { color: '#B42318', fontSize: 13 },
  contador: {
    marginTop: 12, color: '#777D79', fontSize: 13,
    fontFamily: 'PlusJakartaSans_400Regular',
  },
});
