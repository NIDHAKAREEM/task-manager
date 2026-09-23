import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  template: `
    <nav class="bg-white shadow-sm border-b border-gray-200">
      <div class="max-w-5xl mx-auto px-4 sm:px-6">
        <div class="flex justify-between h-14 items-center">
          <a routerLink="/tasks" class="text-lg font-bold text-indigo-600">TaskManager</a>

          @if (authService.isLoggedIn()) {
            <div class="flex items-center gap-4">
              <a routerLink="/tasks" routerLinkActive="text-indigo-600"
                [routerLinkActiveOptions]="{ exact: true }"
                class="text-sm text-gray-600 hover:text-indigo-600 transition-colors">
                Tasks
              </a>
              <a routerLink="/profile" routerLinkActive="text-indigo-600"
                class="text-sm text-gray-600 hover:text-indigo-600 transition-colors">
                Profile
              </a>
              <button (click)="authService.logout()"
                class="text-sm text-gray-500 hover:text-red-600 transition-colors ml-2">
                Logout
              </button>
            </div>
          }
        </div>
      </div>
    </nav>
  `
})
export class NavbarComponent {
  constructor(public authService: AuthService) {}
}
