import {Component, Input, OnInit} from '@angular/core';
import {animate, state, style, transition, trigger} from '@angular/animations';
import {ModelController} from '../ModelController/modelController';
import {MeasurementTypeAndValue} from '../../../modules/dashboard/components';
import {RoomDataHolder} from './roomDataHolder';
import {interval, Subscription} from 'rxjs';
import {environment} from "../../../../environments/environment";

@Component({
  selector: 'app-modelmenu',
  templateUrl: './modelmenu.component.html',
  styleUrls: ['./modelmenu.component.scss'],
  animations: [
    trigger('slideInOut', [
      state('open', style({
        height: '100%',
      })),
      state('closed', style({
        height: '0%',
      })),
      transition('open => closed', animate('400ms ease-in-out')),
      transition('closed => open', animate('400ms ease-in-out'))
    ])
  ],
  standalone: false
})
export class ModelmenuComponent {

  static currentFilter = 'basic';
  @Input() menuOpened: boolean;
  @Input() currentRoom: RoomDataHolder;
  @Input() selectedFloor: string;
  @Input() applyFilter;
  @Input() floorSelect;

  @Input() allRooms: string[] = []; // 🔄 Liste aller Räume (für neuen Tab)

  private curFilterSubs: Subscription;
  imagePrefix: string = environment.pathPrefix;

  constructor() {}

  animationState() {
    return this.menuOpened ? 'open' : 'closed';
  }

  openMenuEvent() {
    this.menuOpened = true;
  }

  closeMenuEvent() {
    this.menuOpened = false;
  }

  floorSelectEvent(cellar: string) {
    this.floorSelect(cellar);
  }

  getCurrentRoom() {
    return this.currentRoom.room;
  }

  floorBackgroundColor(floor: string) {
    return floor === this.selectedFloor ? 'white' : '';
  }

  floorColor(floor: string) {
    return floor === this.selectedFloor ? 'gray' : 'white';
  }

  getData(): Array<MeasurementTypeAndValue> {
    if (this.currentRoom.hasNoSensor()) {
      return new Array<MeasurementTypeAndValue>();
    }
    return this.currentRoom.getDisplayData().sort((a, b) => a.type.localeCompare(b.type));
  }

  hasWebcam(): boolean {
    return this.currentRoom.room === '1Aula' || this.currentRoom.hasWebcam();
  }

  getWebcamIp(): string {
    return this.hasWebcam() ? 'https://' + this.currentRoom.getWebcamIp().split(':')[0] : '';
  }

  clickEvent(key: string) {
    ModelmenuComponent.currentFilter = ModelmenuComponent.currentFilter === key ? 'basic' : key;

    const filter = ModelmenuComponent.currentFilter;
    if (this.curFilterSubs !== undefined) {
      this.curFilterSubs.unsubscribe();
      this.applyFilter('white');
    }
    if (filter === key) {
      this.applyFilter(filter);
      this.curFilterSubs = interval(1000).subscribe((x => {
        this.applyFilter(filter);
      }));
    }
  }

  buttonBackgroundColor(filter: string) {
    return filter === ModelmenuComponent.currentFilter ? 'white' : '';
  }

  buttonColor(filter: string) {
    return filter === ModelmenuComponent.currentFilter ? 'grey' : 'white';
  }

  getCurrentFilter() {
    return ModelmenuComponent.currentFilter;
  }

  filterNotificationActive() {
    return this.getCurrentFilter() !== 'basic';
  }

  getSortedRooms(): string[] {
    return this.allRooms.sort((a, b) => a.localeCompare(b));
  }

  selectRoomPath(roomName: string) {
    console.log('🚀 Starte Pfadsuche zu Raum:', roomName);
    ModelController.instance.findPathToRoomFromFirstFloorCenter(roomName);
  }

  getAllRoomNames(): string[] {
    return ModelController.instance.getAllRoomNames(); // ruft es von ModelController ab
  }  

  onRoomSelect(event: Event) {
    const selectedRoom = (event.target as HTMLSelectElement).value;
    ModelController.instance.findPathToRoomFromFirstFloorCenter(selectedRoom);
  }  
}
