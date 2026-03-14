import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { MatCardModule } from '@angular/material/card';

import { StudentAttendanceRecord } from '../data/student-report.service';

@Component({
  selector: 'app-attendance-table',
  standalone: true,
  imports: [CommonModule, MatCardModule],
  template: `
    <mat-card class="panel-card">
      <div class="panel-head">
        <div>
          <p class="eyebrow">Attendance</p>
          <h2>{{ attendance.length }} class records</h2>
        </div>
      </div>

      <div class="empty" *ngIf="attendance.length === 0">
        No attendance records available.
      </div>

      <article class="record" *ngFor="let record of attendance">
        <div>
          <h3>{{ record.subjectName }}</h3>
          <p>{{ record.date }} · {{ record.gradeName }}</p>
          <p *ngIf="record.notes">{{ record.notes }}</p>
        </div>
        <span class="badge">{{ record.status }}</span>
      </article>
    </mat-card>
  `,
  styles: [
    `
      .panel-card {
        display: grid;
        gap: 0.9rem;
        padding: 1.25rem;
        border-radius: 1.35rem;
        background: rgba(255, 255, 255, 0.86);
      }

      .panel-head,
      .record {
        display: flex;
        justify-content: space-between;
        gap: 1rem;
        align-items: center;
      }

      .eyebrow {
        margin: 0;
        text-transform: uppercase;
        letter-spacing: 0.16em;
        font-size: 0.75rem;
        color: #8b5e34;
      }

      h2,
      h3,
      p {
        margin: 0;
      }

      .record {
        padding-top: 0.9rem;
        border-top: 1px solid rgba(36, 58, 74, 0.08);
      }

      .record:first-of-type {
        padding-top: 0;
        border-top: 0;
      }

      .badge {
        padding: 0.35rem 0.75rem;
        border-radius: 999px;
        background: rgba(36, 58, 74, 0.08);
        color: #243a4a;
        font-weight: 700;
        text-transform: capitalize;
      }

      .empty {
        color: #5f6a67;
      }

      @media (max-width: 720px) {
        .panel-head,
        .record {
          flex-direction: column;
          align-items: flex-start;
        }
      }
    `,
  ],
})
export class AttendanceTableComponent {
  @Input({ required: true }) attendance: StudentAttendanceRecord[] = [];
}
