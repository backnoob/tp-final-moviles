
import type { Lugar } from '../tipos/lugar';

// CATEGORÍAS
export const categorias = [
  'Todos',
  'Playas',
  'Termas',
  'Museos',
  'Gastronomía',
  'Naturaleza',
  'Artesanías',
];

// LUGARES DE PRUEBA
export const lugares: Lugar[] = [
  {
    id: 'lug-001',
    nombre: 'Termas de Colón',
    categoriaId: 'Termas',

    descripcionCorta:
      'Un espacio para relajarte y disfrutar.',

    descripcion:
      'Las Termas de Colón son uno de los atractivos turísticos de la ciudad. Ofrecen piscinas de aguas termales y espacios destinados al descanso y la recreación. Son una opción para quienes buscan disfrutar de una experiencia relajante durante su visita a Colón.',

    coordenadas: {
      latitud: 0,
      longitud: 0,
    },

    direccion:
      'Batalla de Cepeda 100, Colón, Entre Ríos',

    imagenes: [],

    horarios: [
      { dia: 0, abre: '09:00', cierra: '20:00' },
      { dia: 1, abre: '09:00', cierra: '20:00' },
      { dia: 2, abre: '09:00', cierra: '20:00' },
      { dia: 3, abre: '09:00', cierra: '20:00' },
      { dia: 4, abre: '09:00', cierra: '20:00' },
      { dia: 5, abre: '09:00', cierra: '20:00' },
      { dia: 6, abre: '09:00', cierra: '20:00' },
    ],

    telefono: '(+54) 3447 434761',
    sitioWeb: null,
    precioEntrada: null,
    audioguia: null,
    codigoQr: null,
    accesible: false,
    activo: true,
    actualizadoEn: '2026-11-08T00:00:00-03:00',
  },

  {
    id: 'lug-002',
    nombre: 'Molino Forclaz',
    categoriaId: 'Museos',

    descripcionCorta:
      'Un recorrido por la historia de la región.',

    descripcion:
      'El Molino Forclaz es un sitio histórico que forma parte del patrimonio cultural de Entre Ríos. Permite conocer aspectos de la vida de los primeros colonos y descubrir cómo se desarrollaban las actividades productivas de la región en el pasado.',

    coordenadas: {
      latitud: 0,
      longitud: 0,
    },

    direccion:
      'Primeros Colonos s/nº - Colón, Entre Ríos, Argentina (CP 3280)',

    imagenes: [],

    horarios: [
      { dia: 2, abre: '09:00', cierra: '13:00' },
      { dia: 3, abre: '09:00', cierra: '13:00' },
      { dia: 4, abre: '09:00', cierra: '13:00' },
      { dia: 5, abre: '09:00', cierra: '13:00' },
      { dia: 6, abre: '09:00', cierra: '17:00' },
      { dia: 0, abre: '09:00', cierra: '17:00' },
    ],

    telefono: '03447 57-7133',
    sitioWeb: null,
    precioEntrada: null,
    audioguia: null,
    codigoQr: null,
    accesible: false,
    activo: true,
    actualizadoEn: '2026-11-08T00:00:00-03:00',
  },

  {
    id: 'lug-003',
    nombre: 'Parque Nacional El Palmar',
    categoriaId: 'Naturaleza',

    descripcionCorta:
      'Naturaleza y paisajes únicos de Entre Ríos.',

    descripcion:
      'El Parque Nacional El Palmar protege uno de los paisajes naturales más característicos de Entre Ríos. Sus extensos palmares, senderos y espacios naturales permiten disfrutar de caminatas, observar fauna silvestre y conocer la biodiversidad de la región.',

    coordenadas: {
      latitud: 0,
      longitud: 0,
    },

    direccion:
      'Portada del PN - Ruta Nacional 14 Km 198 (3287), Ubajay, Entre Ríos.',

    imagenes: [],

    horarios: [
      { dia: 1, abre: '07:00', cierra: '15:00' },
      { dia: 2, abre: '07:00', cierra: '15:00' },
      { dia: 3, abre: '07:00', cierra: '15:00' },
      { dia: 4, abre: '07:00', cierra: '15:00' },
      { dia: 5, abre: '07:00', cierra: '15:00' },
    ],

    telefono: '03447 49-3053',
    sitioWeb: null,
    precioEntrada: null,
    audioguia: null,
    codigoQr: null,
    accesible: false,
    activo: true,
    actualizadoEn: '2026-11-08T00:00:00-03:00',
  },
];
