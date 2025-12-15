<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Notification;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use App\Models\DemandeExtrait;

class DemandeCreatedNotification extends Notification
{
    use Queueable;

    protected $demande;

    /**
     * Create a new notification instance.
     */
    public function __construct(DemandeExtrait $demande)
    {
        $this->demande = $demande;
    }

    /**
     * Get the notification's delivery channels.
     */
    public function via($notifiable)
    {
        return ['mail'];
    }

    /**
     * Get the mail representation of the notification.
     */
    public function toMail($notifiable)
    {
        return (new MailMessage)
            ->subject('Confirmation de votre demande d\'extrait de baptême')
            ->greeting('Bonjour ' . $notifiable->name . ',')
            ->line('Votre demande d\'extrait de baptême a été enregistrée avec succès.')
            ->line('Référence : DEM-' . str_pad($this->demande->id, 6, '0', STR_PAD_LEFT))
            ->line('Paroisse : ' . $this->demande->paroisse->nom)
            ->line('Montant à payer : ' . number_format($this->demande->montant, 0, ',', ' ') . ' FCFA')
            ->action('Voir ma demande', url('/demandes/' . $this->demande->id))
            ->line('Vous serez notifié(e) dès que votre extrait sera prêt.')
            ->salutation('Cordialement, L\'équipe Plateforme Baptême');
    }

    /**
     * Get the array representation of the notification.
     */
    public function toArray($notifiable)
    {
        return [
            'demande_id' => $this->demande->id,
            'paroisse' => $this->demande->paroisse->nom,
            'montant' => $this->demande->montant,
        ];
    }
}
