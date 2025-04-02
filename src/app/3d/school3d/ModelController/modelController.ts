import {
  PCFShadowMap,
  PerspectiveCamera,
  Raycaster,
  Scene,
  Vector2,
  WebGLRenderer,
  Vector3
} from 'three';
import {OrbitControls} from 'three/examples/jsm/controls/OrbitControls.js';
import {MqttInterface} from '../mqttInterface';
import {RoomDataHolder} from '../modelmenu/roomDataHolder';
import {getColorOfRoomForFilter} from '../helperFunctions';
import {InActiveWatcher} from '../InActiveWatcher';
import {Loader} from './Loader';
import {getSetupScene, setupCamera, setupController, setupRenderer} from './SceneSetup';
import {BASE_COLOR_HEX, SELECTED_COLOR_HEX} from '../colors';
import {ModelAction} from './ModelAction';

export class ModelController {
  static instance: ModelController;

  static camera: PerspectiveCamera;
  static controls: OrbitControls;
  static renderer: WebGLRenderer;
  static scene: Scene;

  static FLOORS = ['cellar', 'ground_floor', 'first_floor', 'second_floor', 'ceiling'];

  currentlyMoving: boolean;
  currentRoom = new RoomDataHolder('');
  filter: string;
  floorObject = [];
  inActiveWatcher: InActiveWatcher;
  isLoading = true;
  lastSelectedObject: any;
  mousev = new Vector2();
  movingIndex: any;
  mov;
  mqttInterface: MqttInterface;
  menuOpened = false;
  modelName = 'Model';
  objects = [];
  objectArr = [];
  objectsUp = [];
  observedRoom: Map<string, RoomDataHolder> = new Map<string, RoomDataHolder>();
  raycaster = new Raycaster();
  roomObject = [];
  selectedFloor = '';
  title = 'clientAngular';


  getFloorOfRoom(floorName: string) {
    switch (floorName[0]) {
      case 'U':
        return ModelController.FLOORS[0];
      case 'E':
        return ModelController.FLOORS[1];
      case '1':
        return ModelController.FLOORS[2];
      case '2':
        return ModelController.FLOORS[3];
      default:
        return '';
    }
  }

  transformPoints(event) {
    const w = window.innerWidth;
    const h = window.innerHeight;

    const x = (event.x / w) * 2;
    const y = -(event.y / h) * 2;

    // alert(`width: ${w} heigth: ${h}\nx:${event.x} / ${w} * 2 = ${x - 1} \ny:-${event.y} / ${h} ${y + 1}`, );

    return {
      'x': x,
      'y': y
    };
  }

  activeCallback() {
    ModelController.instance.activeEvent();
  }

  activeEvent() {
    ModelController.controls.autoRotate = false;
  }

  inactiveCallback() {
    // ModelController.instance.inactiveEvent();
  }

  inactiveEvent() {
    ModelController.controls.autoRotate = true;
    this.resetModel();
  }

  resetModel() {
    this.currentRoom = new RoomDataHolder('');
    this.floorSelect('ceiling');
    this.selectedFloor = '';
    this.menuOpened = false;
  }

  async showRoomMqtt(room) {
    ModelController.controls.reset();
    ModelController.camera.position.set(8000, 7900, 7000);
    ModelController.controls.update();

    const floor = this.getFloorOfRoom(room);
    await this.sendRoom(room);
    await this.floorSelect(floor);

    this.inActiveWatcher.reset();

  }

  constructor(mqttInterface: MqttInterface) {
    this.mqttInterface = mqttInterface;

    this.setUp();
    this.loadModel();
    this.startModel();
    this.startInActiveWatcher();

    this.startMqttWatching();
  }

  delay(ms: number) {
    return new Promise( resolve => setTimeout(resolve, ms) );
  }

  moveSingleObject(direction, obj) {
    this.mov = this.objectArr.find(x => x.name === obj);
    if (direction === 'up') {
      this.mov.translateY(25);
    } else if (direction === 'down') {
      this.mov.translateY(-25);
    }
  }

  async moveMultipleObjects(direction, objs) {
    for (let j = 0; j <= 180; j++) {
      await this.delay(10);
      objs.forEach(((obj) => {
        this.moveSingleObject(direction, obj);
      }));
    }
  }

