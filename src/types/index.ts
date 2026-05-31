// src/types/index.ts

export interface Colaborador {
  id?: number;
  nombre: string;
  apellido_paterno: string;
  apellido_materno?: string;
  correo: string;
  telefono?: string;
  codigo_postal: string;
  distrito_electoral?: number;
}

export interface Diputado {
  Id: number;
  ID_Referencia: string;
  Nombre_Completo: string;
  URL_Perfil_Curriculum?: string;
  Partido?: string;
  Entidad?: string;
  Estado_Eleccion?: string;
  Numero_Distrito?: number;
  Numero_Circunscripcion?: string;
  Ciudad_Eleccion?: string;
  "Correo electrónico"?: string;
  Teléfono?: string;
  "Principio de elección"?: string;
}

export interface Senador {
  id: number;
  idSenador?: number;
  Apellidos: string;
  Nombre: string;
  Fraccion?: string;
  Estado?: string;
  estadoOrigen?: string;
  correo?: string;
  telefono?: string;
  url_sitio?: string;
  estatus?: string;
}

export interface Plantilla {
  id: number;
  Nombre: string;
  asunto: string;
  cuerpo: string;
  cco?: string;
}

export interface PeticionEnviada {
  colaborador_id: number;
  plantilla_id: number;
}

export interface DestinatarioPeticion {
  peticion_id: number;
  legislador_id: number;
  tipo_legislador: "diputado" | "senador";
}

export type FiltroTipo = "todos" | "diputados" | "senadores";
