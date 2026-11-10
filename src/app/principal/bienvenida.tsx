
import { router } from 'expo-router';
import { useState } from 'react';
import {
  ImageBackground,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function BienvenidaScreen() {
  const [busqueda, setBusqueda] = useState('');

  function explorar() {
    router.push('/principal');
  }

  return (
    <SafeAreaView style={styles.contenedor}>
      <ScrollView
        contentContainerStyle={styles.contenido}
        keyboardShouldPersistTaps="handled"
      >
        {/* ENCABEZADO */}
        <View style={styles.encabezado}>
          <View>
            <Text style={styles.marca}>MI CIUDAD</Text>
            <Text style={styles.ciudad}>COLÓN</Text>
          </View>

          <TouchableOpacity
            style={styles.botonExplorar}
            onPress={explorar}
          >
            <Text style={styles.textoBotonExplorar}>
              Explorar
            </Text>
          </TouchableOpacity>
        </View>

        {/* PORTADA */}
        <ImageBackground
          source={require('../../../assets/images/lugares/termas-colon.jpg')}
          style={styles.portada}
          imageStyle={styles.imagenPortada}
        >
          <View style={styles.capaOscura}>
            <View style={styles.etiqueta}>
              <Text style={styles.textoEtiqueta}>
                ENTRE RÍOS · ARGENTINA
              </Text>
            </View>

            <View style={styles.bloqueBienvenida}>
              <Text style={styles.subtitulo}>
                DESCUBRÍ UN LUGAR ÚNICO
              </Text>

              <Text style={styles.titulo}>
                ¡Te damos la bienvenida a Colón!
              </Text>

              <Text style={styles.descripcion}>
                Playas, termas, naturaleza e historia.
                Todo lo que necesitás para disfrutar
                la ciudad.
              </Text>

              <View style={styles.buscador}>
                <TextInput
                  style={styles.input}
                  placeholder="¿Qué te gustaría conocer?"
                  placeholderTextColor="#777777"
                  value={busqueda}
                  onChangeText={setBusqueda}
                  returnKeyType="search"
                  onSubmitEditing={explorar}
                />

                <TouchableOpacity
                  style={styles.botonBuscar}
                  onPress={explorar}
                >
                  <Text style={styles.textoBuscar}>
                    Buscar
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </ImageBackground>

        {/* SECCIÓN PRINCIPAL */}
        <View style={styles.seccion}>
          <Text style={styles.tituloSeccion}>
            Empezá a descubrir
          </Text>

          <Text style={styles.textoSeccion}>
            Tu próxima experiencia en Colón empieza acá.
          </Text>

          {/* LUGARES PARA VISITAR */}
          <TouchableOpacity
            style={styles.tarjeta}
            onPress={explorar}
          >
            <Text style={styles.icono}>📍</Text>

            <View style={styles.infoTarjeta}>
              <Text style={styles.nombreTarjeta}>
                Lugares para visitar
              </Text>

              <Text style={styles.descripcionTarjeta}>
                Descubrí los atractivos turísticos.
              </Text>
            </View>

            <Text style={styles.flecha}>›</Text>
          </TouchableOpacity>

          {/* AGENDA DE EVENTOS */}
          <TouchableOpacity
            style={styles.tarjeta}
            onPress={() => router.push('/principal/agenda')}
            accessibilityRole="button"
            accessibilityLabel="Abrir agenda de eventos"
          >
            <Text style={styles.icono}>📅</Text>

            <View style={styles.infoTarjeta}>
              <Text style={styles.nombreTarjeta}>
                Agenda de eventos
              </Text>

              <Text style={styles.descripcionTarjeta}>
                Ferias, festivales y actividades en Colón.
              </Text>
            </View>

            <Text style={styles.flecha}>›</Text>
          </TouchableOpacity>

          {/* MIS FAVORITOS */}
          <TouchableOpacity
            style={styles.tarjeta}
            onPress={() => router.push('/principal/favoritos')}
            accessibilityRole="button"
            accessibilityLabel="Abrir mis favoritos"
          >
            <Text style={styles.icono}>❤️</Text>

            <View style={styles.infoTarjeta}>
              <Text style={styles.nombreTarjeta}>
                Mis favoritos
              </Text>

              <Text style={styles.descripcionTarjeta}>
                Tus lugares preferidos de Colón.
              </Text>
            </View>

            <Text style={styles.flecha}>›</Text>
          </TouchableOpacity>

          {/* PROMOCIONES */}
          <TouchableOpacity
            style={styles.tarjeta}
            onPress={() => router.push('/promociones')}
          >
            <Text style={styles.icono}>🎟️</Text>

            <View style={styles.infoTarjeta}>
              <Text style={styles.nombreTarjeta}>
                Promociones
              </Text>

              <Text style={styles.descripcionTarjeta}>
                Conocé las propuestas disponibles.
              </Text>
            </View>

            <Text style={styles.flecha}>›</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  contenedor: {
    flex: 1,
    backgroundColor: '#F5F2EC',
  },

  contenido: {
    paddingBottom: 35,
  },

  encabezado: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 22,
    paddingVertical: 18,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  marca: {
    fontSize: 12,
    fontWeight: '700',
    color: '#11736E',
    letterSpacing: 2,
  },

  ciudad: {
    fontSize: 22,
    fontWeight: '800',
    color: '#202724',
  },

  botonExplorar: {
    borderWidth: 1.5,
    borderColor: '#11736E',
    borderRadius: 25,
    paddingHorizontal: 22,
    paddingVertical: 10,
  },

  textoBotonExplorar: {
    color: '#11736E',
    fontWeight: '700',
  },

  portada: {
    minHeight: 500,
  },

  imagenPortada: {
    resizeMode: 'cover',
  },

  capaOscura: {
    flex: 1,
    minHeight: 500,
    backgroundColor: 'rgba(0, 0, 0, 0.40)',
    justifyContent: 'space-between',
    padding: 22,
  },

  etiqueta: {
    alignSelf: 'flex-start',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 30,
  },

  textoEtiqueta: {
    color: '#11736E',
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 1,
  },

  bloqueBienvenida: {
    paddingBottom: 24,
  },

  subtitulo: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 2,
    marginBottom: 14,
  },

  titulo: {
    color: '#FFFFFF',
    fontSize: 35,
    fontWeight: '800',
    lineHeight: 43,
    marginBottom: 15,
  },

  descripcion: {
    color: '#FFFFFF',
    fontSize: 15,
    lineHeight: 23,
    marginBottom: 25,
  },

  buscador: {
    backgroundColor: '#FFFFFF',
    borderRadius: 35,
    padding: 5,
    flexDirection: 'row',
    alignItems: 'center',
  },

  input: {
    flex: 1,
    paddingHorizontal: 15,
    fontSize: 13,
    color: '#202724',
    minWidth: 0,
  },

  botonBuscar: {
    backgroundColor: '#11736E',
    borderRadius: 30,
    paddingHorizontal: 18,
    paddingVertical: 14,
  },

  textoBuscar: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 13,
  },

  seccion: {
    paddingHorizontal: 22,
    paddingTop: 30,
  },

  tituloSeccion: {
    color: '#202724',
    fontSize: 23,
    fontWeight: '700',
    marginBottom: 7,
  },

  textoSeccion: {
    color: '#777D79',
    fontSize: 14,
    marginBottom: 23,
  },

  tarjeta: {
    backgroundColor: '#FFFFFF',
    borderRadius: 15,
    padding: 17,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },

  icono: {
    fontSize: 26,
    marginRight: 15,
  },

  infoTarjeta: {
    flex: 1,
  },

  nombreTarjeta: {
    color: '#202724',
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 5,
  },

  descripcionTarjeta: {
    color: '#777D79',
    fontSize: 12,
  },

  flecha: {
    color: '#11736E',
    fontSize: 28,
  },
});
