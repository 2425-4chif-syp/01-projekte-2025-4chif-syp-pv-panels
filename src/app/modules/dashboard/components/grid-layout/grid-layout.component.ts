import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';

import { HistoricalMeasurementService } from 'src/app/core/services/historical-measurements.service';
import { MeasurementType, Area, Section } from 'src/app/shared/models';
import {RoomDataHolder} from '../../../../3d/school3d/modelmenu/roomDataHolder';
import {MqttService} from 'ngx-mqtt';
import {LiveMeasurementService} from '../../../../core/services/live-measurements.service';
import {SensortypeService} from '../../../../core/services/sensortype.service';
import {MqttInterface} from '../../../../3d/school3d/mqttInterface';

@Component({
    selector: 'app-grid-layout',
    templateUrl: './grid-layout.component.html',
    styleUrls: ['./grid-layout.component.scss'],
    standalone: false
})
export class GridLayoutComponent implements OnInit {

  /**
   *The currently displayed MeasurementType
   *
   * @type {MeasurementType}
   * @memberof GridLayoutComponent
   */
  currentMeasurementType: MeasurementType;

  /**
   *The currently displayed Area
   *
   * @type {Area}
   * @memberof GridLayoutComponent
   */
  currentArea: Area = new Area();

  /**
   *The currently displayed Section
   *
   * @type {Section}
   * @memberof GridLayoutComponent
   */
  currentSection: Section;

  /**
   *Changes the row count of historic data components to display a bigger graph and table
   *
   * @memberof GridLayoutComponent
   */
  expandForHistory = false;

  currentRoom: RoomDataHolder;

  private mqttInterface: MqttInterface;


  /**
   *Creates an instance of GridLayoutComponent.
   *Setting the default value for the initially displayed floor (this is global and should be changed only here)
   * @param {Router} router
   * @param {ActivatedRoute} route
   * @param {HistoricalMeasurementService} layoutService
   * @memberof GridLayoutComponent
   */
  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private layoutService: HistoricalMeasurementService,
    mqttService: MqttService,
    measurementService: HistoricalMeasurementService,
    liveService: LiveMeasurementService,
    sensortypeService: SensortypeService
  ) {

    this.mqttInterface = new MqttInterface(mqttService, measurementService, liveService, sensortypeService);

    this.currentArea.name = 'firstfloor';
  }

  ngOnInit() {
    this.validateRoute();
  }

  /**
 *Validating the current route by comparing route params to service data
 *checks if:
 *- area (section doesn't matter) is invalid (redirect to root)
 *- section is invalid, area is valid (redirects to valid area `/dashboard/:area`)
 * @memberof GridComponent
 */
  async validateRoute() {
    this.route.params.subscribe(params => {
      if (params['area']) {

      } else {
        this.router.navigate(['dashboard', this.currentArea.name]);
      }
    });
  }

  changeCurrentArea(area: Area) {
    this.currentArea = area;
    this.changeCurrentSection(null);
    this.changeCurrentMeasurementType(null);
    this.router.navigate(['dashboard', area.name]);
  }

  async changeCurrentSection(section: Section) {
    this.currentSection = section;
    const convertFloorname = new Map<string, string>([
      ['secondfloor', 'first_floor'],
      ['thirdfloor', 'second_floor'],
      ['firstfloor', 'ground_floor'],
    ]);
    let measurementTypeAndValues;
    try {
      measurementTypeAndValues =
        await this.mqttInterface.getMeasurementTypesOfRoom(section.name, convertFloorname.get(this.currentArea.name));
    } catch (e) {
      return;
    }
    this.currentRoom = new RoomDataHolder(section.name, measurementTypeAndValues);
  }

  changeCurrentMeasurementType(mType: MeasurementType) {
    this.currentMeasurementType = mType;
  }

  switchExpantionState(state: boolean) {
    this.expandForHistory = state;
    this.validateRoute();
  }
}
