
import { useState } from 'react';
import {
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const categorias = [
  { nombre: 'Playas', emoji: '🏖️' },
  { nombre: 'Termas', emoji: '♨️' },
  { nombre: 'Museos', emoji: '🏛️' },
  { nombre: 'Gastronomía', emoji: '🍽️' },
  { nombre: 'Naturaleza', emoji: '🌳' },
  { nombre: 'Artesanías', emoji: '🎨' },
];

const lugares = [
  {
    nombre: 'Termas de Colón',
    categoria: 'Termas',
    emoji: '♨️',
    descripcion: 'Un lugar para relajarte y disfrutar.',
  },
  {
    nombre: 'Molino Forclaz',
    categoria: 'Museos',
    emoji: '🏛️',
    descripcion: 'Descubrí parte de nuestra historia.',
  },
  {
    nombre: 'Parque Nacional El Palmar',
    categoria: 'Naturaleza',
    emoji: '🌴',
    descripcion: 'Explorá nuestros paisajes naturales.',
  },
];

export default function HomeScreen() {
  const [busqueda, setBusqueda] = useState('');
  const [categoria, setCategoria] = useState('');

  const lugaresFiltrados = lugares.filter((lugar) => {
    const coincideNombre = lugar.nombre
      .toLowerCase()
      .includes(busqueda.toLowerCase());

    const coincideCategoria =
      categoria === '' || lugar.categoria === categoria;

    return coincideNombre && coincideCategoria;
  });

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />

      <ScrollView contentContainerStyle={styles.contenido}>
        <View style={styles.encabezado}>
          <Text style={styles.subtitulo}>GUÍA TURÍSTICA</Text>
          <Text style={styles.titulo}>Mi Ciudad Colón</Text>
          <Text style={styles.descripcion}>
            Descubrí todo lo que Colón tiene para vos.
          </Text>
        </View>

        <TextInput
          style={styles.buscador}
          placeholder="🔍  Buscar lugares turísticos..."
          placeholderTextColor="#879A94"
          value={busqueda}
          onChangeText={setBusqueda}
        />

        <Text style={styles.seccion}>Explorá Colón</Text>

        <View style={styles.categorias}>
          {categorias.map((item) => (
            <TouchableOpacity
              key={item.nombre}
              style={[
                styles.categoria,
                categoria === item.nombre && styles.seleccionada,
              ]}
              onPress={() =>
                setCategoria(
                  categoria === item.nombre ? '' : item.nombre
                )
              }
            >
              <Text style={styles.emoji}>{item.emoji}</Text>
              <Text style={styles.nombreCategoria}>
                {item.nombre}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.seccion}>Descubrí estos lugares</Text>

        {lugaresFiltrados.length === 0 ? (
          <Text style={styles.vacio}>
            No encontramos lugares con esos filtros.
          </Text>
        ) : (
          lugaresFiltrados.map((lugar) => (
            <View key={lugar.nombre} style={styles.tarjeta}>
              <View style={styles.imagen}>
                <Text style={styles.emojiGrande}>
                  {lugar.emoji}
                </Text>
              </View>

              <View style={styles.info}>
                <Text style={styles.etiqueta}>
                  {lugar.categoria}
                </Text>
                <Text style={styles.nombreLugar}>
                  {lugar.nombre}
                </Text>
                <Text style={styles.descripcionLugar}>
                  {lugar.descripcion}
                </Text>
              </View>
            </View>
          ))
        )}

        <View style={styles.aviso}>
          <Text style={styles.avisoTitulo}>
            📍 Explorá lugares cerca tuyo
          </Text>
          <Text style={styles.avisoTexto}>
            Próximamente vas a poder descubrir lugares
            turísticos en el mapa.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F8F5',
  },
  contenido: {
    padding: 20,
    paddingBottom: 100,
  },
  encabezado: {
    marginTop: 15,
    marginBottom: 25,
  },
  subtitulo: {
    color: '#498777',
    fontSize: 12,
    fontWeight: 'bold',
    letterSpacing: 2,
  },
  titulo: {
    color: '#174F45',
    fontSize: 31,
    fontWeight: 'bold',
    marginTop: 8,
  },
  descripcion: {
    color: '#647B74',
    fontSize: 15,
    marginTop: 8,
  },
  buscador: {
    backgroundColor: '#FFFFFF',
    padding: 17,
    borderRadius: 15,
    fontSize: 15,
    borderWidth: 1,
    borderColor: '#E2EBE5',
    marginBottom: 28,
  },
  seccion: {
    color: '#174F45',
    fontSize: 21,
    fontWeight: 'bold',
    marginBottom: 17,
  },
  categorias: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  categoria: {
    backgroundColor: '#FFFFFF',
    width: '31%',
    paddingVertical: 18,
    borderRadius: 16,
    alignItems: 'center',
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E2EBE5',
  },
  seleccionada: {
    backgroundColor: '#CDE8D8',
    borderColor: '#498777',
  },
  emoji: {
    fontSize: 29,
    marginBottom: 8,
  },
  nombreCategoria: {
    color: '#174F45',
    fontSize: 12,
    fontWeight: '600',
  },
  tarjeta: {
    backgroundColor: '#FFFFFF',
    borderRadius: 17,
    marginBottom: 15,
    overflow: 'hidden',
    flexDirection: 'row',
    borderWidth: 1,
    borderColor: '#E2EBE5',
  },
  imagen: {
    width: 95,
    backgroundColor: '#DFEEE4',
    alignItems: 'center',
    justifyContent: 'center',
  },
  emojiGrande: {
    fontSize: 40,
  },
  info: {
    flex: 1,
    padding: 15,
  },
  etiqueta: {
    color: '#498777',
    fontSize: 12,
    fontWeight: 'bold',
  },
  nombreLugar: {
    color: '#174F45',
    fontSize: 17,
    fontWeight: 'bold',
    marginTop: 5,
  },
  descripcionLugar: {
    color: '#72857D',
    fontSize: 13,
    marginTop: 5,
  },
  vacio: {
    color: '#72857D',
    textAlign: 'center',
    padding: 25,
  },
  aviso: {
    backgroundColor: '#DFEEE4',
    borderRadius: 17,
    padding: 20,
    marginTop: 15,
  },
  avisoTitulo: {
    color: '#174F45',
    fontSize: 17,
    fontWeight: 'bold',
  },
  avisoTexto: {
    color: '#647B74',
    fontSize: 14,
    marginTop: 8,
    lineHeight: 21,
  },
});
