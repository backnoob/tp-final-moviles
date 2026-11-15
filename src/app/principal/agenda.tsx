import {
  PlusJakartaSans_400Regular,
  PlusJakartaSans_500Medium,
  PlusJakartaSans_600SemiBold,
  PlusJakartaSans_700Bold,
  useFonts,
} from '@expo-google-fonts/plus-jakarta-sans';

import * as Notifications from 'expo-notifications';
import { router } from 'expo-router';
import * as SecureStore from 'expo-secure-store';
import { useEffect, useMemo, useState } from 'react';

import {
  ActivityIndicator,
  Alert,
  AppState,
  Image,
  Platform,
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
// EVENTOS DE DEMOSTRACIÓN PARA PROBAR LA AGENDA
function crearEventosDemo(): Evento[] {
  const eventos = [
    {
      id: 'demo-1',
      titulo: 'Feria de Artesanos — Demostración',
      descripcion:
        'Evento de prueba para mostrar una feria de artesanías y productos regionales.',
      diasDesdeHoy: 0,
      horaInicio: '18:00',
      horaFin: '22:00',
      direccion: 'Centro de Colón, Entre Ríos',
      precio: 0,
    },
    {
      id: 'demo-2',
      titulo: 'Música en la Costanera — Demostración',
      descripcion:
        'Evento de prueba con espectáculos musicales al aire libre.',
      diasDesdeHoy: 1,
      horaInicio: '20:00',
      horaFin: '23:00',
      direccion: 'Costanera de Colón, Entre Ríos',
      precio: 0,
    },
    {
      id: 'demo-3',
      titulo: 'Encuentro Gastronómico — Demostración',
      descripcion:
        'Evento de prueba para presentar comidas y sabores regionales.',
      diasDesdeHoy: 2,
      horaInicio: '12:00',
      horaFin: '16:00',
      direccion: 'Colón, Entre Ríos',
      precio: null,
    },
    {
      id: 'demo-4',
      titulo: 'Paseo Cultural — Demostración',
      descripcion:
        'Evento de prueba para mostrar una actividad cultural de la ciudad.',
      diasDesdeHoy: 4,
      horaInicio: '17:00',
      horaFin: '19:00',
      direccion: 'Centro de Colón, Entre Ríos',
      precio: 0,
    },
  ];

  function fechaConHora(dias: number, hora: string): string {
    const fecha = new Date();
    fecha.setDate(fecha.getDate() + dias);

    return `${fechaLocal(fecha)}T${hora}:00`;
  }

  return eventos.map((evento) => ({
    id: evento.id,
    titulo: evento.titulo,
    descripcion: evento.descripcion,
    lugarId: null,
    direccionLibre: evento.direccion,
    coordenadas: null,
    inicio: fechaConHora(evento.diasDesdeHoy, evento.horaInicio),
    fin: fechaConHora(evento.diasDesdeHoy, evento.horaFin),
    imagenUrl: null,
    precio: evento.precio,
    estado: 'programado' as const,
  }));
}
// Los eventos guardados son locales al dispositivo.
const CLAVE_EVENTOS = 'agenda_eventos_guardados_v1';
type EventoGuardado = { id: string; notificacionId?: string; cancelacionAvisada?: boolean };

async function leerGuardados(): Promise<EventoGuardado[]> {
  try {
    const valor = Platform.OS === 'web'
      ? window.localStorage.getItem(CLAVE_EVENTOS)
      : await SecureStore.getItemAsync(CLAVE_EVENTOS);
    if (!valor) return [];
    const datos: unknown = JSON.parse(valor);
    return Array.isArray(datos)
      ? datos.filter((item): item is EventoGuardado =>
          typeof item === 'object' && item !== null && typeof item.id === 'string')
      : [];
  } catch {
    return [];
  }
}

async function escribirGuardados(datos: EventoGuardado[]) {
  const valor = JSON.stringify(datos);
  if (Platform.OS === 'web') {
    window.localStorage.setItem(CLAVE_EVENTOS, valor);
  } else {
    await SecureStore.setItemAsync(CLAVE_EVENTOS, valor);
  }
}

// Recordatorios locales: una hora antes del inicio del evento.
async function programarRecordatorio(evento: Evento): Promise<string | undefined> {
  if (Platform.OS === 'web') return undefined;

  const fechaInicio = new Date(evento.inicio);
  const fechaAviso = new Date(fechaInicio.getTime() - 60 * 60 * 1000);
  //const fechaAviso = new Date(Date.now() + 10 * 1000);
  if (Number.isNaN(fechaAviso.getTime()) || fechaAviso.getTime() <= Date.now()) {
    return undefined;
  }

  const permisos = await Notifications.getPermissionsAsync();
  if (!permisos.granted) {
    const respuesta = await Notifications.requestPermissionsAsync();
    if (!respuesta.granted) return undefined;
  }

  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('recordatorios', {
      name: 'Recordatorios de eventos',
      importance: Notifications.AndroidImportance.DEFAULT,
    });
  }

  return Notifications.scheduleNotificationAsync({
    content: {
      title: '¡Tu evento se acerca!',
      body: `${evento.titulo} comienza en una hora.`,
      data: { eventoId: evento.id },
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.DATE,
      date: fechaAviso,
      ...(Platform.OS === 'android' ? { channelId: 'recordatorios' } : {}),
    },
  });
}

