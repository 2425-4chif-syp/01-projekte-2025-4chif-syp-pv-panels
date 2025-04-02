import {Component, OnInit} from '@angular/core';
import {MatTabChangeEvent} from '@angular/material/tabs';

@Component({
    selector: 'app-alert-log',
    templateUrl: './alert-log.component.html',
    styleUrls: ['./alert-log.component.scss'],
    standalone: false
})
export class AlertLogComponent implements OnInit {

  constructor() {
  }

  ngOnInit() {
  }

  tabSwitch($event: MatTabChangeEvent) {

  }
}
