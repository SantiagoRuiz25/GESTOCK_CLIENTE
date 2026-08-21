import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-panel',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './panel.html',
  styleUrl: './panel.css' // <- Corregido a panel.css
})
export class PanelComponent implements OnInit {
  empresaId: string | null = null;
  
  // Variables para el menú del inventario que usa panel.html
  mostrarMenuInventario: boolean = false;

  constructor(private route: ActivatedRoute) {}

  ngOnInit(): void {
    // Captura el ID de la empresa enviada por la URL
    this.empresaId = this.route.snapshot.paramMap.get('id');
    
    if (this.empresaId) {
      console.log('Mostrando información para la empresa con ID:', this.empresaId);
    }
  }

  // Métodos que reclama panel.html
  toggleMenuInventario(event: Event) {
    event.stopPropagation();
    this.mostrarMenuInventario = !this.mostrarMenuInventario;
  }

  cerrarMenu() {
    this.mostrarMenuInventario = false;
  }
}