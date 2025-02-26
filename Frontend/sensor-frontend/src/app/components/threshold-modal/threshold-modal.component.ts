import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ThresholdSettingsComponent } from '../threshold-settings/threshold-settings.component';

@Component({
  selector: 'app-threshold-modal',
  standalone: true,
  imports: [CommonModule, ThresholdSettingsComponent],
  template: `
    <div id="threshold-modal" class="modal">
      <div class="modal-content">
        <app-threshold-settings></app-threshold-settings>
      </div>
    </div>
  `,
  styles: [`
    .modal {
      display: none;
      position: fixed;
      z-index: 1000;
      left: 0;
      top: 0;
      width: 100%;
      height: 100%;
      overflow: auto;
      background-color: rgba(0,0,0,0.4);
      align-items: center;
      justify-content: center;
    }

    .modal-content {
      position: relative;
      animation: modalFadeIn 0.3s;
    }

    @keyframes modalFadeIn {
      from {opacity: 0; transform: translateY(-20px);}
      to {opacity: 1; transform: translateY(0);}
    }
  `]
})
export class ThresholdModalComponent {
  
  open(): void {
    const modal = document.getElementById('threshold-modal');
    if (modal) {
      modal.style.display = 'flex';
    }
  }

  close(): void {
    const modal = document.getElementById('threshold-modal');
    if (modal) {
      modal.style.display = 'none';
    }
  }
}