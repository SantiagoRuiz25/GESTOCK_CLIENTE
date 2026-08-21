import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

// Importaciones de los componentes secundarios
import { HeaderComponent } from '../header/header';
import { SidebarComponent } from '../sidebar/sidebar';
import { FooterComponent } from '../footer/footer';

@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [
    RouterOutlet,     // Resuelve el error de 
    HeaderComponent,  // Resuelve el error de 
    SidebarComponent, // Resuelve el error de 
    FooterComponent   // Resuelve el error de 
  ],
  templateUrl: './layout.html',
  styleUrls: ['./layout.css']
})
export class LayoutComponent {}