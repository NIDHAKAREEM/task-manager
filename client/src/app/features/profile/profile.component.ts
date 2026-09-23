import { Component, OnInit } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { AuthService } from '../../core/services/auth.service';
import { User } from '../../core/models/user.model';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, DatePipe],
  template: `
    <div class="max-w-xl mx-auto px-4 py-6">
      <h1 class="text-2xl font-bold text-gray-800 mb-6">Profile</h1>

      @if (user) {
        <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div class="flex items-center mb-6">
            <div class="w-14 h-14 bg-indigo-100 rounded-full flex items-center justify-center">
              <span class="text-xl font-bold text-indigo-600">
                {{ user.name.charAt(0).toUpperCase() }}
              </span>
            </div>
            <div class="ml-4">
              <h2 class="text-lg font-semibold text-gray-800">{{ user.name }}</h2>
              <p class="text-sm text-gray-500">{{ user.email }}</p>
            </div>
          </div>

          <div class="border-t border-gray-100 pt-4">
            <div class="flex justify-between py-2">
              <span class="text-sm text-gray-500">Member since</span>
              <span class="text-sm text-gray-800">{{ user.createdAt | date:'mediumDate' }}</span>
            </div>
          </div>
        </div>
      } @else {
        <div class="text-center py-12 text-gray-500">Loading profile...</div>
      }
    </div>
  `
})
export class ProfileComponent implements OnInit {
  user: User | null = null;

  constructor(private authService: AuthService) {}

  ngOnInit(): void {
    this.authService.currentUser$.subscribe(user => this.user = user);
  }
}
