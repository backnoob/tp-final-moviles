
import { router } from 'expo-router';
import { useState } from 'react';
import {
  Alert,
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

  async function registrarse() {
    if (!nombre.trim() || !email.trim() || !password.trim()) {
      Alert.alert('Error', 'Completá todos los campos');
      return;
    }

    if (password.length < 6) {
      Alert.alert(
        'Error',
        'La contraseña debe tener al menos 6 caracteres'
      );
      return;
    }

    if (cargando) return;

    setCargando(true);

    try {
      const respuesta = await fetch(
        'http://192.168.1.42:3000/auth/registro',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            nombre: nombre.trim(),
            email: email.trim(),
            contrasena: password,
          }),
        }
      );

      const resultado = await respuesta.json();

      if (!respuesta.ok) {
        Alert.alert(
          'Error',
          resultado.error?.mensaje || 'No se pudo crear la cuenta'
        );
        return;
      }

      Alert.alert(
        'Registro exitoso',
        'Tu cuenta fue creada. Ahora podés iniciar sesión.',
        [
          {
            text: 'Aceptar',
            onPress: () => router.replace('/login'),
          },
        ]
      );
    } catch (error) {
      Alert.alert(
        'Error de conexión',
        'No se pudo conectar con el servidor. Verificá que la API esté encendida.'
      );
    } finally {
      setCargando(false);
    }
  }

  return (
    <View style={styles.container}>
      <Text style={styles.titulo}>Crear cuenta</Text>
      <Text style={styles.subtitulo}>
        Registrate en Mi Ciudad Colón
      </Text>

      <TextInput
        style={styles.input}
        placeholder="Nombre"
        value={nombre}
        onChangeText={setNombre}
      />

      <TextInput
        style={styles.input}
        placeholder="Correo electrónico"
        keyboardType="email-address"
        autoCapitalize="none"
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
  botonDeshabilitado: {
    opacity: 0.6,
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
