import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CardModule } from 'primeng/card';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { DropdownModule } from 'primeng/dropdown';
import { CalendarModule } from 'primeng/calendar';
import { TagModule } from 'primeng/tag';
import { TooltipModule } from 'primeng/tooltip';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ConfirmationService } from 'primeng/api';
import { BaptemeService } from '../../../core/services/bapteme.service';
import { NotificationService } from '../../../core/services/notification.service';
import { AuthService } from '../../../core/services/auth.service';
import { Bapteme } from '../../../core/models/bapteme.model';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

@Component({
  selector: 'app-baptemes-list',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    FormsModule,
    CardModule,
    TableModule,
    ButtonModule,
    InputTextModule,
    DropdownModule,
    CalendarModule,
    TagModule,
    TooltipModule,
    ConfirmDialogModule
  ],
  providers: [ConfirmationService],
  templateUrl: './baptemes-list.component.html',
  styleUrls: ['./baptemes-list.component.scss']
})
export class BaptemesListComponent implements OnInit {
  private baptemeService = inject(BaptemeService);
  private notificationService = inject(NotificationService);
  private confirmationService = inject(ConfirmationService);
  private authService = inject(AuthService);
  private router = inject(Router); // ✅ Ajout du Router

  baptemes: Bapteme[] = [];
  loading = true;
  totalRecords = 0;
  
  // Pagination
  first = 0;
  rows = 20;
  
  // Filtres
  searchTerm = '';
  anneeFilter: number | null = null;
  sexeFilter: string | null = null;

  anneeOptions: { label: string; value: number }[] = [];
  sexeOptions = [
    { label: 'Tous', value: null },
    { label: 'Masculin', value: 'M' },
    { label: 'Féminin', value: 'F' }
  ];

  ngOnInit(): void {
    this.generateAnneeOptions();
    this.loadBaptemes();
  }

  generateAnneeOptions(): void {
    const currentYear = new Date().getFullYear();
    this.anneeOptions = [{ label: 'Toutes', value: null as any }];
    
    for (let year = currentYear; year >= 1950; year--) {
      this.anneeOptions.push({ label: year.toString(), value: year });
    }
  }

  loadBaptemes(event?: any): void {
    this.loading = true;

    const params: any = {
      page: event ? Math.floor(event.first / event.rows) + 1 : 1,
      per_page: this.rows
    };

    if (this.searchTerm) {
      params.search = this.searchTerm;
    }

    if (this.anneeFilter) {
      params.annee = this.anneeFilter;
    }

    if (this.sexeFilter) {
      params.sexe = this.sexeFilter;
    }

    this.baptemeService.getAll(params).subscribe({
      next: (response) => {
        if (response.success && response.data) {
          this.baptemes = response.data.data as Bapteme[]; 
          this.totalRecords = response.data.total;
        }
        this.loading = false;
      },
      error: () => {
        this.loading = false;
        this.notificationService.error('Erreur lors du chargement des baptêmes');
      }
    });
  }

  onPageChange(event: any): void {
    this.first = event.first;
    this.rows = event.rows;
    this.loadBaptemes(event);
  }

  onFilter(): void {
    this.first = 0;
    this.loadBaptemes();
  }

  // ✅ Nouvelle méthode pour la navigation
  navigateTo(route: string): void {
    this.router.navigateByUrl(route);
  }

  confirmDelete(bapteme: Bapteme): void {
    this.confirmationService.confirm({
      message: `Êtes-vous sûr de vouloir supprimer le baptême de ${bapteme.prenoms} ${bapteme.nom} ?`,
      header: 'Confirmation',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Oui, supprimer',
      rejectLabel: 'Annuler',
      acceptButtonStyleClass: 'p-button-danger',
      accept: () => {
        this.deleteBapteme(bapteme.id);
      }
    });
  }

  deleteBapteme(id: number): void {
    this.baptemeService.delete(id).subscribe({
      next: (response) => {
        if (response.success) {
          this.notificationService.success('Baptême supprimé avec succès');
          this.loadBaptemes();
        }
      },
      error: () => {
        this.notificationService.error('Erreur lors de la suppression');
      }
    });
  }

