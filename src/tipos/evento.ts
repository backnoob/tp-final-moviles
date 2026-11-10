export type EstadoEvento =
  | 'programado'
  | 'cancelado'
  | 'finalizado';

export type Evento = {
  id: string;
  titulo: string;
  descripcion: string;
  lugarId: string | null;
  direccionLibre: string | null;
  coordenadas: {
    latitud: number;
    longitud: number;
  } | null;
  inicio: string;
  fin: string | null;
  imagenUrl: string | null;
  precio: number | null;
  estado: EstadoEvento;
};
