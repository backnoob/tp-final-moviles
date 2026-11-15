
import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  Linking,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import { SafeAreaView } from 'react-native-safe-area-context';
import ReproductorAudioguia from '../../components/ReproductorAudioguia';
import {
  obtenerCategorias,
  obtenerLugarPorId,
} from '../../servicios/lugares';
import type { Lugar } from '../../tipos/lugar';
function obtenerEstadoHorario(horarios: Lugar['horarios']) {
  if (!horarios?.length) {
    return {
      texto: 'Horario no informado',
      abierto: null,
    };
  }

  const ahora = new Date();
  const diaActual = ahora.getDay();
  const minutosActuales =
    ahora.getHours() * 60 + ahora.getMinutes();

  const convertirMinutos = (hora: string) => {
    const partes = /^(\d{1,2}):(\d{2})$/.exec(hora.trim());
    if (!partes) return null;

    const horas = Number(partes[1]);
    const minutos = Number(partes[2]);

    if (horas > 23 || minutos > 59) return null;

    return horas * 60 + minutos;
  };

  let horariosValidos = 0;

  for (const horario of horarios) {
    const apertura = convertirMinutos(horario.abre);
    const cierre = convertirMinutos(horario.cierra);

    if (apertura === null || cierre === null) continue;

    horariosValidos++;

    // Horarios normales y horarios que cruzan medianoche.
    if (horario.dia === diaActual) {
      if (
        apertura < cierre &&
        minutosActuales >= apertura &&
        minutosActuales < cierre
      ) {
        return { texto: 'Abierto ahora', abierto: true };
      }

      if (
        apertura > cierre &&
        minutosActuales >= apertura
      ) {
        return { texto: 'Abierto ahora', abierto: true };
      }
    }

    // Continuación de un horario iniciado el día anterior.
    const diaAnterior = (diaActual + 6) % 7;

    if (
      horario.dia === diaAnterior &&
      apertura > cierre &&
      minutosActuales < cierre
    ) {
      return { texto: 'Abierto ahora', abierto: true };
    }
  }

  return horariosValidos === 0
    ? { texto: 'Horario no informado', abierto: null }
    : { texto: 'Cerrado ahora', abierto: false };
}

export default function DetalleLugar() {
  const { id } = useLocalSearchParams<{ id: string }>();

  const { width } = useWindowDimensions();

  // MÁRGENES DE 22 PX A CADA LADO
  const anchoGaleria = width - 44;

  const [lugar, setLugar] = useState<Lugar | null>(null);
  const [nombreCategoria, setNombreCategoria] = useState('');
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(false);

  // FOTO ACTUAL DE LA GALERÍA
  const [fotoActual, setFotoActual] = useState(0);

  // OBTENER LUGAR Y CATEGORÍA DESDE LA API
  useEffect(() => {
    let activo = true;

    async function cargarLugar() {
      setCargando(true);
      setError(false);
      setLugar(null);
      setNombreCategoria('');
      setFotoActual(0);

      try {
        if (!id) {
          if (activo) setError(true);
          return;
        }

        const [resultado, listaCategorias] = await Promise.all([
          obtenerLugarPorId(id),
          obtenerCategorias(),
        ]);

        if (!activo) return;

        setLugar(resultado ?? null);

        const categoriaEncontrada = listaCategorias.find(
          (item) => item.id === resultado?.categoriaId
        );

        setNombreCategoria(
          categoriaEncontrada?.nombre ?? 'Sin categoría'
        );
      } catch (error) {
        console.error('Error al obtener el lugar:', error);

        if (activo) {
          setError(true);
        }
      } finally {
        if (activo) {
          setCargando(false);
        }
      }
    }

    cargarLugar();

    return () => {
      activo = false;
    };
  }, [id]);

  // ABRIR TELÉFONO O ENLACES
  async function abrirEnlace(url: string) {
    try {
      const disponible = await Linking.canOpenURL(url);

      if (disponible) {
        await Linking.openURL(url);
      } else {
        Alert.alert(
          'No disponible',
          'No se encontró una aplicación para abrir este enlace.'
        );
      }
    } catch (error) {
      console.error('Error al abrir enlace:', error);

      Alert.alert(
        'Error',
        'No se pudo abrir el enlace.'
      );
    }
  }

  // ABRIR GOOGLE MAPS CON COORDENADAS DE LA API
  async function abrirMapa() {
    if (!lugar?.coordenadas) return;

    const { latitud, longitud } = lugar.coordenadas;

    const url =
      'https://www.google.com/maps/dir/?api=1' +
      `&destination=${latitud},${longitud}`;

    await abrirEnlace(url);
  }

  // PANTALLA DE CARGA
  if (cargando) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.estado}>
          <ActivityIndicator
            size="large"
            color="#17624F"
          />

          <Text style={styles.textoEstado}>
            Cargando información del lugar...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  // PANTALLA DE ERROR
  if (error || !lugar) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.estado}>
          <Text style={styles.nombre}>
            {error
              ? 'No pudimos cargar el lugar'
              : 'Lugar no encontrado'}
          </Text>

          <TouchableOpacity
            onPress={() => router.replace('/principal')}
          >
            <Text style={styles.volver}>
              ← Volver al inicio
            </Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const telefonoDisponible =
    typeof lugar.telefono === 'string' &&
    lugar.telefono.trim() !== '';

  const sitioWebDisponible =
    typeof lugar.sitioWeb === 'string' &&
    lugar.sitioWeb.trim() !== '';
