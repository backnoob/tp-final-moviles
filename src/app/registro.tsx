import { router } from 'expo-router';
import { useState } from 'react';
import {
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

export default function RegistroScreen() {
  const [nombre, setNombre] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState('');

  async function registrarse() {
    if (cargando) return;
    setError('');

    if (!nombre.trim() || !email.trim() || !password.trim()) {
      setError('Completá todos los campos.');
      return;
    }

    if (password.length < 8) {
      setError('La contraseña debe tener al menos 8 caracteres.');
      return;
    }

    setCargando(true);

    try {
      const respuesta = await fetch(`${process.env.EXPO_PUBLIC_API_URL}/auth/registro`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nombre: nombre.trim(),
          email: email.trim(),
          contrasena: password,
        }),
      });

      const resultado = await respuesta.json();

      if (!respuesta.ok) {
        setError(resultado.error?.mensaje || 'No se pudo crear la cuenta.');
        return;
      }

      router.replace('/login');
    } catch {
      setError('No se pudo conectar con el servidor. Verificá que la API esté encendida.');
    } finally {
      setCargando(false);
    }
  }

  return (
    <View style={styles.container}>
      <Text style={styles.titulo}>Crear cuenta</Text>
      <Text style={styles.subtitulo}>Registrate en Mi Ciudad Colón</Text>

      <Text style={styles.etiqueta}>Nombre</Text>
      <TextInput
        style={styles.input}
        placeholder="Ingresá tu nombre"
        placeholderTextColor="#7A8983"
        selectionColor="#174F45"
        value={nombre}
        onChangeText={setNombre}
        autoCapitalize="words"
      />

      <Text style={styles.etiqueta}>Correo electrónico</Text>
      <TextInput
        style={styles.input}
        placeholder="Ingresá tu correo electrónico"
        placeholderTextColor="#7A8983"
        selectionColor="#174F45"
        keyboardType="email-address"
        autoCapitalize="none"
        autoCorrect={false}
        value={email}
        onChangeText={setEmail}
      />

      <Text style={styles.etiqueta}>Contraseña</Text>
      <TextInput
        style={styles.input}
        placeholder="Mínimo 8 caracteres"
        placeholderTextColor="#7A8983"
        selectionColor="#174F45"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
      />

      {error ? <Text style={styles.error}>{error}</Text> : null}

      <Pressable
        style={[styles.boton, cargando && styles.botonDeshabilitado]}
        onPress={registrarse}
        disabled={cargando}
      >
        <Text style={styles.textoBoton}>
          {cargando ? 'Registrando...' : 'Registrarme'}
        </Text>
      </Pressable>

      <Pressable onPress={() => router.replace('/login')}>
        <Text style={styles.enlace}>Ya tengo una cuenta</Text>
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
  etiqueta: {
    fontSize: 14,
    fontWeight: '600',
    color: '#174F45',
    marginBottom: 7,
  },
  input: {
    backgroundColor: '#FFFFFF',
    color: '#202724',
    borderWidth: 1,
    borderColor: '#E2EBE5',
    borderRadius: 12,
    padding: 15,
    marginBottom: 15,
    fontSize: 16,
  },
  error: {
    color: '#B42318',
    fontSize: 14,
    marginBottom: 8,
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
