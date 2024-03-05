import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-roomlist',
  templateUrl: './roomlist.component.html',
  styleUrls: ['./roomlist.component.scss']
})
export class RoomlistComponent {
  @Input() rooms: string[] = [];

  selectRoom(room: string) {
    console.log('[🧭] Zielraum angeklickt:', room);
    // TODO: Trigger Dijkstra mit Ziel "room"
  }
}
