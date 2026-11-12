import {
    PlusJakartaSans_400Regular,
    PlusJakartaSans_500Medium,
    PlusJakartaSans_600SemiBold,
    PlusJakartaSans_700Bold,
    useFonts,
} from '@expo-google-fonts/plus-jakarta-sans';

import { router } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';

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

import { obtenerEventos } from '@/servicios/eventos';
import { obtenerLugares } from '@/servicios/lugares';

import type { Evento } from '@/tipos/evento';
import type { Lugar } from '@/tipos/lugar';

const diasSemana = [
  'DOM',
  'LUN',
  'MAR',
  'MIÉ',
  'JUE',
  'VIE',
  'SÁB',
];

const meses = [
  'enero',
  'febrero',
  'marzo',
  'abril',
  'mayo',
  'junio',
  'julio',
  'agosto',
  'septiembre',
  'octubre',
  'noviembre',
  'diciembre',
];

// CONVERTIR FECHA LOCAL A YYYY-MM-DD
function fechaLocal(fecha: Date): string {
  const anio = fecha.getFullYear();
  const mes = String(fecha.getMonth() + 1).padStart(2, '0');
  const dia = String(fecha.getDate()).padStart(2, '0');

  return `${anio}-${mes}-${dia}`;
}

// OBTENER LA FECHA DEL EVENTO
function fechaEvento(fechaISO: string): string {
  return fechaISO.slice(0, 10);
}

// OBTENER EL HORARIO DEL EVENTO
function horaEvento(fechaISO: string): string {
  const hora = fechaISO.slice(11, 16);

  return hora ? `${hora} hs` : 'Horario a confirmar';
}

// MOSTRAR EL PRECIO
function textoPrecio(precio: number | null): string {
  if (precio === null) {
    return 'Precio a consultar';
  }

  if (precio === 0) {
    return 'Entrada gratuita';
  }

  return `$${precio.toLocaleString('es-AR')}`;
}

// OBTENER LA DIRECCIÓN DEL EVENTO
function obtenerDireccionEvento(
  evento: Evento,
  lugares: Lugar[]
): string {
  // SI EL EVENTO TIENE UNA DIRECCIÓN PROPIA
  if (evento.direccionLibre?.trim()) {
    return evento.direccionLibre;
  }

  // SI ESTÁ RELACIONADO CON UN LUGAR TURÍSTICO
  if (evento.lugarId) {
    const lugar = lugares.find(
      (item) => item.id === evento.lugarId
    );

    if (lugar) {
      return lugar.direccion?.trim()
        ? lugar.direccion
        : lugar.nombre;
    }
  }

  return 'Ubicación a confirmar';
}

