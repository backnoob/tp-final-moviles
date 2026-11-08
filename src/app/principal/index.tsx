
import { router } from 'expo-router';
import * as SecureStore from 'expo-secure-store';
import { useEffect, useRef, useState } from 'react';

import {
  PlusJakartaSans_400Regular,
  PlusJakartaSans_500Medium,
  PlusJakartaSans_600SemiBold,
  PlusJakartaSans_700Bold,
  useFonts,
} from '@expo-google-fonts/plus-jakarta-sans';

import {
  ActivityIndicator,
  Image,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

import { SafeAreaView } from 'react-native-safe-area-context';

import {
  obtenerCategorias,
  obtenerLugares,
} from '../../servicios/lugares';

import type { Categoria } from '../../tipos/categoria';
import type { Lugar } from '../../tipos/lugar';

export default function HomeScreen() {
  const [busqueda, setBusqueda] = useState('');
  const [categoria, setCategoria] = useState('Todos');

  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [lugares, setLugares] = useState<Lugar[]>([]);

  const [cargandoDatos, setCargandoDatos] = useState(true);
  const [errorDatos, setErrorDatos] = useState(false);

  // Referencia para mover las categorías con las flechas
  const scrollCategorias = useRef<ScrollView>(null);

  // TIPOGRAFÍA
  const [fontsLoaded] = useFonts({
    PlusJakartaSans_400Regular,
    PlusJakartaSans_500Medium,
    PlusJakartaSans_600SemiBold,
    PlusJakartaSans_700Bold,
  });

  // CARGAR LUGARES Y CATEGORÍAS
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

  // CERRAR SESIÓN
  async function cerrarSesion() {
    try {
      await SecureStore.deleteItemAsync('token');
      router.replace('/login');
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
    }
  }

  // FILTRAR LUGARES
  const lugaresFiltrados = lugares.filter((lugar) => {
    const coincideNombre = lugar.nombre
      .toLowerCase()
      .includes(busqueda.trim().toLowerCase());

    const coincideCategoria =
      categoria === 'Todos' ||
      lugar.categoriaId === categoria;

    return coincideNombre && coincideCategoria;
  });

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

  // CARGAR FUENTES
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
            <Text style={styles.marca}>
              MI CIUDAD
            </Text>

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

            {/* CATEGORÍAS DEL SERVICIO */}
            {categorias.map((item) => (
              <TouchableOpacity
                key={item.id}
                style={[
                  styles.filtro,
                  categoria === item.nombre &&
                    styles.filtroActivo,
                ]}
                onPress={() => setCategoria(item.nombre)}
              >
                <Text
                  style={[
                    styles.textoFiltro,
                    categoria === item.nombre &&
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
          lugaresFiltrados.map((lugar) => (
            <TouchableOpacity
              key={lugar.id}
              style={styles.tarjeta}
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
                {lugar.id === 'lug-001' ? (
                  <Image
                    source={require('../../../assets/images/lugares/termas-colon.jpg')}
                    style={styles.fotoLugar}
                    resizeMode="cover"
                  />
                ) : lugar.id === 'lug-002' ? (
                  <Image
                    source={require('../../../assets/images/lugares/molino-forclaz.jpg')}
                    style={styles.fotoLugar}
                    resizeMode="cover"
                  />
                ) : lugar.id === 'lug-003' ? (
                  <Image
                    source={require('../../../assets/images/lugares/el-palmar.jpg')}
                    style={styles.fotoLugar}
                    resizeMode="cover"
                  />
                ) : (
                  <Text style={styles.textoImagen}>
                    FOTO
                  </Text>
                )}
              </View>

              {/* DATOS DEL LUGAR */}
              <View style={styles.info}>
                <Text style={styles.etiqueta}>
                  {lugar.categoriaId.toUpperCase()}
                </Text>

                <Text style={styles.nombreLugar}>
                  {lugar.nombre}
                </Text>

                <Text style={styles.descripcionLugar}>
                  {lugar.descripcionCorta}
                </Text>
              </View>
            </TouchableOpacity>
          ))
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
    letterSpacing: 2,
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

  tarjeta: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#ECEDEB',
    overflow: 'hidden',
    marginBottom: 14,
    minHeight: 118,
  },

  imagenPlaceholder: {
    width: 110,
    backgroundColor: '#E9EDE9',
    alignItems: 'center',
    justifyContent: 'center',
  },

  fotoLugar: {
    width: '100%',
    height: '100%',
  },

  textoImagen: {
    color: '#A0AAA2',
    fontSize: 11,
    fontFamily: 'PlusJakartaSans_600SemiBold',
    letterSpacing: 2,
  },

  info: {
    flex: 1,
    padding: 14,
    justifyContent: 'center',
  },

  etiqueta: {
    color: '#17624F',
    fontSize: 10,
    fontFamily: 'PlusJakartaSans_700Bold',
    letterSpacing: 0.6,
    marginBottom: 7,
  },

  nombreLugar: {
    color: '#202724',
    fontSize: 16,
    fontFamily: 'PlusJakartaSans_500Medium',
    marginBottom: 6,
  },

  descripcionLugar: {
    color: '#777D79',
    fontSize: 12,
    fontFamily: 'PlusJakartaSans_400Regular',
    lineHeight: 18,
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
