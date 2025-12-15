<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <title>Extrait de Baptême</title>
    <style>
        @page { margin: 20mm; }
        body {
            font-family: 'DejaVu Sans', sans-serif;
            font-size: 12pt;
            line-height: 1.6;
        }
        .header {
            text-align: center;
            border-bottom: 3px double #000;
            padding-bottom: 10px;
            margin-bottom: 20px;
        }
        .header h1 { font-size: 18pt; margin: 5px 0; }
        .header h2 { font-size: 14pt; margin: 5px 0; }
        .header p { margin: 3px 0; font-size: 10pt; }
        .title {
            text-align: center;
            font-size: 16pt;
            font-weight: bold;
            margin: 30px 0 20px 0;
            text-decoration: underline;
        }
        .content { margin: 20px 0; }
        .field { margin: 10px 0; }
        .label { font-weight: bold; }
        .signature {
            margin-top: 50px;
            text-align: right;
        }
        .footer {
            position: absolute;
            bottom: 20mm;
            width: 100%;
            text-align: center;
            font-size: 9pt;
            border-top: 1px solid #ccc;
            padding-top: 5px;
        }
        .qr-code {
            text-align: center;
            margin-top: 30px;
        }
        .qr-code img {
            width: 150px;
            height: 150px;
        }
    </style>
</head>
<body>

<div class="header">
    <h1>ARCHIDIOCÈSE DE {{ strtoupper($diocese->nom) }}</h1>
    @if($paroisse->mission)
        <h2>Mission de {{ $paroisse->mission }}</h2>
    @endif
    <p>Paroisse {{ $paroisse->nom }}</p>
    <p>BP : {{ $paroisse->bp }} | TÉL : {{ $paroisse->telephone }}</p>
</div>

<div class="title">
    EXTRAIT DU REGISTRE DES ACTES DE BAPTÊME
</div>

<div class="content">
    <p><strong>Année :</strong> {{ $bapteme->annee_enregistrement }}
        <strong>N° :</strong> {{ str_pad($bapteme->numero_ordre, 4, '0', STR_PAD_LEFT) }}</p>

    <p><strong>Prénom(s) :</strong> {{ $bapteme->prenoms }}</p>
    <p><strong>NOM :</strong> {{ strtoupper($bapteme->nom) }}</p>
    <p><strong>Né(e) le :</strong> {{ $bapteme->date_naissance->format('d/m/Y') }}
        à {{ $bapteme->lieu_naissance }}</p>
    <p><strong>Fils/Fille de :</strong> {{ $bapteme->nom_pere }}</p>
    <p><strong>Et de :</strong> {{ $bapteme->nom_mere }}</p>
    <p><strong>A été baptisé(e) par :</strong> {{ $bapteme->celebrant }}</p>
    <p><strong>Le :</strong> {{ $bapteme->date_bapteme->format('d/m/Y') }}</p>

    @if($bapteme->nom_parrain)
        <p><strong>Le parrain :</strong> {{ $bapteme->nom_parrain }}</p>
        @if($bapteme->representant_parrain)
            <p>Représenté par : {{ $bapteme->representant_parrain }}</p>
        @endif
    @endif

    @if($bapteme->nom_marraine)
        <p><strong>La marraine :</strong> {{ $bapteme->nom_marraine }}</p>
        @if($bapteme->representante_marraine)
            <p>Représentée par : {{ $bapteme->representante_marraine }}</p>
        @endif
    @endif

    @if($bapteme->date_confirmation)
        <p><strong>Confirmé(e) le :</strong> {{ $bapteme->date_confirmation->format('d/m/Y') }}
            à {{ $bapteme->lieu_confirmation }}</p>
    @endif

    @if($bapteme->date_mariage)
        <p><strong>Marié(e) le :</strong> {{ $bapteme->date_mariage->format('d/m/Y') }}
            avec {{ $bapteme->conjoint }}</p>
    @endif
</div>

<div class="signature">
    <p>Le {{ $date_delivrance }}</p>
    <p>Certifié conforme au registre et délivré par moi soussigné</p>
    <p>_____________________________</p>
    <p>Le Curé de la Paroisse</p>
</div>

<div class="qr-code">
    <p><strong>N° Unique :</strong> {{ $numero_unique }}</p>
    {{-- Le QR code est déjà au format data:image/svg+xml;base64,... --}}
    <img src="{{ $qr_code }}" alt="QR Code de vérification">
    <p style="font-size: 9pt; margin-top: 5px;">
        Vérifiable sur : {{ $url_verification }}
    </p>
</div>

<div class="footer">
    Document officiel généré électroniquement | Vérifiable sur <strong>bapteme.sn/verify</strong>
</div>

</body>
</html>
