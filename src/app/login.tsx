
import { useState } from 'react';
import {
  Alert,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { router } from 'expo-router';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  function ingresar() {
    if (!email.trim() || !password.trim()) {
      Alert.alert('Error', 'Completá todos los campos');
      return;
    }

    // Por ahora solo probamos la navegación.
    // Todavía NO autentica al usuario.
router.replace('/principal');
  }

  return (
    <View style={styles.container}>
      <Text style={styles.titulo}>Mi Ciudad Colón</Text>
      <Text style={styles.subtitulo}>Iniciá sesión para continuar</Text>

      <TextInput
        style={styles.input}
        placeholder="Correo electrónico"
        autoCapitalize="none"
        keyboardType="email-address"
        value={email}
        onChangeText={setEmail}
      />

      <TextInput
        style={styles.input}
        placeholder="Contraseña"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
      />

      <Pressable style={styles.boton} onPress={ingresar}>
        <Text style={styles.textoBoton}>Ingresar</Text>
      </Pressable>
      
      <Pressable onPress={() => router.push('/registro')}>
        <Text style={styles.enlace}>¿No tenés cuenta? Registrate</Text>
      </Pressable>
      
    </View>
  );

  
}


const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 25,
    backgroundColor: '#F5F8F5',
  },
  titulo: {
    fontSize: 30,
    fontWeight: 'bold',
    color: '#174F45',
    textAlign: 'center',
  },
  subtitulo: {
    fontSize: 15,
    color: '#647B74',
    textAlign: 'center',
    marginTop: 10,
    marginBottom: 35,
  },
  input: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2EBE5',
    borderRadius: 12,
    padding: 15,
    marginBottom: 15,
    fontSize: 16,
  },
  boton: {
    backgroundColor: '#174F45',
    padding: 17,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 10,
  },
  textoBoton: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  enlace: {
  color: '#174F45',
  textAlign: 'center',
  marginTop: 25,
  fontSize: 15,
},
});