export default function Agenda() {
  const [fontsLoaded] = useFonts({
    PlusJakartaSans_400Regular,
    PlusJakartaSans_500Medium,
    PlusJakartaSans_600SemiBold,
    PlusJakartaSans_700Bold,
  });

  const [eventos, setEventos] = useState<Evento[]>([]);
  const [lugares, setLugares] = useState<Lugar[]>([]);

  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(false);

  const [fechaSeleccionada, setFechaSeleccionada] = useState(
    fechaLocal(new Date())
  );

  // CARGAR EVENTOS Y LUGARES DESDE LA API
  async function cargarDatos() {
    setCargando(true);
    setError(false);

    try {
      const [datosEventos, datosLugares] =
        await Promise.all([
          obtenerEventos(),
          obtenerLugares(),
        ]);

      setEventos(datosEventos);
      setLugares(datosLugares);
    } catch (errorCarga) {
      console.error(
        'Error al cargar la Agenda:',
        errorCarga
      );

      setError(true);
    } finally {
      setCargando(false);
    }
  }

  useEffect(() => {
    cargarDatos();
  }, []);

  // CALENDARIO DE 14 DÍAS DESDE HOY
  const diasCalendario = useMemo(() => {
    const hoy = new Date();
    hoy.setHours(12, 0, 0, 0);

    return Array.from(
      { length: 14 },
      (_, indice) => {
        const fecha = new Date(hoy);
        fecha.setDate(hoy.getDate() + indice);

        return {
          fecha: fechaLocal(fecha),
          numero: fecha.getDate(),
          dia: diasSemana[fecha.getDay()],
        };
      }
    );
  }, []);

  // FILTRAR EVENTOS POR FECHA
  const eventosDelDia = useMemo(() => {
    return eventos
      .filter(
        (evento) =>
          fechaEvento(evento.inicio) ===
          fechaSeleccionada
      )
      .sort((a, b) =>
        a.inicio.localeCompare(b.inicio)
      );
  }, [eventos, fechaSeleccionada]);

  const fechaElegida = new Date(
    `${fechaSeleccionada}T12:00:00`
  );

  const tituloFecha = `${
    fechaElegida.getDate()
  } de ${meses[fechaElegida.getMonth()]}`;

  if (!fontsLoaded) {
    return (
      <View style={styles.cargandoPantalla}>
        <ActivityIndicator
          size="large"
          color="#17624F"
        />
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
            <Text style={styles.volver}>
              ← Volver
            </Text>
          </TouchableOpacity>

          <Text style={styles.marca}>
            MI CIUDAD
          </Text>
        </View>

        {/* ENCABEZADO */}
        <Text style={styles.titulo}>
          Agenda de eventos
        </Text>

        <Text style={styles.subtitulo}>
          Descubrí qué hacer en Colón durante tu estadía.
        </Text>

        {/* CALENDARIO */}
        <View style={styles.encabezadoCalendario}>
          <Text style={styles.tituloSeccion}>
            Elegí una fecha
          </Text>

          <Text style={styles.mesActual}>
            {meses[new Date().getMonth()]}{' '}
            {new Date().getFullYear()}
          </Text>
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.calendario}
        >
          {diasCalendario.map((item) => {
            const seleccionado =
              item.fecha === fechaSeleccionada;

            const tieneEventos = eventos.some(
              (evento) =>
                fechaEvento(evento.inicio) ===
                item.fecha
            );

            return (
              <TouchableOpacity
                key={item.fecha}
                style={[
                  styles.dia,
                  seleccionado &&
                    styles.diaSeleccionado,
                ]}
                onPress={() =>
                  setFechaSeleccionada(item.fecha)
                }
                accessibilityRole="button"
                accessibilityLabel={`Seleccionar ${item.dia} ${item.numero}`}
                accessibilityState={{
                  selected: seleccionado,
                }}
              >
                <Text
                  style={[
                    styles.nombreDia,
                    seleccionado &&
                      styles.textoDiaSeleccionado,
                  ]}
                >
                  {item.dia}
                </Text>

                <Text
                  style={[
                    styles.numeroDia,
                    seleccionado &&
                      styles.textoDiaSeleccionado,
                  ]}
                >
                  {item.numero}
                </Text>

                {/* PUNTO VERDE SI HAY EVENTOS */}
                <View
                  style={[
                    styles.puntoEvento,
                    tieneEventos && {
                      backgroundColor: seleccionado
                        ? '#FFFFFF'
                        : '#17624F',
                    },
                  ]}
                />
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {/* EVENTOS DEL DÍA */}
        <View style={styles.encabezadoEventos}>
          <Text style={styles.tituloSeccion}>
            Eventos del día
          </Text>

          <Text style={styles.fechaElegida}>
            {tituloFecha}
          </Text>
        </View>

        {/* CARGANDO */}
        {cargando ? (
          <View style={styles.estado}>
            <ActivityIndicator
              size="large"
              color="#17624F"
            />

            <Text style={styles.textoEstado}>
              Cargando eventos...
            </Text>
          </View>
        ) : error ? (
          /* ERROR */
          <View style={styles.estado}>
            <Text style={styles.iconoVacio}>
              ⚠️
            </Text>

            <Text style={styles.tituloVacio}>
              No pudimos cargar los eventos
            </Text>

            <Text style={styles.descripcionVacio}>
              Revisá tu conexión e intentá nuevamente.
            </Text>

            <TouchableOpacity
              style={styles.botonReintentar}
              onPress={cargarDatos}
            >
              <Text style={styles.textoReintentar}>
                Reintentar
              </Text>
            </TouchableOpacity>
          </View>
        ) : eventosDelDia.length === 0 ? (
          /* SIN EVENTOS */
          <View style={styles.estado}>
            <Text style={styles.iconoVacio}>
              📅
            </Text>

            <Text style={styles.tituloVacio}>
              No hay eventos para este día
            </Text>

            <Text style={styles.descripcionVacio}>
              Probá seleccionando otra fecha para ver
              las actividades disponibles.
            </Text>
          </View>
        ) : (
          /* TARJETAS DE EVENTOS */
          eventosDelDia.map((evento) => {
            const cancelado =
              evento.estado === 'cancelado';

            const finalizado =
              evento.estado === 'finalizado';

            const direccion = obtenerDireccionEvento(
              evento,
              lugares
            );

            return (
              <View
                key={evento.id}
                style={styles.tarjeta}
              >
                {/* FOTO */}
                {evento.imagenUrl ? (
                  <Image
                    source={{
                      uri: evento.imagenUrl,
                    }}
                    style={styles.imagenEvento}
                    resizeMode="cover"
                  />
                ) : (
                  <View style={styles.sinImagen}>
                    <Text style={styles.iconoSinImagen}>
                      📅
                    </Text>
                  </View>
                )}

                {/* INFORMACIÓN */}
                <View style={styles.infoEvento}>
                  <View style={styles.filaEstado}>
                    <Text style={styles.categoria}>
                      EVENTO EN COLÓN
                    </Text>

                    <View
                      style={[
                        styles.etiquetaEstado,
                        cancelado &&
                          styles.estadoCancelado,
                        finalizado &&
                          styles.estadoFinalizado,
                      ]}
                    >
                      <Text
                        style={[
                          styles.textoEtiquetaEstado,
                          cancelado &&
                            styles.textoEstadoCancelado,
                          finalizado &&
                            styles.textoEstadoFinalizado,
                        ]}
                      >
                        {cancelado
                          ? 'Cancelado'
                          : finalizado
                          ? 'Finalizado'
                          : 'Programado'}
                      </Text>
                    </View>
                  </View>

                  <Text style={styles.nombreEvento}>
                    {evento.titulo}
                  </Text>

                  <Text style={styles.descripcionEvento}>
                    {evento.descripcion}
                  </Text>

                  {/* HORARIO */}
                  <View style={styles.filaDato}>
                    <Text style={styles.iconoDato}>
                      🕒
                    </Text>

                    <Text style={styles.textoDato}>
                      {horaEvento(evento.inicio)}
                    </Text>
                  </View>

                  {/* UBICACIÓN REAL */}
                  <View style={styles.filaDato}>
                    <Text style={styles.iconoDato}>
                      📍
                    </Text>

                    <Text style={styles.textoDato}>
                      {direccion}
                    </Text>
                  </View>

                  {/* PRECIO */}
                  <View style={styles.filaDato}>
                    <Text style={styles.iconoDato}>
                      🎟️
                    </Text>

                    <Text style={styles.textoDato}>
                      {textoPrecio(evento.precio)}
                    </Text>
                  </View>
                </View>
              </View>
            );
          })
        )}

        {/* PIE */}
        <Text style={styles.pie}>
          Descubrí nuevas experiencias en Colón.
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
    marginBottom: 32,
  },

  encabezadoCalendario: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },

  tituloSeccion: {
    color: '#202724',
    fontSize: 18,
    fontFamily: 'PlusJakartaSans_600SemiBold',
  },

  mesActual: {
    color: '#17624F',
    fontSize: 12,
    fontFamily: 'PlusJakartaSans_500Medium',
    textTransform: 'capitalize',
  },

  calendario: {
    gap: 10,
    paddingBottom: 8,
  },

  dia: {
    width: 63,
    height: 83,
    backgroundColor: '#F5F6F4',
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },

  diaSeleccionado: {
    backgroundColor: '#17624F',
  },

  nombreDia: {
    color: '#777D79',
    fontSize: 11,
    fontFamily: 'PlusJakartaSans_600SemiBold',
    marginBottom: 5,
  },

  numeroDia: {
    color: '#202724',
    fontSize: 23,
    fontFamily: 'PlusJakartaSans_600SemiBold',
  },

  textoDiaSeleccionado: {
    color: '#FFFFFF',
  },

  puntoEvento: {
    width: 5,
    height: 5,
    borderRadius: 3,
    marginTop: 5,
    backgroundColor: 'transparent',
  },

  encabezadoEventos: {
    marginTop: 34,
    marginBottom: 18,
    gap: 5,
  },

  fechaElegida: {
    color: '#777D79',
    fontSize: 12,
    fontFamily: 'PlusJakartaSans_400Regular',
  },

  tarjeta: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#ECEDEB',
    borderRadius: 15,
    overflow: 'hidden',
    marginBottom: 16,
  },

  imagenEvento: {
    width: '100%',
    height: 160,
    backgroundColor: '#E9EDE9',
  },

  sinImagen: {
    height: 160,
    backgroundColor: '#E9EDE9',
    alignItems: 'center',
    justifyContent: 'center',
  },

  iconoSinImagen: {
    fontSize: 40,
  },

  infoEvento: {
    padding: 17,
  },

  filaEstado: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 8,
    marginBottom: 10,
  },

  categoria: {
    color: '#17624F',
    fontSize: 10,
    fontFamily: 'PlusJakartaSans_700Bold',
    letterSpacing: 1,
  },

  etiquetaEstado: {
    backgroundColor: '#E0EDE5',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 20,
  },

  textoEtiquetaEstado: {
    color: '#17624F',
    fontSize: 10,
    fontFamily: 'PlusJakartaSans_600SemiBold',
  },

  estadoCancelado: {
    backgroundColor: '#FCE8E8',
  },

  textoEstadoCancelado: {
    color: '#B33C3C',
  },

  estadoFinalizado: {
    backgroundColor: '#F0F0F0',
  },

  textoEstadoFinalizado: {
    color: '#777777',
  },

  nombreEvento: {
    color: '#202724',
    fontSize: 18,
    fontFamily: 'PlusJakartaSans_600SemiBold',
    marginBottom: 9,
  },

  descripcionEvento: {
    color: '#777D79',
    fontSize: 13,
    fontFamily: 'PlusJakartaSans_400Regular',
    lineHeight: 21,
    marginBottom: 15,
  },

  filaDato: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 8,
  },

  iconoDato: {
    fontSize: 13,
    marginRight: 8,
  },

  textoDato: {
    flex: 1,
    color: '#777D79',
    fontSize: 13,
    fontFamily: 'PlusJakartaSans_400Regular',
    lineHeight: 20,
  },

  estado: {
    backgroundColor: '#F5F8F6',
    borderRadius: 16,
    paddingHorizontal: 25,
    paddingVertical: 40,
    alignItems: 'center',
  },

  textoEstado: {
    color: '#777D79',
    fontSize: 13,
    fontFamily: 'PlusJakartaSans_400Regular',
    marginTop: 15,
  },

  iconoVacio: {
    fontSize: 38,
    marginBottom: 16,
  },

  tituloVacio: {
    color: '#202724',
    fontSize: 17,
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
  },

  botonReintentar: {
    backgroundColor: '#17624F',
    paddingHorizontal: 22,
    paddingVertical: 12,
    borderRadius: 10,
    marginTop: 20,
  },

  textoReintentar: {
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
