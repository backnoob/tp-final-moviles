import { router } from 'expo-router';
import * as SecureStore from 'expo-secure-store';
import { useState } from 'react';
import {
  Alert,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [cargando, setCargando] = useState(false);
  const [mensajeError, setMensajeError] = useState('');

  function mostrarError(mensaje: string) {
    setMensajeError(mensaje);
    if (Platform.OS !== 'web') {
      Alert.alert('Error', mensaje);
    }
  }

  async function ingresar() {
    if (!email.trim() || !password.trim()) {
      mostrarError('Completá todos los campos');
      return;
    }

    if (cargando) return;

    setMensajeError('');
    setCargando(true);

    try {
const respuesta = await fetch(`${process.env.EXPO_PUBLIC_API_URL}/auth/ingreso`, {
            method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: email.trim(),
          contrasena: password,
        }),
      });

      const resultado = await respuesta.json();

      if (!respuesta.ok) {
        mostrarError(resultado.error?.mensaje || 'No se pudo iniciar sesión');
        return;
      }

      const token = resultado.datos?.token;
      if (!token) {
        mostrarError('El servidor no devolvió un token de sesión.');
        return;
      }

      if (Platform.OS === 'web') {
        window.localStorage.setItem('token', token);
      } else {
        await SecureStore.setItemAsync('token', token);
      }

      router.replace('/principal/bienvenida');
    } catch (error) {
      mostrarError('No se pudo completar el inicio de sesión. Verificá que la API esté encendida.');
    } finally {
      setCargando(false);
    }
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
        autoCorrect={false}
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

      {mensajeError ? <Text style={styles.error}>{mensajeError}</Text> : null}

      <Pressable
        style={[styles.boton, cargando && styles.botonDeshabilitado]}
        onPress={ingresar}
        disabled={cargando}
      >
        <Text style={styles.textoBoton}>
          {cargando ? 'Ingresando...' : 'Ingresar'}
        </Text>
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
  error: {
    color: '#B42318',
    marginBottom: 10,
    fontSize: 14,
  },
  boton: {
    backgroundColor: '#174F45',
    padding: 17,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 10,
  },
  botonDeshabilitado: { opacity: 0.6 },
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