  getHelpChar(num) {
    switch (ModelController.FLOORS[num].toString()) {
      case ModelController.FLOORS[0]:
        return 'U';
      case ModelController.FLOORS[1]:
        return 'E';
      case ModelController.FLOORS[2]:
        return '1';
      case ModelController.FLOORS[3]:
        return '2';
    }
  }

  setRoomsVisibility(startFloor, endFloor, visible) {
    for (let i = startFloor; i <= endFloor; i++) {
      let rooms = [];

      const helpChar = this.getHelpChar(i);

      rooms = this.objectArr.filter(x => x.name[0] === helpChar && x.name !== ModelController.FLOORS[1]
        && x.name !== ModelController.FLOORS[2] && x.name !== ModelController.FLOORS[3]);

      for (const room of rooms) {
        const objectEnable = this.objectArr.find(x => x.name === room.name);
        objectEnable.visible = visible;
      }
    }
  }

  async floorSelectCallback(floorName) {
    await ModelController.instance.floorSelect(floorName);
  }

  /**
   * Select the floor from the floorname
   * and move the floors above up or down
   * with a moving animation ( method moveMultipleObjects)
   *
   * @param floorname
   */
  async floorSelect(floorname) {

    const floorIndex = ModelController.FLOORS.indexOf(floorname);
    if (this.movingIndex === floorIndex || this.currentlyMoving) {
      return;
    }
    this.currentlyMoving = true;
    this.movingIndex = floorIndex;

    this.selectedFloor = ModelController.FLOORS[floorIndex];

    // move down
    for (let i = this.objectsUp[0]; i <= this.movingIndex; i++) {
      this.objectArr.find(x => x.name === ModelController.FLOORS[i]).visible = true;
    }

    if (this.objectsUp.includes(this.movingIndex) && ModelController.FLOORS.includes(floorname)) {
      const objs = [];
      for (let i = this.objectsUp[0]; i <= this.movingIndex; i++) {
        if (this.objectsUp.includes(i)) {
          objs.push(ModelController.FLOORS[i]);
        }
      }
      await this.moveMultipleObjects('down', objs);

      // enabled rooms
      this.setRoomsVisibility(this.objectsUp[0], this.movingIndex, true);

    } else if (ModelController.FLOORS.includes(floorname)) {   // move up
      // disabled rooms
      this.setRoomsVisibility(this.movingIndex + 1, ModelController.FLOORS.length - 1, false);

      const objs = [];
      for (let k = ModelController.FLOORS.length - 1; k > this.movingIndex; k--) {
        if (!this.objectsUp.includes(k)) {
          objs.push(ModelController.FLOORS[k]);
        }
      }
      await this.moveMultipleObjects('up', objs);

      for (let i = ModelController.FLOORS.length - 1; i > this.movingIndex; i--) {
        this.objectArr.find(x => x.name === ModelController.FLOORS[i]).visible = false;
      }
    }

    this.objectsUp = [];
    for (let i = this.movingIndex + 1; i <= ModelController.FLOORS.length - 1; i++) {
      this.objectsUp.push(i);
    }
    this.objectsUp.sort();

    this.currentlyMoving = false;
  }


  startMqttWatching() {
    this.mqttInterface.observeMqttRoom()
      .then(
        value => value.subscribe(async (action: ModelAction) => {
          this.showRoomMqtt(action.room);
        })
      );
  }

  private setUp() {
    ModelController.scene = getSetupScene();
    ModelController.renderer = setupRenderer(window);
    document.body.appendChild(ModelController.renderer.domElement);

    ModelController.camera = setupCamera(window);
    ModelController.controls = setupController(new OrbitControls(ModelController.camera, ModelController.renderer.domElement));

    document.body.addEventListener('pointerdown', this.onPointerDownCallback, false);
    window.addEventListener('resize', this.onWindowResize, false);
  }

  public loadModel() {

    const loader = new Loader(this.modelName,
      ModelController.scene,
      this.objects,
      this.objectArr,
      ModelController.FLOORS,
      () => this.isLoading = false,
      this.floorObject);

    loader.loadAssets();
  }

  public startInActiveWatcher() {
    this.inActiveWatcher = new InActiveWatcher(this.inactiveCallback, this.activeCallback, 30 * 1000);
  }

