import {
    PlusJakartaSans_400Regular,
    PlusJakartaSans_500Medium,
    PlusJakartaSans_600SemiBold,
    PlusJakartaSans_700Bold,
    useFonts,
} from '@expo-google-fonts/plus-jakarta-sans';

import { router } from 'expo-router';
import { useState } from 'react';

import {
    ActivityIndicator,
    Alert,
    Button,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';

import { CameraView, useCameraPermissions } from 'expo-camera';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function RecorridoScreen() {
  const [fontsLoaded] = useFonts({
    PlusJakartaSans_400Regular,
    PlusJakartaSans_500Medium,
    PlusJakartaSans_600SemiBold,
    PlusJakartaSans_700Bold,
  });

  const [permission, requestPermission] = useCameraPermissions();
  const [abrirCamara, setAbrirCamara] = useState(false);
  
  // Estados para el QR y las notas
  const [codigoActual, setCodigoActual] = useState('');
  const [nota, setNota] = useState('');
  const [listaVisitas, setListaVisitas] = useState<any[]>([]);

    useEffect(() => {
    async function cargarVisitasGuardadas() {
      try {
        const datos = await AsyncStorage.getItem('mis_visitas_colon');
        if (datos !== null) {
          setListaVisitas(JSON.parse(datos));
        }
      } catch (error) {
        console.log(error);
      }
    }
    cargarVisitasGuardadas();
    }, []);


  if (!fontsLoaded) {
    return (
      <View style={styles.cargandoPantalla}>
        <ActivityIndicator size="large" color="#17624F" />
      </View>
    );
  }

  // Permisos de cámara
  if (!permission) return <View />;
  if (!permission.granted) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.estado}>
          <Text style={styles.tituloVacio}>Necesitamos permisos</Text>
          <Text style={styles.descripcionVacio}>Requerimos acceso a la cámara para poder leer los códigos QR de la peatonal.</Text>
          <TouchableOpacity style={styles.botonExplorar} onPress={requestPermission}>
            <Text style={styles.textoBotonExplorar}>Dar permisos</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  // Lector seguro del QR
  const handleScanned = ({ data }: { data: string }) => {
    try {
      if (data && data.startsWith('COLON:')) {
        setCodigoActual(data);
        setAbrirCamara(false);
      } else {
        Alert.alert('Error', 'Este código QR no pertenece a la peatonal.');
      }
    } catch (e) {
      console.log(e);
    }
  };

  // Guardar visita
const guardar = async () => {
        if (!codigoActual) {
        Alert.alert('Falta lugar', 'Primero escaneá un QR o escribí el código.');
        return;
        }

        const nueva = {
        id: Date.now().toString(),
        lugar: codigoActual,
        comentario: nota,
        };

        const listaActualizada = [nueva, ...listaVisitas];
        setListaVisitas(listaActualizada);

        try {
        await AsyncStorage.setItem('mis_visitas_colon', JSON.stringify(listaActualizada));
        } catch (error) {
        console.log(error);
        }

        setCodigoActual('');
        setNota('');
        Alert.alert('Listo', '¡Guardado en tu recorrido!');
};
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.contenido}
        showsVerticalScrollIndicator={false}
      >
        
        <View style={styles.navegacion}>
        <TouchableOpacity
            onPress={() => router.back()}
            accessibilityRole="button"
            accessibilityLabel="Volver atras"
          >
        <Text style={styles.volver}>← Volver</Text>
            </TouchableOpacity>

          
        </View>

        {/* ENCABEZADO */}
        <Text style={styles.titulo}>Mi Recorrido</Text>
        <Text style={styles.subtitulo}>
          Registrá tus visitas escaneando el código QR de los carteles o sumando notas de tus paseos.
        </Text>

        {/* CÁMARA O BOTÓN DE ESCANEO */}
        {abrirCamara ? (
          <View style={styles.camaraBox}>
            <CameraView 
              style={{ flex: 1 }} 
              onBarcodeScanned={handleScanned} 
            />
            <TouchableOpacity 
              style={[styles.botonExplorar, { backgroundColor: '#C45159', marginTop: 10 }]} 
              onPress={() => setAbrirCamara(false)}
            >
              <Text style={styles.textoBotonExplorar}>Cancelar escaneo</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <TouchableOpacity style={styles.botonExplorar} onPress={() => setAbrirCamara(true)}>
            <Text style={styles.textoBotonExplorar}> 📷    Escanear QR </Text>
          </TouchableOpacity>
        )}

       {/* SECCIÓN DE REGISTRO MANUAL O POR QR */}
        {!abrirCamara && (
          <View style={styles.card}>
            <Text style={styles.lugarDetectado}> Registro de Visita</Text>
            
            {/* Input para ingresar el código a mano (MANUAL) */}
            <TextInput
              style={styles.input}
              placeholder="Ej: COLON:lug-001 (o escaneá )"
              placeholderTextColor="#929292"
              value={codigoActual}
              onChangeText={setCodigoActual}
            />

            {/* Input para la nota corta (NOTAS) */}
            <TextInput
              style={styles.input}
              placeholder="Escribí una nota sobre tu visita..."
              placeholderTextColor="#929292"
              value={nota}
              onChangeText={setNota}
            />

            {/* Botón Guardar */}
            <TouchableOpacity style={[styles.botonExplorar, { backgroundColor: '#2E7D32' }]} onPress={guardar}>
              <Text style={styles.textoBotonExplorar}>Guardar visita en el recorrido</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* LISTADO DE LUGARES VISITADOS */}
        <Text style={[styles.titulo, { fontSize: 20, marginTop: 25 }]}>
          Lugares visitados ({listaVisitas.length})
        </Text>

        {listaVisitas.length === 0 ? (
          <View style={styles.estado}>
            <Text style={styles.iconoVacio}>🧭</Text>
            <Text style={styles.tituloVacio}>Todavía no registraste visitas</Text>
            <Text style={styles.descripcionVacio}>
              Recorre y escaneá los QR de los lugares visitados  para armar tu historial.
            </Text>
          </View>
        ) : (
          listaVisitas.map((item) => (
            <View key={item.id} style={styles.tarjetaVisita}>
              <Text style={styles.nombreVisita}>📍 {item.lugar}</Text>
              {item.comentario ? <Text style={styles.notaVisita}>Nota: "{item.comentario}"</Text> : null}
            </View>
          ))
        )}

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
    marginBottom: 20,
  },
  camaraBox: {
    height: 320,
    width: '100%',
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 20,
    backgroundColor: '#000',
  },
  card: {
    padding: 18,
    backgroundColor: '#F5F8F6',
    borderRadius: 13,
    borderWidth: 1,
    borderColor: '#ECEDEB',
    marginBottom: 20,
  },
  lugarDetectado: {
    fontSize: 15,
    fontFamily: 'PlusJakartaSans_600SemiBold',
    color: '#17624F',
    marginBottom: 12,
  },
  input: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#ECEDEB',
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: 10,
    fontSize: 14,
    fontFamily: 'PlusJakartaSans_400Regular',
    color: '#202724',
    marginBottom: 12,
  },
  tarjetaVisita: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#ECEDEB',
    borderRadius: 13,
    padding: 16,
    marginBottom: 12,
  },
  nombreVisita: {
    fontSize: 15,
    fontFamily: 'PlusJakartaSans_600SemiBold',
    color: '#202724',
    marginBottom: 4,
  },
  notaVisita: {
    fontSize: 13,
    fontFamily: 'PlusJakartaSans_400Regular',
    color: '#777D79',
    fontStyle: 'italic',
  },
  estado: {
    backgroundColor: '#F5F8F6',
    borderRadius: 16,
    paddingHorizontal: 25,
    paddingVertical: 35,
    alignItems: 'center',
    marginVertical: 10,
  },
  iconoVacio: {
    color: '#17624F',
    fontSize: 38,
    marginBottom: 12,
  },
  tituloVacio: {
    color: '#202724',
    fontSize: 17,
    fontFamily: 'PlusJakartaSans_600SemiBold',
    textAlign: 'center',
    marginBottom: 8,
  },
  descripcionVacio: {
    color: '#777D79',
    fontSize: 13,
    fontFamily: 'PlusJakartaSans_400Regular',
    lineHeight: 20,
    textAlign: 'center',
    marginBottom: 18,
  },
  botonExplorar: {
    backgroundColor: '#17624F',
    borderRadius: 11,
    paddingHorizontal: 23,
    paddingVertical: 14,
    alignItems: 'center',
    marginBottom: 10,
  },
  textoBotonExplorar: {
    color: '#FFFFFF',
    fontSize: 13,
    fontFamily: 'PlusJakartaSans_600SemiBold',
  },
  pie: {
    color: '#A0A5A1',
    fontSize: 12,
    fontFamily: 'PlusJakartaSans_400Regular',
    textAlign: 'center',
    marginTop: 30,
  },
});