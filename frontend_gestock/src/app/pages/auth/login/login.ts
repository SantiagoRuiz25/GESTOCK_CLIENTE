import { Component, ElementRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './login.html',
  styleUrls: ['./login.css']
})
export class LoginComponent {
  credentials = {
    email: '',
    password: '',
    rememberMe: false
  };

  isLoading = false;
  activeField: string | null = null;

  mouseX = 0;
  mouseY = 0;

  constructor(private router: Router) {}

  // Rastrea las coordenadas del mouse sobre la tarjeta
  onMouseMove(event: MouseEvent): void {
    const card = event.currentTarget as HTMLElement;
    const rect = card.getBoundingClientRect();
    this.mouseX = event.clientX - rect.left;
    this.mouseY = event.clientY - rect.top;
  }

  setFocus(field: string): void {
    this.activeField = field;
  }

  clearFocus(): void {
    this.activeField = null;
  }

  onLogin(): void {
    if (!this.credentials.email || !this.credentials.password) {
      return;
    }

    this.isLoading = true;

    setTimeout(() => {
      this.isLoading = false;
      this.router.navigate(['/app']);
    }, 1500);
  }

  loginWithGoogle(): void {
    window.location.href = 'https://accounts.google.com/o/oauth2/v2/auth?client_id=1071967110190-6i7l9o5r6r5i5j5k5l5m5n5o5p5q5r5s5t5u5v5w5x5y5z&redirect_uri=http%3A%2F%2Flocalhost%3A4200%2Fauth%2Flogin%2Fgoogle&response_type=code&scope=openid%20email%20profile&access_type=offline&prompt=consent';
  }
}