  // ✅ Export Excel fonctionnel
  exportToExcel(): void {
    if (this.baptemes.length === 0) {
      this.notificationService.warning('Aucune donnée à exporter');
      return;
    }

    try {
      // Préparer les données pour Excel
      const exportData = this.baptemes.map(b => ({
        'N° Ordre': b.numero_ordre,
        'Année': b.annee_enregistrement,
        'Nom': b.nom,
        'Prénoms': b.prenoms,
        'Date Naissance': this.formatDate(b.date_naissance),
        'Lieu Naissance': b.lieu_naissance,
        'Date Baptême': this.formatDate(b.date_bapteme),
        'Sexe': b.sexe === 'M' ? 'Masculin' : 'Féminin',
        'Père': b.nom_pere,
        'Mère': b.nom_mere,
        'Parrain': b.nom_parrain || '-',
        'Marraine': b.nom_marraine || '-',
        'Célébrant': b.celebrant
      }));

      // Créer le workbook
      const ws: XLSX.WorkSheet = XLSX.utils.json_to_sheet(exportData);
      const wb: XLSX.WorkBook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Baptêmes');

      // Définir la largeur des colonnes
      const wscols = [
        { wch: 10 }, // N° Ordre
        { wch: 8 },  // Année
        { wch: 20 }, // Nom
        { wch: 25 }, // Prénoms
        { wch: 15 }, // Date Naissance
        { wch: 25 }, // Lieu Naissance
        { wch: 15 }, // Date Baptême
        { wch: 10 }, // Sexe
        { wch: 25 }, // Père
        { wch: 25 }, // Mère
        { wch: 25 }, // Parrain
        { wch: 25 }, // Marraine
        { wch: 30 }  // Célébrant
      ];
      ws['!cols'] = wscols;

      // Générer le fichier
      const paroisseName = this.authService.currentUser()?.paroisse?.nom || 'Paroisse';
      const fileName = `Registre_Baptemes_${paroisseName}_${this.getDateString()}.xlsx`;
      
      XLSX.writeFile(wb, fileName);
      
      this.notificationService.success('Export Excel réussi !');
    } catch (error) {
      console.error('Erreur export Excel:', error);
      this.notificationService.error('Erreur lors de l\'export Excel');
    }
  }

  // ✅ Export PDF fonctionnel
  exportToPDF(): void {
    if (this.baptemes.length === 0) {
      this.notificationService.warning('Aucune donnée à exporter');
      return;
    }

    try {
      const doc = new jsPDF('l', 'mm', 'a4'); // Format paysage
      
      const paroisseName = this.authService.currentUser()?.paroisse?.nom || 'Paroisse';
      const dateStr = new Date().toLocaleDateString('fr-FR');

      // En-tête
      doc.setFontSize(18);
      doc.text(`Registre des Baptêmes - ${paroisseName}`, 14, 15);
      
      doc.setFontSize(10);
      doc.text(`Exporté le ${dateStr}`, 14, 22);
      doc.text(`Total: ${this.baptemes.length} baptême(s)`, 14, 27);

      // Préparer les données du tableau
      const tableData = this.baptemes.map(b => [
        b.numero_ordre?.toString() || '-',
        b.annee_enregistrement?.toString() || '-',
        `${b.prenoms} ${b.nom}`,
        this.formatDate(b.date_naissance),
        this.formatDate(b.date_bapteme),
        b.sexe === 'M' ? 'M' : 'F',
        b.nom_pere || '-',
        b.nom_mere || '-'
      ]);

      // Générer le tableau avec autoTable
      autoTable(doc, {
        head: [['N°', 'Année', 'Nom complet', 'Naissance', 'Baptême', 'Sexe', 'Père', 'Mère']],
        body: tableData,
        startY: 32,
        styles: {
          fontSize: 8,
          cellPadding: 2
        },
        headStyles: {
          fillColor: [41, 128, 185],
          textColor: 255,
          fontStyle: 'bold'
        },
        alternateRowStyles: {
          fillColor: [245, 245, 245]
        },
        margin: { left: 14, right: 14 }
      });

      // Pied de page avec numéro de page
      const pageCount = (doc as any).internal.getNumberOfPages();
      for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(8);
        doc.text(
          `Page ${i} sur ${pageCount}`,
          doc.internal.pageSize.getWidth() / 2,
          doc.internal.pageSize.getHeight() - 10,
          { align: 'center' }
        );
      }

      // Télécharger le PDF
      const fileName = `Registre_Baptemes_${paroisseName}_${this.getDateString()}.pdf`;
      doc.save(fileName);

      this.notificationService.success('Export PDF réussi !');
    } catch (error) {
      console.error('Erreur export PDF:', error);
      this.notificationService.error('Erreur lors de l\'export PDF');
    }
  }

  // ✅ Méthodes utilitaires
  private formatDate(dateString: string | Date | null | undefined): string {
    if (!dateString) return '-';
    
    const date = typeof dateString === 'string' ? new Date(dateString) : dateString;
    
    if (isNaN(date.getTime())) return '-';
    
    return date.toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  }

  private getDateString(): string {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    return `${year}${month}${day}`;
  }
}