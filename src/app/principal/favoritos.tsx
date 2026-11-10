import {
    PlusJakartaSans_400Regular,
    PlusJakartaSans_500Medium,
    PlusJakartaSans_600SemiBold,
    PlusJakartaSans_700Bold,
    useFonts,
} from '@expo-google-fonts/plus-jakarta-sans';

import { router, useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';

import {
    ActivityIndicator,
    Image,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

import { SafeAreaView } from 'react-native-safe-area-context';

import {
    obtenerFavoritos,
    quitarFavorito,
} from '@/servicios/favoritos';

import { obtenerLugares } from '@/servicios/lugares';

import type { Lugar } from '@/tipos/lugares';

export default function FavoritosScreen() {
  const [fontsLoaded] = useFonts({
    PlusJakartaSans_400Regular,
    PlusJakartaSans_500Medium,
    PlusJakartaSans_600SemiBold,
    PlusJakartaSans_700Bold,
  });

  const [lugaresFavoritos, setLugaresFavoritos] =
    useState<Lugar[]>([]);

  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');
  const [quitandoId, setQuitandoId] = useState<string | null>(
    null
  );

  const cargarFavoritos = useCallback(async () => {
    setCargando(true);
    setError('');

    try {
      const [favoritos, lugares] = await Promise.all([
        obtenerFavoritos(),
        obtenerLugares(),
      ]);

      const mapaLugares = new Map(
        lugares.map((lugar) => [lugar.id, lugar])
      );

      const lugaresGuardados = favoritos
        .map((favorito) => mapaLugares.get(favorito.lugarId))
        .filter((lugar): lugar is Lugar => lugar !== undefined);

      setLugaresFavoritos(lugaresGuardados);
    } catch (errorCarga) {
      console.error('Error al cargar favoritos:', errorCarga);

      setError(
        'No pudimos cargar tus favoritos. Revisá tu conexión e intentá nuevamente.'
      );
    } finally {
      setCargando(false);
    }
  }, []);

  // ACTUALIZAR CADA VEZ QUE ENTRAMOS A LA PANTALLA
  useFocusEffect(
    useCallback(() => {
      cargarFavoritos();
    }, [cargarFavoritos])
  );

  // ELIMINAR UN FAVORITO
  async function eliminarFavorito(lugarId: string) {
    if (quitandoId) return;

    setQuitandoId(lugarId);

    try {
      await quitarFavorito(lugarId);

      setLugaresFavoritos((anteriores) =>
        anteriores.filter((lugar) => lugar.id !== lugarId)
      );
    } catch (errorEliminar) {
      console.error(
        'Error al eliminar favorito:',
        errorEliminar
      );

      setError('No se pudo quitar el favorito. Intentá nuevamente.');
    } finally {
      setQuitandoId(null);
    }
  }

  if (!fontsLoaded) {
    return (
      <View style={styles.cargandoPantalla}>
        <ActivityIndicator size="large" color="#17624F" />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.contenido}
        showsVerticalScrollIndicator={false}
      >
        {/* NAVEGACIÓN */}
        <View style={styles.navegacion}>
          <TouchableOpacity
            onPress={() =>
              router.replace('/principal/bienvenida')
            }
            accessibilityRole="button"
            accessibilityLabel="Volver al inicio"
          >
            <Text style={styles.volver}>← Volver</Text>
          </TouchableOpacity>

          <Text style={styles.marca}>MI CIUDAD</Text>
        </View>

        {/* ENCABEZADO */}
        <Text style={styles.titulo}>Mis favoritos</Text>

        <Text style={styles.subtitulo}>
          Guardá tus lugares preferidos para visitarlos
          cuando quieras.
        </Text>

        {/* CANTIDAD */}
        {!cargando && !error && (
          <Text style={styles.cantidad}>
            {lugaresFavoritos.length}{' '}
            {lugaresFavoritos.length === 1
              ? 'lugar guardado'
              : 'lugares guardados'}
          </Text>
        )}

        {/* CARGANDO */}
        {cargando ? (
          <View style={styles.estado}>
            <ActivityIndicator
              size="large"
              color="#17624F"
            />

            <Text style={styles.textoEstado}>
              Cargando favoritos...
            </Text>
          </View>
        ) : error ? (
          <View style={styles.estado}>
            <Text style={styles.iconoVacio}>⚠️</Text>

            <Text style={styles.tituloVacio}>
              No pudimos cargar tus favoritos
            </Text>

            <Text style={styles.descripcionVacio}>
              {error}
            </Text>

            <TouchableOpacity
              style={styles.botonExplorar}
              onPress={cargarFavoritos}
            >
              <Text style={styles.textoBotonExplorar}>
                Reintentar
              </Text>
            </TouchableOpacity>
          </View>
        ) : lugaresFavoritos.length === 0 ? (
          /* SIN FAVORITOS */
          <View style={styles.estado}>
            <Text style={styles.iconoVacio}>♡</Text>

            <Text style={styles.tituloVacio}>
              Todavía no tenés favoritos
            </Text>

            <Text style={styles.descripcionVacio}>
              Explorá los lugares de Colón y guardá
              los que más te gusten.
            </Text>

            <TouchableOpacity
              style={styles.botonExplorar}
              onPress={() => router.push('/principal')}
            >
              <Text style={styles.textoBotonExplorar}>
                Explorar lugares
              </Text>
            </TouchableOpacity>
          </View>
        ) : (
          /* LISTADO DE FAVORITOS */
          lugaresFavoritos.map((lugar) => (
            <View key={lugar.id} style={styles.tarjeta}>
              <TouchableOpacity
                style={styles.contenidoTarjeta}
                activeOpacity={0.8}
                onPress={() =>
                  router.push({
                    pathname: '/principal/[id]',
                    params: { id: lugar.id },
                  })
                }
              >
                <View style={styles.contenedorImagen}>
                  {lugar.imagenes?.[0] ? (
                    <Image
                      source={{ uri: lugar.imagenes[0] }}
                      style={styles.imagen}
                      resizeMode="cover"
                    />
                  ) : (
                    <Text style={styles.sinFoto}>
                      SIN FOTO
                    </Text>
                  )}
                </View>

                <View style={styles.info}>
                  <Text
                    style={styles.nombreLugar}
                    numberOfLines={2}
                  >
                    {lugar.nombre}
                  </Text>

                  <Text
                    style={styles.descripcionLugar}
                    numberOfLines={2}
                  >
                    {lugar.descripcionCorta}
                  </Text>

                  <Text style={styles.verDetalle}>
                    Ver detalle ›
                  </Text>
                </View>
              </TouchableOpacity>

              {/* QUITAR DE FAVORITOS */}
              <TouchableOpacity
                style={styles.botonCorazon}
                onPress={() => eliminarFavorito(lugar.id)}
                disabled={quitandoId !== null}
                accessibilityRole="button"
                accessibilityLabel={`Quitar ${lugar.nombre} de favoritos`}
              >
                {quitandoId === lugar.id ? (
                  <ActivityIndicator
                    size="small"
                    color="#C45159"
                  />
                ) : (
                  <Text style={styles.corazon}>♥</Text>
                )}
              </TouchableOpacity>
            </View>
          ))
        )}

        <Text style={styles.pie}>
          Tus rincones favoritos de Colón, en un solo lugar.
        </Text>
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
    marginBottom: 30,
  },

  cantidad: {
    color: '#17624F',
    fontSize: 13,
    fontFamily: 'PlusJakartaSans_600SemiBold',
    marginBottom: 18,
  },

  tarjeta: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#ECEDEB',
    borderRadius: 13,
    marginBottom: 14,
    flexDirection: 'row',
    alignItems: 'center',
    overflow: 'hidden',
  },

  contenidoTarjeta: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    minWidth: 0,
  },

  contenedorImagen: {
    width: 105,
    height: 120,
    backgroundColor: '#E9EDE9',
    justifyContent: 'center',
    alignItems: 'center',
  },

  imagen: {
    width: 105,
    height: 120,
  },

  sinFoto: {
    color: '#A0AAA2',
    fontSize: 10,
    letterSpacing: 1,
  },

  info: {
    flex: 1,
    padding: 12,
    paddingRight: 4,
  },

  nombreLugar: {
    color: '#202724',
    fontSize: 14,
    fontFamily: 'PlusJakartaSans_600SemiBold',
    marginBottom: 7,
  },

  descripcionLugar: {
    color: '#777D79',
    fontSize: 11,
    fontFamily: 'PlusJakartaSans_400Regular',
    lineHeight: 17,
    marginBottom: 8,
  },

  verDetalle: {
    color: '#17624F',
    fontSize: 11,
    fontFamily: 'PlusJakartaSans_600SemiBold',
  },

  botonCorazon: {
    paddingHorizontal: 14,
    paddingVertical: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },

  corazon: {
    color: '#C45159',
    fontSize: 25,
  },

  estado: {
    backgroundColor: '#F5F8F6',
    borderRadius: 16,
    paddingHorizontal: 25,
    paddingVertical: 42,
    alignItems: 'center',
  },

  textoEstado: {
    color: '#777D79',
    fontSize: 13,
    fontFamily: 'PlusJakartaSans_400Regular',
    marginTop: 15,
  },

  iconoVacio: {
    color: '#17624F',
    fontSize: 42,
    marginBottom: 16,
  },

  tituloVacio: {
    color: '#202724',
    fontSize: 18,
    fontFamily: 'PlusJakartaSans_600SemiBold',
    textAlign: 'center',
    marginBottom: 10,
  },

  descripcionVacio: {
    color: '#777D79',
    fontSize: 13,
    fontFamily: 'PlusJakartaSans_400Regular',
    lineHeight: 21,
    textAlign: 'center',
    marginBottom: 22,
  },

  botonExplorar: {
    backgroundColor: '#17624F',
    borderRadius: 11,
    paddingHorizontal: 23,
    paddingVertical: 14,
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
    marginTop: 35,
  },
});
