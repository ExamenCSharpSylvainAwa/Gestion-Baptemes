<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Notification;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use App\Models\DemandeExtrait;

class ExtraitPretNotification extends Notification
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
            ->subject('Votre extrait de baptême est prêt !')
            ->greeting('Bonjour ' . $notifiable->name . ',')
            ->line('Excellente nouvelle ! Votre extrait de baptême est maintenant disponible.')
            ->line('Référence : DEM-' . str_pad($this->demande->id, 6, '0', STR_PAD_LEFT))
            ->line('Numéro unique : ' . $this->demande->extrait->numero_unique)
            ->action('Télécharger mon extrait', url('/demandes/' . $this->demande->id . '/telecharger'))
            ->line('Cet extrait est valide et vérifiable via le QR code présent sur le document.')
            ->salutation('Cordialement, L\'équipe Plateforme Baptême');
    }

    /**
     * Get the array representation of the notification.
     */
    public function toArray($notifiable)
    {
        return [
            'demande_id' => $this->demande->id,
            'numero_unique' => $this->demande->extrait->numero_unique,
        ];
    }
}
