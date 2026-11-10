
import * as LocalAuthentication from 'expo-local-authentication';
import { Redirect } from 'expo-router';
import * as SecureStore from 'expo-secure-store';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Platform,
  View,
} from 'react-native';

export default function Index() {
  const [destino, setDestino] = useState<
    '/login' | '/principal/bienvenida' | null
  >(null);

  useEffect(() => {
    let activo = true;

    async function comprobarSesion() {
      try {
        // Comprobar si existe una sesión guardada
        const token =
          Platform.OS === 'web'
            ? localStorage.getItem('token')
            : await SecureStore.getItemAsync('token');

        // Si no hay sesión, mostrar el login
        if (!token) {
          if (activo) {
            setDestino('/login');
          }
          return;
        }

        // En Chrome no utilizamos biometría
        if (Platform.OS === 'web') {
          if (activo) {
            setDestino('/principal/bienvenida');
          }
          return;
        }

        // Comprobar si el celular tiene biometría
        const tieneSensor =
          await LocalAuthentication.hasHardwareAsync();

        const tieneBiometria =
          await LocalAuthentication.isEnrolledAsync();

        // Si no tiene biometría configurada,
        // solicitar ingreso con correo y contraseña
        if (!tieneSensor || !tieneBiometria) {
          if (activo) {
            setDestino('/login');
          }
          return;
        }

        // Solicitar huella o reconocimiento biométrico
        const resultado =
          await LocalAuthentication.authenticateAsync({
            promptMessage: 'Ingresar a Mi Ciudad Colón',
            cancelLabel: 'Cancelar',
            fallbackLabel: 'Usar contraseña del dispositivo',
            disableDeviceFallback: false,
          });

        // Si la autenticación es correcta,
        // mostrar la bienvenida
        if (activo) {
          setDestino(
            resultado.success
              ? '/principal/bienvenida'
              : '/login'
          );
        }
      } catch (error) {
        console.error(
          'Error al comprobar la sesión:',
          error
        );

        if (activo) {
          setDestino('/login');
        }
      }
    }

    comprobarSesion();

    return () => {
      activo = false;
    };
  }, []);

  // Pantalla de carga mientras se comprueba la sesión
  if (destino === null) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center',
          backgroundColor: '#F5F2EC',
        }}
      >
        <ActivityIndicator
          size="large"
          color="#11736E"
        />
      </View>
    );
  }

  return <Redirect href={destino} />;
}
