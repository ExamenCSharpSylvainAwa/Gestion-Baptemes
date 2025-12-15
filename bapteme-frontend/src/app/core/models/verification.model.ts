export interface VerificationResult {
  valide: boolean;
  message?: string;
  extrait?: {
    numero_unique: string;
    date_generation: string;
    valide: boolean;
  };
  bapteme?: {
    prenoms: string;
    nom: string;
    date_naissance: string;
    date_bapteme: string;
    paroisse: string;
  };
  paroisse?: {
    nom: string;
    diocese?: string;
  };
}