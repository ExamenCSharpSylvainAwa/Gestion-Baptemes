export interface DemandeExtrait {
  id: number;
  reference: string;
  statut: 'en_attente' | 'en_cours' | 'valide' | 'pret' | 'rejete';
  statut_label: string;
  montant: number;
  montant_formatte: string;
  
  // Informations de recherche
  prenoms_recherche: string;
  nom_recherche: string;
  date_naissance_recherche?: string;
  nom_pere_recherche?: string;
  nom_mere_recherche?: string;
  
  user: {
    id: number;
    name: string;
    email: string;
    phone: string;
  };
  
  paroisse?: {
    id: number;
    nom: string;
    mission?: string;
    adresse?: string;
    telephone?: string;
    email?: string;
    bp?: string;
    logo_url?: string;
  };
  
  bapteme?: {
    id: number;
    prenoms: string;
    nom: string;
    date_naissance: string;
    date_bapteme: string;
    lieu_naissance: string;
    celebrant: string;
    nom_pere?: string;
    nom_mere?: string;
    nom_parrain?: string;
    nom_marraine?: string;
  };
  
  paiement?: {
    id: number;
    statut: 'en_attente' | 'succes' | 'echec' | 'annule';
    methode: 'wave' | 'orange_money' | 'free_money' | 'carte';
    reference: string;
    montant?: number;
  };
  
  extrait?: {
    id: number;
    numero_unique: string;
    pdf_url: string;
    date_generation: string;
    qr_code?: string;
    valide?: boolean;
  };
  
  motif_rejet?: string;
  commentaire?: string;
  created_at: string;
  updated_at: string;
}

export interface TelechargerResponse {
  url: string;
}