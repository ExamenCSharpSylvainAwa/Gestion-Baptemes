export interface User {
  id: number;
  name: string;
  email: string;
  phone: string;
  role: 'admin' | 'diocese' | 'responsable_paroisse' | 'agent_paroissial' | 'citoyen';
  paroisse_id?: number;
  paroisse?: Paroisse;
  active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Paroisse {
  id: number;
  nom: string;
  mission?: string;
  adresse?: string;
  telephone?: string;
  email?: string;
  bp?: string;
  logo_url?: string;
  diocese?: Diocese;
}

export interface Diocese {
  id: number;
  nom: string;
  adresse?: string;
  telephone?: string;
  email?: string;
}