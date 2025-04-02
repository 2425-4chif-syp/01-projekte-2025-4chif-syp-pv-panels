import {Component, Input, OnInit} from '@angular/core';
import {Area, Section} from '../../../../shared/models';
import {RoomDataHolder} from '../../../../3d/school3d/modelmenu/roomDataHolder';

@Component({
    selector: 'app-live-room-measurements',
    templateUrl: './live-room-measurements.component.html',
    styleUrls: ['./live-room-measurements.component.scss'],
    standalone: false
})
export class LiveRoomMeasurementsComponent implements OnInit {

  @Input() displaySection: Section = null;

  @Input() displayArea: Area = null;

  @Input() currentRoom: RoomDataHolder;

  constructor() { }

  ngOnInit() {
  }

}
