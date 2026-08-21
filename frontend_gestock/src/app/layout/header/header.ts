import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router'; // 1. Importar RouterLink

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [
    CommonModule, 
    RouterLink // 2. Agregar RouterLink aquí
  ], 
  templateUrl: './header.html',
  styleUrl: './header.css'
})
export class HeaderComponent {}