const estadoHorario = obtenerEstadoHorario(lugar.horarios);
  const dias = [
    'Domingo',
    'Lunes',
    'Martes',
    'Miércoles',
    'Jueves',
    'Viernes',
    'Sábado',
  ];

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.contenido}
        showsVerticalScrollIndicator={false}
      >
        {/* BOTÓN VOLVER */}
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.volver}>
            ← Volver
          </Text>
        </TouchableOpacity>

        {/* GALERÍA DE FOTOGRAFÍAS DESDE LA API */}
        <View style={styles.imagen}>
          {lugar.imagenes?.length > 0 ? (
            <ScrollView
              horizontal
              pagingEnabled
              showsHorizontalScrollIndicator={false}
              style={styles.scrollGaleria}
              onMomentumScrollEnd={(evento) => {
                const desplazamiento =
                  evento.nativeEvent.contentOffset.x;

                const indice = Math.round(
                  desplazamiento / anchoGaleria
                );

                setFotoActual(indice);
              }}
            >
              {lugar.imagenes.map((imagen, index) => (
                <Image
                  key={`${imagen}-${index}`}
                  source={{ uri: imagen }}
                  style={{
                    width: anchoGaleria,
                    height: 220,
                  }}
                  resizeMode="cover"
                />
              ))}
            </ScrollView>
          ) : (
            <Text style={styles.textoImagen}>
              SIN FOTO
            </Text>
          )}

          {/* CONTADOR DE FOTOGRAFÍAS */}
          {lugar.imagenes?.length > 1 && (
            <View style={styles.contadorFotos}>
              <Text style={styles.textoContadorFotos}>
                {fotoActual + 1} / {lugar.imagenes.length}
              </Text>
            </View>
          )}
        </View>

        {/* CATEGORÍA */}
        <Text style={styles.categoria}>
          {nombreCategoria}
        </Text>

        {/* NOMBRE */}
        <Text style={styles.nombre}>
          {lugar.nombre}
        </Text>

        {/* DESCRIPCIÓN CORTA */}
        <Text style={styles.descripcion}>
          {lugar.descripcionCorta}
        </Text>

        {/* SOBRE ESTE LUGAR */}
        <View style={styles.seccion}>
          <Text style={styles.tituloSeccion}>
            Sobre este lugar
          </Text>

          <Text style={styles.descripcionCompleta}>
            {lugar.descripcion}
          </Text>
        </View>

        {/* INFORMACIÓN DEL LUGAR */}
        <Text style={styles.tituloSeccion}>
          Información del lugar
        </Text>

        <View style={styles.tarjetaInfo}>
          {/* DIRECCIÓN */}
          <View style={styles.filaInfo}>
            <Text style={styles.icono}>⌖</Text>

            <View style={styles.textosInfo}>
              <Text style={styles.etiquetaInfo}>
                Dirección
              </Text>

              <Text style={styles.valorInfo}>
                {lugar.direccion || 'No disponible'}
              </Text>
            </View>
          </View>

          <View style={styles.separador} />

          {/* HORARIOS */}
          <View style={styles.filaInfo}>
            <Text style={styles.icono}>◷</Text>

            <View style={styles.textosInfo}>
              <Text style={styles.etiquetaInfo}>
                Horarios
              </Text>
<Text
  style={[
    styles.estadoHorario,
    estadoHorario.abierto === true
      ? styles.estadoAbierto
      : estadoHorario.abierto === false
        ? styles.estadoCerrado
        : styles.estadoDesconocido,
  ]}
>
  {estadoHorario.texto}
