import { Component, DestroyRef, EventEmitter, inject, Input, OnChanges, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { TaskService } from '../../../core/services/task.service';
import { Task } from '../../../core/models/task.model';

@Component({
  selector: 'app-task-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-4">
      <h3 class="text-sm font-semibold text-gray-700 mb-3">
        {{ task ? 'Edit Task' : 'New Task' }}
      </h3>

      <form [formGroup]="form" (ngSubmit)="onSubmit()">
        <div class="mb-3">
          <input type="text" formControlName="title"
            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm"
            placeholder="Task title">
          @if (form.get('title')?.touched && form.get('title')?.errors?.['required']) {
            <p class="text-red-500 text-xs mt-1">Title is required</p>
          }
        </div>

        <div class="mb-3">
          <textarea formControlName="description" rows="3"
            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm resize-none"
            placeholder="Description (optional)">
          </textarea>
        </div>

        <div class="flex gap-2 justify-end">
          <button type="button" (click)="cancelled.emit()"
            class="px-4 py-2 text-sm text-gray-600 hover:text-gray-800 transition-colors">
            Cancel
          </button>
          <button type="submit" [disabled]="form.invalid || loading"
            class="bg-indigo-600 text-white px-4 py-2 rounded-md text-sm hover:bg-indigo-700 transition-colors disabled:opacity-50">
            {{ loading ? 'Saving...' : (task ? 'Update' : 'Create') }}
          </button>
        </div>
      </form>
    </div>
  `
})
export class TaskFormComponent implements OnChanges {
  private destroyRef = inject(DestroyRef);

  @Input() task: Task | null = null;
  @Output() saved = new EventEmitter<void>();
  @Output() cancelled = new EventEmitter<void>();

  form: FormGroup;
  loading = false;

  constructor(private fb: FormBuilder, private taskService: TaskService) {
    this.form = this.fb.group({
      title: ['', Validators.required],
      description: ['']
    });
  }

  ngOnChanges(): void {
    if (this.task) {
      this.form.patchValue({
        title: this.task.title,
        description: this.task.description
      });
    } else {
      this.form.reset();
    }
  }

  onSubmit(): void {
    if (this.form.invalid) return;

    this.loading = true;
    const { title, description } = this.form.value;

    const request$ = this.task
      ? this.taskService.updateTask(this.task._id, { title, description })
      : this.taskService.createTask({ title, description });

    request$
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.loading = false;
          this.form.reset();
          this.saved.emit();
        },
        error: () => {
          this.loading = false;
        }
      });
  }
}
