
import * as LocalAuthentication from 'expo-local-authentication';
import { Redirect } from 'expo-router';
import * as SecureStore from 'expo-secure-store';
import { useEffect, useState } from 'react';
import { ActivityIndicator, View } from 'react-native';

export default function Index() {
  const [destino, setDestino] = useState<'/login' | '/principal' | null>(null);

  useEffect(() => {
    async function comprobarSesion() {
      try {
        const token = await SecureStore.getItemAsync('token');

        if (!token) {
          setDestino('/login');
          return;
        }

        const tieneSensor = await LocalAuthentication.hasHardwareAsync();
        const tieneHuellas = await LocalAuthentication.isEnrolledAsync();

        if (!tieneSensor || !tieneHuellas) {
          setDestino('/login');
          return;
        }

        const resultado = await LocalAuthentication.authenticateAsync({
          promptMessage: 'Ingresar a Mi Ciudad Colón',
          cancelLabel: 'Cancelar',
          fallbackLabel: 'Usar contraseña del dispositivo',
          disableDeviceFallback: false,
        });

        if (resultado.success) {
          setDestino('/principal');
        } else {
          setDestino('/login');
        }
      } catch (error) {
        setDestino('/login');
      }
    }

    comprobarSesion();
  }, []);

  if (destino === null) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        <ActivityIndicator size="large" color="#174F45" />
      </View>
    );
  }

  return <Redirect href={destino} />;
}
