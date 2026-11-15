import type { Coordenadas } from '@/tipos/lugar';
import { calcularDistancia } from '@/utilidades/distancia';
import {
  PlusJakartaSans_400Regular,
  PlusJakartaSans_500Medium,
  PlusJakartaSans_600SemiBold,
  PlusJakartaSans_700Bold,
  useFonts,
} from '@expo-google-fonts/plus-jakarta-sans';
import * as ExpoLocation from 'expo-location';
import { router, useFocusEffect } from 'expo-router';
import * as SecureStore from 'expo-secure-store';
import { useCallback, useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  Platform,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  Vibration,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import {
  obtenerCategorias,
  obtenerLugares,
} from '@/servicios/lugares';

import {
  guardarFavorito,
  obtenerFavoritos,
  quitarFavorito,
} from '@/servicios/favoritos';

import type { Categoria } from '@/tipos/categoria';
import type { Lugar } from '@/tipos/lugar';

function obtenerHorarioHoy(horarios: Lugar['horarios']): string {
  if (!horarios?.length) {
    return 'Horario no informado';
  }

  const diaActual = new Date().getDay();

  const horariosHoy = horarios.filter(
    (horario) => horario.dia === diaActual
  );

  if (horariosHoy.length === 0) {
    return 'Sin horario informado para hoy';
  }

  return horariosHoy
    .map((horario) => `${horario.abre} a ${horario.cierra}`)
    .join(' / ');
}

export default function HomeScreen() {
  const [busqueda, setBusqueda] = useState('');
  const [categoria, setCategoria] = useState('Todos');
const [ordenarPorDistancia, setOrdenarPorDistancia] = useState(false);
const [ubicacionUsuario, setUbicacionUsuario] =
  useState<Coordenadas | null>(null);
  
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [lugares, setLugares] = useState<Lugar[]>([]);

  const [cargandoDatos, setCargandoDatos] = useState(true);
  const [errorDatos, setErrorDatos] = useState(false);

  // FAVORITOS
  const [favoritosIds, setFavoritosIds] = useState<string[]>([]);
  const [esVisitante, setEsVisitante] = useState(false);
  const [cargandoFavoritos, setCargandoFavoritos] = useState(true);
  const [procesandoId, setProcesandoId] = useState<string | null>(null);

  // REFERENCIA PARA DESPLAZAR LAS CATEGORÍAS
  const scrollCategorias = useRef<ScrollView>(null);

  // TIPOGRAFÍA
  const [fontsLoaded] = useFonts({
    PlusJakartaSans_400Regular,
    PlusJakartaSans_500Medium,
    PlusJakartaSans_600SemiBold,
    PlusJakartaSans_700Bold,
  });

  // OBTENER UBICACIÓN DEL CELULAR
  async function obtenerUbicacionUsuario() {
    try {
      const { status } =
        await ExpoLocation.requestForegroundPermissionsAsync();

      if (status !== 'granted') {
        Alert.alert(
          'Ubicación',
          'Necesitamos tu permiso para ordenar los lugares por distancia.'
        );
        return;
      }

      const posicion = await ExpoLocation.getCurrentPositionAsync({
        accuracy: ExpoLocation.Accuracy.Balanced,
      });

      setUbicacionUsuario({
        latitud: posicion.coords.latitude,
        longitud: posicion.coords.longitude,
      });

      setOrdenarPorDistancia(true);
    } catch (error) {
      console.error('Error al obtener ubicación:', error);
      Alert.alert(
        'Ubicación',
        'No se pudo obtener la ubicación del celular.'
      );
    }
  }


  // CARGAR LUGARES Y CATEGORÍAS DESDE LA API
  useEffect(() => {
    let activo = true;

    async function cargarDatos() {
      try {
        const [listaLugares, listaCategorias] = await Promise.all([
          obtenerLugares(),
          obtenerCategorias(),
        ]);

        if (!activo) return;

        setLugares(listaLugares);
        setCategorias(listaCategorias);
        setErrorDatos(false);
      } catch (error) {
        console.error('Error al cargar los datos:', error);

        if (activo) {
          setErrorDatos(true);
        }
      } finally {
        if (activo) {
          setCargandoDatos(false);
        }
      }
    }

    cargarDatos();

    return () => {
      activo = false;
      
    };
  }, []);

  // CARGAR FAVORITOS DESDE LA API
  // SE ACTUALIZAN CADA VEZ QUE ENTRAMOS A LA PANTALLA
  useFocusEffect(
    useCallback(() => {
      let activo = true;

      async function cargarFavoritos() {
        setCargandoFavoritos(true);
        const token = Platform.OS === 'web'
          ? window.localStorage.getItem('token')
          : await SecureStore.getItemAsync('token');
        if (!activo) return;
        setEsVisitante(!token);
        if (!token) {
          setFavoritosIds([]);
          setCargandoFavoritos(false);
          return;
        }

        try {
          const listaFavoritos = await obtenerFavoritos();

          if (!activo) return;

          setFavoritosIds(
            listaFavoritos.map((favorito) => favorito.lugarId)
          );
        } catch (error) {
          console.error('Error al cargar favoritos:', error);

          if (activo) {
            setFavoritosIds([]);
          }
        } finally {
          if (activo) {
            setCargandoFavoritos(false);
          }
        }
      }

      cargarFavoritos();

      return () => {
        activo = false;
      };
    }, [])
  );

  // MOSTRAR MENSAJES DE ERROR
  function mostrarError(mensaje: string) {
    if (Platform.OS === 'web') {
      window.alert(mensaje);
    } else {
      Alert.alert('Favoritos', mensaje);
    }
  }

  // GUARDAR O QUITAR UN LUGAR DE FAVORITOS
  async function cambiarFavorito(lugarId: string) {
    if (esVisitante) {
      Alert.alert('Iniciá sesión', 'Para guardar favoritos necesitás una cuenta.', [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Iniciar sesión', onPress: () => router.push('/login') },
      ]);
      return;
    }
    if (procesandoId !== null || cargandoFavoritos) return;

    const yaEsFavorito = favoritosIds.includes(lugarId);

    setProcesandoId(lugarId);

    try {
      if (yaEsFavorito) {
        // QUITAR DE FAVORITOS
        await quitarFavorito(lugarId);

        setFavoritosIds((anteriores) =>
          anteriores.filter((id) => id !== lugarId)
        );
      } else {
        // GUARDAR EN FAVORITOS
        await guardarFavorito(lugarId);

        setFavoritosIds((anteriores) =>
          anteriores.includes(lugarId)
            ? anteriores
            : [...anteriores, lugarId]
        );
      }

      // Confirmación táctil solo después de guardar o quitar correctamente.
      // Vibration viene incluido en React Native y funciona en la APK actual.
      if (Platform.OS !== 'web') {
        Vibration.vibrate(35);
      }
    } catch (error) {
      console.error('Error al modificar favorito:', error);

      mostrarError(
        'No pudimos actualizar tus favoritos. Intentá nuevamente.'
      );
    } finally {
      setProcesandoId(null);
    }
  }

  // CERRAR SESIÓN
  async function cerrarSesion() {
    try {
      if (Platform.OS === 'web') {
        window.localStorage.removeItem('token');
      } else {
        await SecureStore.deleteItemAsync('token');
      }

      router.replace('/login');
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
    }
  }

  // FILTRAR LUGARES POR NOMBRE Y CATEGORÍA

  // FILTRAR POR NOMBRE Y CATEGORÍA
  const lugaresFiltrados = lugares.filter((lugar) => {
    const coincideNombre = lugar.nombre
      .toLowerCase()
      .includes(busqueda.trim().toLowerCase());

    const coincideCategoria =
      categoria === 'Todos' ||
      lugar.categoriaId === categoria;

    return coincideNombre && coincideCategoria;
  });

  // ORDENAR POR DISTANCIA CUANDO HAYA UBICACIÓN
  const lugaresOrdenados =
    ordenarPorDistancia && ubicacionUsuario
      ? [...lugaresFiltrados].sort((a, b) => {
          const distanciaA = calcularDistancia(
            ubicacionUsuario,
            a.coordenadas
          );

          const distanciaB = calcularDistancia(
            ubicacionUsuario,
            b.coordenadas
          );

          return distanciaA - distanciaB;
        })
      : lugaresFiltrados;


  // MOVER CATEGORÍAS A LA IZQUIERDA
  function moverIzquierda() {
    scrollCategorias.current?.scrollTo({
      x: 0,
      animated: true,
    });
  }

  // MOVER CATEGORÍAS A LA DERECHA
  function moverDerecha() {
    scrollCategorias.current?.scrollToEnd({
      animated: true,
    });
  }

  // ESPERAR A QUE CARGUEN LAS FUENTES
  if (!fontsLoaded) {
    return (
      <View style={styles.cargando}>
        <ActivityIndicator
          size="large"
          color="#17624F"
        />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />

      <ScrollView
        contentContainerStyle={styles.contenido}
        showsVerticalScrollIndicator={false}
      >
        {/* ENCABEZADO */}
        <View style={styles.encabezado}>
          <View style={styles.filaSuperior}>

            {/* VOLVER A LA PANTALLA DE BIENVENIDA */}
            <TouchableOpacity
              onPress={() =>
                router.replace('/principal/bienvenida')
              }
              accessibilityRole="button"
              accessibilityLabel="Volver a la bienvenida"
            >
              <Text style={styles.marca}>
                ← Inicio
              </Text>
            </TouchableOpacity>

            {/* CERRAR SESIÓN */}
            <TouchableOpacity onPress={cerrarSesion}>
              <Text style={styles.salir}>
                Salir
              </Text>
            </TouchableOpacity>
          </View>

          <Text style={styles.titulo}>
            Descubrí Colón.
          </Text>

          <Text style={styles.descripcion}>
            Encontrá lugares para conocer, visitar y disfrutar.
          </Text>
        </View>

        {/* BOTÓN EXPLORAR MAPA */}
        <TouchableOpacity
          style={styles.botonMapa}
          activeOpacity={0.8}
          onPress={() => router.push('/principal/mapa')}
          accessibilityRole="button"
          accessibilityLabel="Explorar mapa de Colón"
        >
          <Text style={styles.textoBotonMapa}>
            📍 Explorar mapa
          </Text>
        </TouchableOpacity>

        {/* NUEVO: BOTÓN MI RECORRIDO */}
        <TouchableOpacity
          style={styles.botonMapa}
          activeOpacity={0.8}
          onPress={() => router.push('/principal/recorrido')}
          accessibilityRole="button"
          accessibilityLabel="Ver mi recorrido de visitas"
        >
          <Text style={styles.textoBotonMapa}>
             Mi Recorrido (QR y Visitas)
          </Text>
        </TouchableOpacity>

        {/* BUSCADOR */}
        <View style={styles.contenedorBuscador}>
          <Text style={styles.iconoBuscar}>
            ⌕
          </Text>

          <TextInput
            style={styles.buscador}
            placeholder="¿Qué lugar estás buscando?"
            placeholderTextColor="#929292"
            value={busqueda}
            onChangeText={setBusqueda}
          />

          {busqueda.length > 0 && (
            <TouchableOpacity
              onPress={() => setBusqueda('')}
            >
              <Text style={styles.limpiar}>
                ×
              </Text>
            </TouchableOpacity>
          )}
        </View>

        {/* CATEGORÍAS */}
        <Text style={styles.tituloSeccion}>
          Explorá por categoría
        </Text>

        <View style={styles.contenedorCategorias}>

          {/* FLECHA IZQUIERDA */}
          <TouchableOpacity
            style={styles.flechaCategoria}
            onPress={moverIzquierda}
            accessibilityLabel="Ver primeras categorías"
          >
            <Text style={styles.textoFlecha}>
              ‹
            </Text>
          </TouchableOpacity>

          {/* CATEGORÍAS DESLIZABLES */}
          <ScrollView
            ref={scrollCategorias}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.listaCategorias}
            style={styles.scrollCategorias}
          >
            {/* OPCIÓN TODOS */}
            <TouchableOpacity
              style={[
                styles.filtro,
                categoria === 'Todos' && styles.filtroActivo,
              ]}
              onPress={() => setCategoria('Todos')}
            >
              <Text
                style={[
                  styles.textoFiltro,
                  categoria === 'Todos' &&
                    styles.textoFiltroActivo,
                ]}
              >
                Todos
              </Text>
            </TouchableOpacity>

            {/* CATEGORÍAS DESDE LA API */}
            {categorias.map((item) => (
              <TouchableOpacity
                key={item.id}
                style={[
                  styles.filtro,
                  categoria === item.id &&
                    styles.filtroActivo,
                ]}
                onPress={() => setCategoria(item.id)}
              >
                <Text
                  style={[
                    styles.textoFiltro,
                    categoria === item.id &&
                      styles.textoFiltroActivo,
                  ]}
                >
                  {item.nombre}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          {/* FLECHA DERECHA */}
          <TouchableOpacity
            style={styles.flechaCategoria}
            onPress={moverDerecha}
            accessibilityLabel="Ver últimas categorías"
          >
            <Text style={styles.textoFlecha}>
              ›
            </Text>
          </TouchableOpacity>
        </View>
{/* BOTÓN ORDENAR POR DISTANCIA */}
<TouchableOpacity
  onPress={obtenerUbicacionUsuario}
  style={styles.botonMapa}
>
  <Text style={styles.textoBotonMapa}>
    📍 Ordenar por distancia
  </Text>
</TouchableOpacity>

{/* TÍTULO DEL LISTADO */}
        {/* TÍTULO DEL LISTADO */}
        <View style={styles.encabezadoSeccion}>
          <Text style={styles.tituloSeccion}>
            Lugares para descubrir
          </Text>

          <Text style={styles.cantidad}>
            {cargandoDatos || errorDatos
              ? '—'
              : lugaresFiltrados.length}{' '}
            resultados
          </Text>
        </View>

        {/* RESULTADOS */}
        {cargandoDatos ? (
          <View style={styles.sinResultados}>
            <ActivityIndicator
              size="large"
              color="#17624F"
            />

            <Text style={styles.textoSinResultados}>
              Cargando lugares...
            </Text>
          </View>
        ) : errorDatos ? (
          <View style={styles.sinResultados}>
            <Text style={styles.textoSinResultados}>
              No pudimos cargar los lugares.
              Intentá nuevamente más tarde.
            </Text>
          </View>
        ) : lugaresFiltrados.length === 0 ? (
          <View style={styles.sinResultados}>
            <Text style={styles.textoSinResultados}>
              No encontramos lugares con esos filtros.
            </Text>

            <TouchableOpacity
              onPress={() => {
                setBusqueda('');
                setCategoria('Todos');
              }}
            >
              <Text style={styles.reiniciar}>
                Limpiar filtros
              </Text>
            </TouchableOpacity>
          </View>
        ) : (
         lugaresOrdenados.map((lugar) => {
            const esFavorito = favoritosIds.includes(lugar.id);
            const estaProcesando = procesandoId === lugar.id;

            return (
              <View
                key={lugar.id}
                style={styles.tarjeta}
              >
                {/* CONTENIDO DE LA TARJETA */}
                <TouchableOpacity
                  style={styles.contenidoTarjeta}
                  activeOpacity={0.8}
                  onPress={() =>
                    router.push({
                      pathname: '/principal/[id]',
                      params: {
                        id: lugar.id,
                      },
                    })
                  }
                >
                  {/* FOTOGRAFÍA DEL LUGAR */}
                  <View style={styles.imagenPlaceholder}>
                    {lugar.imagenes?.[0] ? (
                      <Image
                        source={{ uri: lugar.imagenes[0] }}
                        style={styles.fotoLugar}
                        resizeMode="cover"
                      />
                    ) : (
                      <Text style={styles.textoImagen}>
                        SIN FOTO
                      </Text>
                    )}
                  </View>

                  {/* INFORMACIÓN DEL LUGAR */}
                  <View style={styles.info}>

                    {/* CATEGORÍA */}
                    <Text
                      style={styles.etiqueta}
                      numberOfLines={1}
                      ellipsizeMode="tail"
                    >
                      {categorias.find(
                        (item) =>
                          item.id === lugar.categoriaId
                      )?.nombre ?? 'Sin categoría'}
                    </Text>

                    {/* NOMBRE */}
                    <Text
                      style={styles.nombreLugar}
                      numberOfLines={2}
                      ellipsizeMode="tail"
                    >
                      {lugar.nombre}
                    </Text>

                    {/* DESCRIPCIÓN */}
                    <Text
                      style={styles.descripcionLugar}
                      numberOfLines={2}
                      ellipsizeMode="tail"
                    >
                      {lugar.descripcionCorta}
                    </Text>
                    <Text
  style={styles.horarioTarjeta}
  numberOfLines={1}
>
  ◷ Hoy: {obtenerHorarioHoy(lugar.horarios)}
</Text>
                  </View>
                </TouchableOpacity>

                {/* CORAZÓN DE FAVORITOS */}
                <TouchableOpacity
                  style={styles.botonFavorito}
                  activeOpacity={0.7}
                  disabled={
                    cargandoFavoritos ||
                    procesandoId !== null
                  }
                  onPress={() =>
                    cambiarFavorito(lugar.id)
                  }
                  accessibilityRole="button"
                  accessibilityLabel={
                    esFavorito
                      ? `Quitar ${lugar.nombre} de favoritos`
                      : `Guardar ${lugar.nombre} en favoritos`
                  }
                >
                  {estaProcesando ? (
                    <ActivityIndicator
                      size="small"
                      color="#C45159"
                    />
                  ) : cargandoFavoritos ? (
                    <Text style={styles.corazonVacio}>
                      ♡
                    </Text>
                  ) : (
                    <Text
                      style={
                        esFavorito
                          ? styles.corazonLleno
                          : styles.corazonVacio
                      }
                    >
                      {esFavorito ? '♥' : '♡'}
                    </Text>
                  )}
                </TouchableOpacity>
              </View>
            );
          })
        )}

        {/* PIE DE PÁGINA */}
        <Text style={styles.pie}>
          Una guía para descubrir lo mejor de Colón.
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

// ESTILOS
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },

  cargando: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
  },

  contenido: {
    paddingHorizontal: 22,
    paddingTop: 22,
    paddingBottom: 80,
  },

  encabezado: {
    marginBottom: 28,
  },

  filaSuperior: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 34,
  },

  marca: {
    color: '#17624F',
    fontSize: 12,
    fontFamily: 'PlusJakartaSans_700Bold',
    letterSpacing: 1,
  },

  salir: {
    color: '#777777',
    fontSize: 13,
    fontFamily: 'PlusJakartaSans_500Medium',
  },

  titulo: {
    color: '#202724',
    fontSize: 33,
    fontFamily: 'PlusJakartaSans_500Medium',
    letterSpacing: -0.8,
    marginBottom: 10,
  },

  descripcion: {
    color: '#777D79',
    fontSize: 15,
    fontFamily: 'PlusJakartaSans_400Regular',
    lineHeight: 23,
  },

  // BOTÓN PARA ABRIR EL MAPA
  botonMapa: {
    backgroundColor: '#17624F',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },

  textoBotonMapa: {
    color: '#FFFFFF',
    fontSize: 15,
    fontFamily: 'PlusJakartaSans_600SemiBold',
  },

  contenedorBuscador: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F6F4',
    borderRadius: 12,
    paddingHorizontal: 16,
    height: 54,
    marginBottom: 35,
  },

  iconoBuscar: {
    color: '#515D56',
    fontSize: 28,
    marginRight: 10,
  },

  buscador: {
    flex: 1,
    color: '#202724',
    fontSize: 14,
    fontFamily: 'PlusJakartaSans_400Regular',
  },

  limpiar: {
    color: '#777777',
    fontSize: 24,
    paddingHorizontal: 5,
  },

  tituloSeccion: {
    color: '#202724',
    fontSize: 19,
    fontFamily: 'PlusJakartaSans_600SemiBold',
    marginBottom: 17,
  },

  contenedorCategorias: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 30,
  },

  scrollCategorias: {
    flex: 1,
    minWidth: 0,
  },

  listaCategorias: {
    gap: 9,
    paddingBottom: 0,
    paddingHorizontal: 3,
  },

  flechaCategoria: {
    width: 30,
    height: 42,
    alignItems: 'center',
    justifyContent: 'center',
  },

  textoFlecha: {
    fontSize: 30,
    color: '#17624F',
  },

  filtro: {
    backgroundColor: '#F5F6F4',
    paddingHorizontal: 17,
    paddingVertical: 11,
    borderRadius: 25,
    alignSelf: 'flex-start',
  },

  filtroActivo: {
    backgroundColor: '#17624F',
  },

  textoFiltro: {
    color: '#555E58',
    fontSize: 13,
    fontFamily: 'PlusJakartaSans_500Medium',
  },

  textoFiltroActivo: {
    color: '#FFFFFF',
    fontFamily: 'PlusJakartaSans_600SemiBold',
  },

  encabezadoSeccion: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
    marginBottom: 5,
  },

  cantidad: {
    color: '#888888',
    fontSize: 12,
    fontFamily: 'PlusJakartaSans_400Regular',
  },

  // TARJETAS CON ALTURA UNIFORME
  tarjeta: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#ECEDEB',
    overflow: 'hidden',
    marginBottom: 14,
    height: 145,
    alignItems: 'center',
  },

  // CONTENIDO PRINCIPAL DE LA TARJETA
  contenidoTarjeta: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    minWidth: 0,
    height: 145,
  },

  imagenPlaceholder: {
    width: 110,
    height: 125,
    backgroundColor: '#E9EDE9',
    alignItems: 'center',
    justifyContent: 'center',
  },

  fotoLugar: {
    width: 110,
    height: 125,
  },

  textoImagen: {
    color: '#A0AAA2',
    fontSize: 11,
    fontFamily: 'PlusJakartaSans_600SemiBold',
    letterSpacing: 2,
  },

  info: {
    flex: 1,
    minWidth: 0,
    paddingHorizontal: 13,
    paddingVertical: 10,
    justifyContent: 'center',
  },

  etiqueta: {
    color: '#17624F',
    fontSize: 10,
    fontFamily: 'PlusJakartaSans_700Bold',
    letterSpacing: 0.4,
    marginBottom: 5,
  },

  nombreLugar: {
    color: '#202724',
    fontSize: 15,
    fontFamily: 'PlusJakartaSans_500Medium',
    lineHeight: 20,
    marginBottom: 5,
  },

  descripcionLugar: {
    color: '#777D79',
    fontSize: 12,
    fontFamily: 'PlusJakartaSans_400Regular',
    lineHeight: 17,
  },
horarioTarjeta: {
  color: '#17624F',
  fontSize: 11,
  fontFamily: 'PlusJakartaSans_500Medium',
  marginTop: 5,
},
  // BOTÓN DEL CORAZÓN
  botonFavorito: {
    width: 42,
    height: 60,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 3,
  },

  corazonVacio: {
    color: '#C45159',
    fontSize: 29,
  },

  corazonLleno: {
    color: '#C45159',
    fontSize: 25,
  },

  sinResultados: {
    alignItems: 'center',
    paddingVertical: 35,
  },

  textoSinResultados: {
    color: '#777D79',
    fontSize: 14,
    fontFamily: 'PlusJakartaSans_400Regular',
    textAlign: 'center',
    marginBottom: 15,
  },

  reiniciar: {
    color: '#17624F',
    fontSize: 14,
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
