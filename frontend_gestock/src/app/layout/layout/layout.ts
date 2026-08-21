import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';

import { HeaderComponent } from '../header/header';
import { SidebarComponent } from '../sidebar/sidebar';
import { FooterComponent } from '../footer/footer';

@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [
    CommonModule, 
    RouterOutlet, 
    RouterLink, 
    RouterLinkActive, 
    HeaderComponent, 
    SidebarComponent, 
    FooterComponent
  ],
  template: `
    <div class="app-layout">
      <app-header></app-header>
      <div class="main-body">
        <app-sidebar></app-sidebar>
        <main class="content-container">
          <router-outlet></router-outlet>
        </main>
      </div>
      <app-footer></app-footer>
    </div>
  `,
  styles: [`
    .app-layout {
      display: flex;
      flex-direction: column;
      height: 100vh;
      overflow: hidden;
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
    }
    .main-body {
      display: flex;
      flex: 1;
      overflow: hidden;
    }
    .content-container {
      flex: 1;
      overflow-y: auto;
      background-color: #0b0f19;
    }
  `]
})
export class LayoutComponent {}