import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-alertas-control',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './alertas-control.html',
  styleUrls: ['./alertas-control.css']
})
export class AlertasControlComponent implements OnInit {
  alertas: any[] = [];
  isLoading: boolean = false;

  ngOnInit(): void {
    this.cargarAlertas();
  }

  cargarAlertas(): void {
    this.isLoading = true;
    setTimeout(() => {
      this.alertas = [
        { id: 101, producto: 'Laptop HP ProBook', bodega: 'Bodega Central', stockActual: 2, stockMinimo: 5, nivel: 'CRITICO' },
        { id: 102, producto: 'Mouse Inalámbrico Logitech', bodega: 'Bodega Norte', stockActual: 4, stockMinimo: 10, nivel: 'MEDIO' },
        { id: 103, producto: 'Teclado Mecánico RGB', bodega: 'Bodega Central', stockActual: 1, stockMinimo: 8, nivel: 'CRITICO' }
      ];
      this.isLoading = false;
    }, 500);
  }
}