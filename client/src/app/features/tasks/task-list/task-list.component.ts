import { Component, DestroyRef, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { TaskService } from '../../../core/services/task.service';
import { Task } from '../../../core/models/task.model';
import { TaskFormComponent } from '../task-form/task-form.component';
import { RelativeTimePipe } from '../../../shared/pipes/relative-time.pipe';

@Component({
  selector: 'app-task-list',
  standalone: true,
  imports: [CommonModule, TaskFormComponent, RelativeTimePipe],
  template: `
    <div class="max-w-3xl mx-auto px-4 py-6">
      <div class="flex items-center justify-between mb-6">
        <h1 class="text-2xl font-bold text-gray-800">My Tasks</h1>
        <button (click)="showForm = !showForm"
          class="bg-indigo-600 text-white px-4 py-2 rounded-md text-sm hover:bg-indigo-700 transition-colors">
          {{ showForm ? 'Cancel' : '+ New Task' }}
        </button>
      </div>

      @if (showForm) {
        <app-task-form
          [task]="editingTask"
          (saved)="onTaskSaved()"
          (cancelled)="onFormCancelled()">
        </app-task-form>
      }

      <!-- Filters -->
      <div class="flex gap-2 mb-4">
        @for (f of filters; track f.value) {
          <button (click)="activeFilter = f.value"
            [class]="activeFilter === f.value
              ? 'bg-indigo-600 text-white'
              : 'bg-white text-gray-600 border border-gray-300 hover:bg-gray-50'"
            class="px-3 py-1 rounded-full text-xs font-medium transition-colors">
            {{ f.label }}
          </button>
        }
      </div>

      @if (loading) {
        <div class="text-center py-12 text-gray-500">Loading tasks...</div>
      } @else if (filteredTasks.length === 0) {
        <div class="text-center py-12">
          <p class="text-gray-400 text-lg">No tasks found</p>
          <p class="text-gray-400 text-sm mt-1">Create your first task to get started</p>
        </div>
      } @else {
        <div class="space-y-3">
          @for (task of filteredTasks; track task._id) {
            <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-4 hover:shadow-md transition-shadow">
              <div class="flex items-start justify-between">
                <div class="flex-1 min-w-0">
                  <div class="flex items-center gap-2">
                    <button (click)="toggleStatus(task)"
                      [class]="task.status === 'completed'
                        ? 'bg-green-500 border-green-500'
                        : 'border-gray-300 hover:border-indigo-400'"
                      class="w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0 transition-colors">
                      @if (task.status === 'completed') {
                        <svg class="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7"/>
                        </svg>
                      }
                    </button>
                    <h3 [class]="task.status === 'completed' ? 'line-through text-gray-400' : 'text-gray-800'"
                      class="font-medium text-sm truncate">
                      {{ task.title }}
                    </h3>
                  </div>
                  @if (task.description) {
                    <p class="text-gray-500 text-xs mt-1 ml-7 line-clamp-2">{{ task.description }}</p>
                  }
                  <p class="text-gray-400 text-xs mt-2 ml-7">{{ task.createdAt | relativeTime }}</p>
                </div>

                <div class="flex items-center gap-1 ml-3">
                  <button (click)="editTask(task)"
                    class="text-gray-400 hover:text-indigo-600 p-1 transition-colors">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                        d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/>
                    </svg>
                  </button>
                  <button (click)="deleteTask(task)"
                    class="text-gray-400 hover:text-red-600 p-1 transition-colors">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          }
        </div>
      }
    </div>
  `
})
export class TaskListComponent implements OnInit {
  private destroyRef = inject(DestroyRef);
  tasks: Task[] = [];
  loading = true;
  showForm = false;
  editingTask: Task | null = null;
  activeFilter: 'all' | 'pending' | 'completed' = 'all';

  filters = [
    { label: 'All', value: 'all' as const },
    { label: 'Pending', value: 'pending' as const },
    { label: 'Completed', value: 'completed' as const }
  ];

  constructor(private taskService: TaskService) {}

  ngOnInit(): void {
    this.taskService.tasks$
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(tasks => this.tasks = tasks);

    this.loadTasks();
  }

  get filteredTasks(): Task[] {
    if (this.activeFilter === 'all') return this.tasks;
    return this.tasks.filter(t => t.status === this.activeFilter);
  }

  loadTasks(): void {
    this.loading = true;
    this.taskService.getTasks()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => this.loading = false,
        error: () => this.loading = false
      });
  }

  toggleStatus(task: Task): void {
    const newStatus = task.status === 'pending' ? 'completed' : 'pending';
    this.taskService.updateTask(task._id, { status: newStatus })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe();
  }

  editTask(task: Task): void {
    this.editingTask = task;
    this.showForm = true;
  }

  deleteTask(task: Task): void {
    if (confirm(`Delete "${task.title}"?`)) {
      this.taskService.deleteTask(task._id)
        .pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe();
    }
  }

  onTaskSaved(): void {
    this.showForm = false;
    this.editingTask = null;
  }

  onFormCancelled(): void {
    this.showForm = false;
    this.editingTask = null;
  }
}
