
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
    View,
} from 'react-native';

import { SafeAreaView } from 'react-native-safe-area-context';

import { obtenerLugarPorId } from '../../servicios/lugares';
import type { Lugar } from '../../tipos/lugar';

export default function DetalleLugar() {
  const { id } = useLocalSearchParams<{ id: string }>();

  const [lugar, setLugar] = useState<Lugar | null>(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(false);

  // OBTENER EL LUGAR DESDE EL SERVICIO
  useEffect(() => {
    let activo = true;

    async function cargarLugar() {
      setCargando(true);
      setError(false);
      setLugar(null);

      try {
        if (!id) {
          if (activo) setError(true);
          return;
        }

        const resultado = await obtenerLugarPorId(id);

        if (activo) {
          setLugar(resultado ?? null);
        }
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
      Alert.alert(
        'Error',
        'No se pudo abrir el enlace.'
      );
    }
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

  // PANTALLA DE ERROR O LUGAR NO ENCONTRADO
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
    lugar.telefono !== null &&
    lugar.telefono.trim() !== '';

  const sitioWebDisponible =
    lugar.sitioWeb !== null &&
    lugar.sitioWeb.trim() !== '';

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

        {/* FOTOGRAFÍA DEL LUGAR */}
        <View style={styles.imagen}>
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
              FOTO DEL LUGAR
            </Text>
          )}
        </View>

        {/* CATEGORÍA */}
        <Text style={styles.categoria}>
          {lugar.categoriaId.toUpperCase()}
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
                {lugar.direccion}
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

              {lugar.horarios.length > 0 ? (
                lugar.horarios.map((horario, index) => {
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
                    <Text
                      key={`${horario.dia}-${index}`}
                      style={styles.valorInfo}
                    >
                      {dias[horario.dia]}: {horario.abre} a {horario.cierra}
                    </Text>
                  );
                })
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

              {telefonoDisponible && lugar.telefono ? (
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

              {sitioWebDisponible && lugar.sitioWeb ? (
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
                {lugar.precioEntrada === null
                  ? 'Precio no informado'
                  : lugar.precioEntrada === 0
                    ? 'Entrada gratuita'
                    : `$${lugar.precioEntrada.toLocaleString('es-AR')}`}
              </Text>
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

  imagen: {
    height: 220,
    backgroundColor: '#E9EDE9',
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 28,
    overflow: 'hidden',
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
});