async function cancelarRecordatorio(id?: string): Promise<void> {
  if (!id || Platform.OS === 'web') return;
  await Notifications.cancelScheduledNotificationAsync(id);
}


// Comprueba cancelaciones de eventos guardados cuando se actualiza la agenda.
// La API debe haber respondido correctamente; no se infieren cancelaciones
// si un evento desaparece del listado.
let comprobandoCancelaciones = false;
async function revisarCancelaciones(eventosActualizados: Evento[]): Promise<EventoGuardado[]> {
  if (comprobandoCancelaciones) return leerGuardados();
  comprobandoCancelaciones = true;
  try {
    const guardadosActuales = await leerGuardados();
    const porId = new Map(eventosActualizados.map(evento => [evento.id, evento]));
    let huboCambios = false;

    for (const guardado of guardadosActuales) {
      const evento = porId.get(guardado.id);
      if (!evento || evento.estado !== 'cancelado') continue;

      // Cancelar el recordatorio incluso si el usuario rechazó las notificaciones.
      if (guardado.notificacionId) {
        try {
          await cancelarRecordatorio(guardado.notificacionId);
          guardado.notificacionId = undefined;
          huboCambios = true;
        } catch (error) {
          console.warn('No se pudo cancelar el recordatorio:', error);
        }
      }

      if (guardado.cancelacionAvisada) continue;

      if (Platform.OS !== 'web') {
        try {
          const permisos = await Notifications.getPermissionsAsync();
          if (permisos.granted) {
            if (Platform.OS === 'android') {
              await Notifications.setNotificationChannelAsync('cancelaciones', {
                name: 'Cancelaciones de eventos',
                importance: Notifications.AndroidImportance.HIGH,
              });
            }
            await Notifications.scheduleNotificationAsync({
              content: {
                title: 'Evento cancelado',
                body: `Se canceló "${evento.titulo}", que tenías guardado.`,
                data: { eventoId: evento.id, tipo: 'cancelacion' },
              },
              trigger: null,
            });
          }
        } catch (error) {
          console.warn('No se pudo notificar la cancelación:', error);
          // Se reintentará la próxima vez que se consulten los eventos.
          continue;
        }
      }
      // Una sola alerta por evento; no se repite en cada apertura de la agenda.
      guardado.cancelacionAvisada = true;
      huboCambios = true;
    }

    if (huboCambios) await escribirGuardados(guardadosActuales);
    return guardadosActuales;
  } finally {
    comprobandoCancelaciones = false;
  }
}

