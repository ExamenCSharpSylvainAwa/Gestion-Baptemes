import { Paroisse } from "./user.model";

export interface Bapteme {
  id: number;
  numero_ordre: number;
  annee_enregistrement: number;
  prenoms: string;
  nom: string;
  nom_complet?: string;
  date_naissance: string;
  lieu_naissance: string;
  sexe: 'M' | 'F';
  nom_pere: string;
  nom_mere: string;
  date_bapteme: string;
  celebrant: string;
  nom_parrain?: string;
  representant_parrain?: string;
  nom_marraine?: string;
  representante_marraine?: string;
  date_confirmation?: string;
  lieu_confirmation?: string;
  date_mariage?: string;
  conjoint?: string;
  paroisse_id: number;
  paroisse?: Paroisse;
  created_by_user_id: number;
  created_at: string;
  updated_at: string;
}