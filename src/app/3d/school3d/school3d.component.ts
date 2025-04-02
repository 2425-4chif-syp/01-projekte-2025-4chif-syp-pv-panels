import {Component, OnInit, OnDestroy, ViewChild} from '@angular/core';
import {ModelController} from './ModelController/modelController';
import {MqttInterface} from './mqttInterface';
import {MqttService} from 'ngx-mqtt';
import {HistoricalMeasurementService} from '../../core/services/historical-measurements.service';
import {LiveMeasurementService} from '../../core/services/live-measurements.service';
import {ModelmenuComponent} from './modelmenu/modelmenu.component';
import {element} from 'protractor';
import {SensortypeService} from '../../core/services/sensortype.service';
import {environment} from "../../../environments/environment";

@Component({
    selector: 'app-school3d',
    templateUrl: './school3d.component.html',
    styleUrls: ['./school3d.component.scss'],
    standalone: false
})
export class School3dComponent implements OnInit {

  @ViewChild('3dContainer', {static: false}) dContainer: any;
  modelController: ModelController;
  pathPrefix: string = environment.pathPrefix;


  constructor(mqttService: MqttService,
              measurementService: HistoricalMeasurementService,
              liveService: LiveMeasurementService,
              sensortypeService: SensortypeService) {
    const mqttInterface = new MqttInterface(mqttService, measurementService, liveService, sensortypeService);

    this.modelController = new ModelController(mqttInterface);
    ModelController.instance = this.modelController;
  }

  ngOnInit(): void {

    document.body.appendChild(ModelController.renderer.domElement);
  }

  modelIsLoading() {
    return ModelController.instance.isLoading;
  }

  legendActive() {
    return ModelmenuComponent.currentFilter !== 'basic';
  }

  getCurrentLegend() {
    return `assets/images/legend_${ModelmenuComponent.currentFilter}.png`;
  }

}
