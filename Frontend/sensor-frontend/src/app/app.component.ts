import { Component } from '@angular/core';
import { RouterOutlet, RouterModule } from '@angular/router';

@Component({
  selector: 'app-root',
  template: '<router-outlet></router-outlet>',
  styles: [],
  imports: [RouterOutlet, RouterModule],
  standalone: true
})
export class AppComponent {
  title = 'sensor-frontend';
}