export default function Agenda() {
  const [fontsLoaded] = useFonts({
    PlusJakartaSans_400Regular,
    PlusJakartaSans_500Medium,
    PlusJakartaSans_600SemiBold,
    PlusJakartaSans_700Bold,
  });

  const [eventos, setEventos] = useState<Evento[]>([]);
  const [guardados, setGuardados] = useState<EventoGuardado[]>([]);
  const [procesandoId, setProcesandoId] = useState<string | null>(null);

  useEffect(() => {
    leerGuardados().then(setGuardados);
  }, []);

  async function alternarGuardado(evento: Evento) {
    if (procesandoId) return;
    setProcesandoId(evento.id);
    try {
      const anterior = guardados.find((item) => item.id === evento.id);
      if (anterior) {
        await cancelarRecordatorio(anterior.notificacionId);
        const nuevos = guardados.filter((item) => item.id !== evento.id);
        await escribirGuardados(nuevos);
        setGuardados(nuevos);
      } else {
        const notificacionId = await programarRecordatorio(evento);
        const nuevos = [...guardados, { id: evento.id, notificacionId }];
        try {
          await escribirGuardados(nuevos);
        } catch (e) {
          await cancelarRecordatorio(notificacionId);
          throw e;
        }
        setGuardados(nuevos);
        Alert.alert(
          'Evento guardado',
          'El evento quedó guardado. Si autorizaste las notificaciones y falta más de una hora para que comience, recibirás un recordatorio.'
        );
      }
    } catch (e) {
      console.error('Error al guardar evento:', e);
      Alert.alert('Error', 'No se pudo guardar el evento.');
    } finally {
      setProcesandoId(null);
    }
  }

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

      const eventosDemo = crearEventosDemo();

setEventos([...datosEventos, ...eventosDemo]);
      setLugares(datosLugares);
      try {
        const actualizados = await revisarCancelaciones(datosEventos);
        setGuardados(actualizados);
      } catch (errorNotificaciones) {
        console.warn('No se pudieron revisar cancelaciones:', errorNotificaciones);
      }
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
    void cargarDatos();
    // Revisa cambios del servidor al regresar a la aplicación.
    const suscripcion = AppState.addEventListener('change', estado => {
      if (estado === 'active') void cargarDatos();
    });
    return () => suscripcion.remove();
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
            onPress={() => router.replace('/principal/bienvenida')}
            accessibilityRole="button"
            accessibilityLabel="Volver al inicio"
          >
            <Text style={styles.volver}>← Volver</Text>
          </TouchableOpacity>
          <Text style={styles.marca}>MI CIUDAD COLÓN</Text>
        </View>

        <Text style={styles.titulo}>Agenda de eventos</Text>
        <Text style={styles.subtitulo}>
          Descubrí las actividades y eventos de la ciudad.
        </Text>

        {/* CALENDARIO DE 14 DÍAS */}
        <View style={styles.encabezadoCalendario}>
          <Text style={styles.tituloSeccion}>Calendario</Text>
          <Text style={styles.mesActual}>
            {meses[new Date(`${fechaSeleccionada}T12:00:00`).getMonth()]}
          </Text>
        </View>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.calendario}
        >
          {diasCalendario.map((dia) => {
            const seleccionado = dia.fecha === fechaSeleccionada;
            const tieneEventos = eventos.some((evento) => fechaEvento(evento.inicio) === dia.fecha);
            return (
              <TouchableOpacity
                key={dia.fecha}
                style={[styles.dia, seleccionado && styles.diaSeleccionado]}
                onPress={() => setFechaSeleccionada(dia.fecha)}
                accessibilityRole="button"
                accessibilityLabel={`Ver eventos del ${dia.fecha}`}
              >
                <Text style={[styles.nombreDia, seleccionado && styles.textoDiaSeleccionado]}>
                  {dia.dia}
                </Text>
                <Text style={[styles.numeroDia, seleccionado && styles.textoDiaSeleccionado]}>
                  {dia.numero}
                </Text>
                <View style={[styles.puntoEvento, tieneEventos && { backgroundColor: seleccionado ? '#FFFFFF' : '#17624F' }]} />
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        <View style={styles.encabezadoEventos}>
          <Text style={styles.tituloSeccion}>Eventos del día</Text>
          <Text style={styles.fechaElegida}>{tituloFecha}</Text>
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

                  <TouchableOpacity
                    style={[
                      styles.botonGuardar,
                      guardados.some((item) => item.id === evento.id) && styles.botonGuardado,
                      (cancelado || finalizado) && styles.botonInactivo,
                    ]}
                    onPress={() => alternarGuardado(evento)}
                    disabled={cancelado || finalizado || procesandoId !== null}
                    accessibilityRole="button"
                    accessibilityLabel={guardados.some((item) => item.id === evento.id)
                      ? `Quitar ${evento.titulo} de guardados`
                      : `Guardar ${evento.titulo}`}
                  >
                    <Text style={styles.textoBotonGuardar}>
                      {guardados.some((item) => item.id === evento.id)
                        ? '✓ Guardado · Quitar'
                        : '☆ Guardar evento'}
                    </Text>
                  </TouchableOpacity>
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

  botonGuardar: {
    backgroundColor: '#17624F',
    paddingVertical: 13,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 12,
  },
  botonGuardado: {
    backgroundColor: '#315E52',
  },
  botonInactivo: {
    opacity: 0.45,
  },
  textoBotonGuardar: {
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