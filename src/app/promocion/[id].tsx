
import { useEffect, useState } from 'react';
import { useLocalSearchParams, router } from 'expo-router';
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { obtenerPromocionPorId } from '../../servicios/promociones';

type Promocion = {
  id: string;
  comercioId: string;
  comercio: string;
  titulo: string;
  descripcion: string;
  vencimiento: string;
};

export default function DetallePromocion() {
  const { id } = useLocalSearchParams<{ id: string }>();

  const [promocion, setPromocion] = useState<Promocion | undefined>();
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    async function cargarDetalle() {
      const datos = await obtenerPromocionPorId(id);
      setPromocion(datos);
      setCargando(false);
    }

    cargarDetalle();
  }, [id]);

  if (cargando) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#174F45" />
      </View>
    );
  }

  if (!promocion) {
    return (
      <View style={styles.container}>
        <Text>Promoción no encontrada.</Text>
        <Pressable onPress={() => router.back()}>
          <Text style={styles.volver}>Volver</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Pressable onPress={() => router.back()}>
        <Text style={styles.volver}>← Volver</Text>
      </Pressable>

      <Text style={styles.titulo}>{promocion.titulo}</Text>
      <Text style={styles.comercio}>{promocion.comercio}</Text>

      <View style={styles.tarjeta}>
        <Text style={styles.descripcion}>
          {promocion.descripcion}
        </Text>

        <Text style={styles.vencimiento}>
          Válido hasta: {promocion.vencimiento}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 25,
    backgroundColor: '#F5F8F5',
  },
  volver: {
    color: '#174F45',
    fontSize: 16,
    marginTop: 20,
    marginBottom: 30,
  },
  titulo: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#174F45',
  },
  comercio: {
    fontSize: 18,
    marginTop: 10,
    marginBottom: 25,
  },
  tarjeta: {
    backgroundColor: '#FFFFFF',
    padding: 20,
    borderRadius: 14,
  },
  descripcion: {
    fontSize: 16,
    lineHeight: 24,
  },
  vencimiento: {
    color: '#777777',
    marginTop: 25,
  },
});