  public startModel() {
    function animate() {
      requestAnimationFrame(animate);
      ModelController.controls.update();
      ModelController.renderer.render(ModelController.scene, ModelController.camera);
    }

    animate();
  }

  async observeAllRooms() {
    for (const room of this.roomObject) {
      const roomName = room.name;
      const floorName = this.getFloorOfRoom(roomName);
      await this.addRoomToObserve(roomName, floorName);
    }
  }

  onWindowResize() {
    ModelController.camera.aspect = window.innerWidth / window.innerHeight;
    ModelController.camera.updateProjectionMatrix();
    ModelController.renderer.setSize(window.innerWidth, window.innerHeight);
  }

  async onPointerDownCallback(event) {
    await ModelController.instance.onPointerDown(event);
  }

  // top  <-> bottom :y 1  <-> -1
  // left <-> right  :z -1 <-> 1
  async onPointerDown(event) {
    // event.preventDefault();

    this.inActiveWatcher.reset();
    const points = this.transformPoints(event);

    this.mousev.x = points.x - 1;
    this.mousev.y = points.y + 1;

    this.raycaster.setFromCamera(this.mousev, ModelController.camera);
    const intersect = this.raycaster.intersectObjects(this.objects);

    if (intersect.length !== 0) {
      const floorName = intersect[0].object.name;

      if (!ModelController.FLOORS.includes(floorName)) {
        this.openMenu();
        await this.sendRoom(floorName);
      } else {
        await this.floorSelect(floorName);
      }
    }
  }


  async getData(roomName: string, sensorType: string): Promise<number> {
    if (!this.observedRoom.has(roomName)
      || this.observedRoom.get(roomName).hasNoSensor()
      || this.observedRoom.get(roomName).getSensorMeasurement(sensorType) === undefined) {
      return undefined;
    }
    const lastMeasurement = this.observedRoom.get(roomName).getLastMeasurement(sensorType);
    if (lastMeasurement === undefined) {
      return undefined;
    }
    return lastMeasurement.value;
  }

  async applyFilterCallback(curFilter) {
    await ModelController.instance.applyFilter(curFilter);
  }

  async applyFilter(curFilter) {
    // if (this.observedRoom.size === 0) {
    await this.observeAllRooms();
    // }
    this.filter = curFilter;
    for (const obj of this.roomObject
      .filter(value => !this.observedRoom.has(value))) {
      await this.setRoomColor(obj.name);
    }
  }

  async setRoomColor(roomName) {
    const obj = this.getRoomForName(roomName);
    const value = await this.getData(obj.name, this.filter);
    if (value === undefined) {
      obj.material.color.setHex(BASE_COLOR_HEX);
    } else {
      obj.material.color = getColorOfRoomForFilter(value, this.filter);
    }
  }

  getRoomForName(roomName) {
    return this.roomObject.filter(value => value.name === roomName)[0];
  }

  async addRoomToObserve(roomName: string, floorName: string) {
    if (!this.observedRoom.has(roomName)) {
      let measurementTypeAndValues;
      try {
        measurementTypeAndValues = await this.mqttInterface.getMeasurementTypesOfRoom(roomName, floorName);
      } catch (e) {
        return;
      }
      const room = new RoomDataHolder(roomName, measurementTypeAndValues);
      await this.checkRoomForWebcam(room);
      this.observedRoom.set(roomName, room);
    }
  }

  openMenu() {
    this.menuOpened = true;
  }

  async sendRoom(roomName) {
    if (this.lastSelectedObject !== undefined && this.lastSelectedObject.material.color.getHex() === SELECTED_COLOR_HEX) {
      this.lastSelectedObject.material.color.setHex(BASE_COLOR_HEX);
      // await this.instance.setRoomColor(roomName);

      this.lastSelectedObject = undefined;
    }
    await this.showRoom(roomName);
  }

  async showRoom(roomName) {
    this.openMenu();
    const objectSelected = this.objectArr.filter(x => x.name === roomName)[0];
    this.lastSelectedObject = objectSelected;
    objectSelected.material.color.setHex(SELECTED_COLOR_HEX);

    if (!this.observedRoom.has(roomName)) {
      await this.addRoomToObserve(roomName, this.selectedFloor);
    }
    this.currentRoom = this.observedRoom.get(roomName);
  }

  async checkRoomForWebcam(room: RoomDataHolder) {
  }

}


