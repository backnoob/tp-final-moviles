import { router } from 'expo-router';

import {
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

import { SafeAreaView } from 'react-native-safe-area-context';

export default function Mapa() {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.contenido}>

        {/* NAVEGACIÓN SUPERIOR */}
        <View style={styles.navegacion}>

          {/* VOLVER AL LISTADO DE LUGARES */}
          <TouchableOpacity
            onPress={() => router.replace('/principal')}
            accessibilityRole="button"
            accessibilityLabel="Volver a lugares para visitar"
          >
            <Text style={styles.volver}>
              ← Volver
            </Text>
          </TouchableOpacity>

          {/* VOLVER A LA BIENVENIDA */}
          <TouchableOpacity
            onPress={() =>
              router.replace('/principal/bienvenida')
            }
            accessibilityRole="button"
            accessibilityLabel="Volver al inicio"
          >
            <Text style={styles.inicio}>
              Inicio
            </Text>
          </TouchableOpacity>

        </View>

        {/* TÍTULO */}
        <Text style={styles.titulo}>
          Explorá Colón
        </Text>

        <Text style={styles.subtitulo}>
          Descubrí los lugares turísticos cerca tuyo.
        </Text>

        {/* ESPACIO PARA EL MAPA */}
        <View style={styles.espacioMapa}>
          <Text style={styles.icono}>📍</Text>

          <Text style={styles.textoMapa}>
            Próximamente, mapa interactivo
          </Text>
        </View>

      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },

  contenido: {
    flex: 1,
    padding: 22,
  },

  navegacion: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 28,
  },

  volver: {
    color: '#17624F',
    fontSize: 14,
    fontFamily: 'PlusJakartaSans_500Medium',
  },

  inicio: {
    color: '#17624F',
    fontSize: 14,
    fontFamily: 'PlusJakartaSans_600SemiBold',
  },

  titulo: {
    fontSize: 29,
    color: '#202724',
    fontFamily: 'PlusJakartaSans_600SemiBold',
    marginBottom: 10,
  },

  subtitulo: {
    fontSize: 14,
    color: '#777D79',
    fontFamily: 'PlusJakartaSans_400Regular',
    lineHeight: 23,
    marginBottom: 25,
  },

  espacioMapa: {
    flex: 1,
    minHeight: 300,
    borderRadius: 16,
    backgroundColor: '#E9F1EC',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },

  icono: {
    fontSize: 42,
    marginBottom: 15,
  },

  textoMapa: {
    fontSize: 15,
    color: '#17624F',
    fontFamily: 'PlusJakartaSans_500Medium',
    textAlign: 'center',
  },
});
