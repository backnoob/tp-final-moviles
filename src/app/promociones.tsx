import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { obtenerPromociones } from '../servicios/promociones';

type Promocion = {
  id: string;
  comercioId: string;
  comercio: string;
  titulo: string;
  descripcion: string;
  vencimiento: string;
};

export default function PromocionesScreen() {
  const [promociones, setPromociones] = useState<Promocion[]>([]);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    async function cargarPromociones() {
      try {
        const datos = await obtenerPromociones();
        setPromociones(datos);
      } catch (error) {
        console.error('Error al cargar promociones:', error);
      } finally {
        setCargando(false);
      }
    }

    cargarPromociones();
  }, []);

  if (cargando) {
    return (
      <View style={styles.centrado}>
        <ActivityIndicator size="large" color="#174F45" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.titulo}>Promociones</Text>
      <Text style={styles.subtitulo}>
        Descubrí los beneficios disponibles en Colón
      </Text>

      <FlatList
        data={promociones}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.lista}
        ListEmptyComponent={
          <Text>No hay promociones disponibles.</Text>
        }
        renderItem={({ item }) => (
       <Pressable
  style={styles.tarjeta}
onPress={() =>
  router.push({
    pathname: '/promocion/[id]',
    params: { id: item.id },
  })
}>
    <Text style={styles.descuento}>{item.titulo}</Text>
    <Text style={styles.comercio}>{item.comercio}</Text>
    <Text style={styles.descripcion}>
        {item.descripcion}
    </Text>
    <Text style={styles.vencimiento}>
        Válido hasta: {item.vencimiento}
    </Text>
    </Pressable>
            )}
        />
        </View>
    );
    }

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F8F5',
    padding: 20,
  },
  titulo: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#174F45',
    marginTop: 20,
  },
  subtitulo: {
    fontSize: 15,
    color: '#647B74',
    marginTop: 8,
    marginBottom: 20,
  },
  lista: {
    paddingBottom: 30,
  },
  tarjeta: {
    backgroundColor: '#FFFFFF',
    padding: 20,
    borderRadius: 14,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#E2EBE5',
  },
  descuento: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#174F45',
  },
  comercio: {
    fontSize: 17,
    fontWeight: '600',
    marginTop: 10,
  },
  descripcion: {
    fontSize: 14,
    color: '#647B74',
    marginTop: 8,
  },
  vencimiento: {
    fontSize: 12,
    color: '#888888',
    marginTop: 15,
  },
  centrado: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