</Text>
              {lugar.horarios?.length > 0 ? (
                lugar.horarios.map((horario, index) => (
                  <Text
                    key={`${horario.dia}-${index}`}
                    style={styles.valorInfo}
                  >
                    {dias[horario.dia] ?? 'Día'}:{' '}
                    {horario.abre} a {horario.cierra}
                  </Text>
                ))
              ) : (
                <Text style={styles.valorInfo}>
                  Horarios pendientes de confirmar
                </Text>
              )}
            </View>
          </View>

          <View style={styles.separador} />

          {/* TELÉFONO */}
          <View style={styles.filaInfo}>
            <Text style={styles.icono}>☎</Text>

            <View style={styles.textosInfo}>
              <Text style={styles.etiquetaInfo}>
                Teléfono
              </Text>

              {telefonoDisponible ? (
                <TouchableOpacity
                  onPress={() =>
                    abrirEnlace(
                      `tel:${lugar.telefono!.replace(/[^\d+]/g, '')}`
                    )
                  }
                >
                  <Text style={styles.enlace}>
                    {lugar.telefono}
                  </Text>
                </TouchableOpacity>
              ) : (
                <Text style={styles.valorInfo}>
                  No disponible
                </Text>
              )}
            </View>
          </View>

          <View style={styles.separador} />

          {/* SITIO WEB */}
          <View style={styles.filaInfo}>
            <Text style={styles.icono}>↗</Text>

            <View style={styles.textosInfo}>
              <Text style={styles.etiquetaInfo}>
                Sitio web
              </Text>

              {sitioWebDisponible ? (
                <TouchableOpacity
                  onPress={() =>
                    abrirEnlace(lugar.sitioWeb!)
                  }
                >
                  <Text style={styles.enlace}>
                    Visitar sitio web
                  </Text>
                </TouchableOpacity>
              ) : (
                <Text style={styles.valorInfo}>
                  No disponible
                </Text>
              )}
            </View>
          </View>

          <View style={styles.separador} />

          {/* PRECIO DE ENTRADA */}
          <View style={styles.filaInfo}>
            <Text style={styles.icono}>$</Text>

            <View style={styles.textosInfo}>
              <Text style={styles.etiquetaInfo}>
                Precio de entrada
              </Text>

              <Text style={styles.valorInfo}>
                {lugar.precioEntrada == null
                  ? 'Precio no informado'
                  : lugar.precioEntrada === 0
                    ? 'Entrada gratuita'
                    : `$${lugar.precioEntrada.toLocaleString('es-AR')}`}
              </Text>
            </View>
          </View>
        </View>

        {/* MAPA DEL LUGAR: COORDENADAS REALES DE LA API */}
        {lugar.coordenadas &&
          Number.isFinite(Number(lugar.coordenadas.latitud)) &&
          Number.isFinite(Number(lugar.coordenadas.longitud)) && (
            <View style={styles.seccionMapa}>
              <Text style={styles.tituloSeccion}>Ubicación en el mapa</Text>
              <View style={styles.contenedorMapaLugar}>
                <MapView
                  style={StyleSheet.absoluteFill}
                  mapType="standard"
                  initialRegion={{
                    latitude: Number(lugar.coordenadas.latitud),
                    longitude: Number(lugar.coordenadas.longitud),
                    latitudeDelta: 0.012,
                    longitudeDelta: 0.012,
                  }}
                >
                  <Marker
                    coordinate={{
                      latitude: Number(lugar.coordenadas.latitud),
                      longitude: Number(lugar.coordenadas.longitud),
                    }}
                    title={lugar.nombre}
                    description={lugar.direccion || undefined}
                  />
                </MapView>
              </View>
            </View>
          )}

        {/* BOTÓN CÓMO LLEGAR */}
        <TouchableOpacity
          style={styles.botonMapa}
          onPress={abrirMapa}
          activeOpacity={0.8}
        >
          <Text style={styles.textoBotonMapa}>
            📍 Cómo llegar
          </Text>
        </TouchableOpacity>

        {/* SERVICIOS DISPONIBLES */}
        <View style={styles.seccionServicios}>
          <Text style={styles.tituloSeccion}>
            Servicios disponibles
          </Text>

          <View style={styles.tarjetaInfo}>
            {/* ACCESIBILIDAD */}
            <View style={styles.filaInfo}>
              <Text style={styles.icono}>♿</Text>

              <View style={styles.textosInfo}>
                <Text style={styles.etiquetaInfo}>
                  Accesibilidad
                </Text>

                <Text style={styles.valorInfo}>
                  {lugar.accesible
                    ? 'Figura como accesible'
                    : 'No figura como accesible'}
                </Text>
              </View>
            </View>

            <View style={styles.separador} />

            {/* AUDIOGUÍA */}
            <View style={styles.filaInfo}>
              <Text style={styles.icono}>♫</Text>

              <View style={styles.textosInfo}>
                <Text style={styles.etiquetaInfo}>
                  Audioguía
                </Text>

                <Text style={styles.valorInfo}>
                  {lugar.audioguia
                    ? 'Audioguía disponible'
                    : 'No disponible'}
                </Text>
                {lugar.audioguia?.url ? (
  <ReproductorAudioguia url={lugar.audioguia.url} />
) : null}
              </View>
            </View>
          </View>
        </View>
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

  contenido: {
    padding: 22,
    paddingBottom: 70,
  },

  estado: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 25,
  },

  textoEstado: {
    color: '#777D79',
    fontSize: 14,
    fontFamily: 'PlusJakartaSans_400Regular',
    marginTop: 15,
    textAlign: 'center',
  },

  volver: {
    color: '#17624F',
    fontSize: 15,
    fontFamily: 'PlusJakartaSans_500Medium',
    marginBottom: 25,
  },

  // CONTENEDOR DE LA GALERÍA
  imagen: {
    height: 220,
    backgroundColor: '#E9EDE9',
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 28,
    overflow: 'hidden',
  },

  scrollGaleria: {
    width: '100%',
  },

  fotoLugar: {
    width: '100%',
    height: '100%',
  },

  textoImagen: {
    color: '#A0AAA2',
    fontSize: 12,
    fontFamily: 'PlusJakartaSans_500Medium',
    letterSpacing: 2,
  },

  // CONTADOR DE FOTOS
  contadorFotos: {
    position: 'absolute',
    right: 12,
    bottom: 12,
    backgroundColor: 'rgba(0, 0, 0, 0.65)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },

  textoContadorFotos: {
    color: '#FFFFFF',
    fontSize: 12,
    fontFamily: 'PlusJakartaSans_600SemiBold',
  },

  categoria: {
    color: '#17624F',
    fontSize: 12,
    fontFamily: 'PlusJakartaSans_600SemiBold',
    marginBottom: 10,
  },

  nombre: {
    color: '#202724',
    fontSize: 29,
    fontFamily: 'PlusJakartaSans_500Medium',
    marginBottom: 15,
  },

  descripcion: {
    color: '#777D79',
    fontSize: 15,
    fontFamily: 'PlusJakartaSans_400Regular',
    lineHeight: 24,
    marginBottom: 32,
  },

  seccion: {
    marginBottom: 34,
  },

  seccionServicios: {
    marginTop: 34,
    marginBottom: 20,
  },

  tituloSeccion: {
    color: '#202724',
    fontSize: 19,
    fontFamily: 'PlusJakartaSans_600SemiBold',
    marginBottom: 18,
  },

  descripcionCompleta: {
    color: '#626B65',
    fontSize: 14,
    fontFamily: 'PlusJakartaSans_400Regular',
    lineHeight: 25,
  },

  tarjetaInfo: {
    backgroundColor: '#F8F9F7',
    borderRadius: 14,
    paddingHorizontal: 18,
    paddingVertical: 5,
  },

  filaInfo: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: 19,
  },

  icono: {
    width: 35,
    fontSize: 23,
    color: '#17624F',
  },

  textosInfo: {
    flex: 1,
  },

  etiquetaInfo: {
    color: '#202724',
    fontSize: 14,
    fontFamily: 'PlusJakartaSans_600SemiBold',
    marginBottom: 5,
  },

  valorInfo: {
    color: '#777D79',
    fontSize: 13,
    fontFamily: 'PlusJakartaSans_400Regular',
    lineHeight: 21,
  },

  enlace: {
    color: '#17624F',
    fontSize: 13,
    fontFamily: 'PlusJakartaSans_500Medium',
    lineHeight: 21,
  },

  separador: {
    height: 1,
    backgroundColor: '#E7EAE6',
  },

  seccionMapa: {
    marginTop: 26,
  },

  contenedorMapaLugar: {
    height: 230,
    width: '100%',
    backgroundColor: '#E9F1EC',
  },

  // BOTÓN CÓMO LLEGAR
  botonMapa: {
    backgroundColor: '#17624F',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
    marginBottom: 10,
  },

  textoBotonMapa: {
    color: '#FFFFFF',
    fontSize: 15,
    fontFamily: 'PlusJakartaSans_600SemiBold',
  },
   

  estadoHorario: {
    fontSize: 13,
    fontFamily: 'PlusJakartaSans_600SemiBold',
    marginBottom: 8,
  },

  estadoAbierto: {
    color: '#17624F',
  },

  estadoCerrado: {
    color: '#C45159',
  },

  estadoDesconocido: {
    color: '#777D79',
  },
});

