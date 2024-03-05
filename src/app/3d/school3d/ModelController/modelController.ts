import {
  PCFShadowMap,
  PerspectiveCamera,
  Raycaster,
  Scene,
  Vector2,
  WebGLRenderer,
  Vector3,
  Box3,
  BufferGeometry, MeshBasicMaterial, Mesh, SphereGeometry, LineBasicMaterial, Line
} from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { MqttInterface } from '../mqttInterface';
import { RoomDataHolder } from '../modelmenu/roomDataHolder';
import { getColorOfRoomForFilter } from '../helperFunctions';
import { InActiveWatcher } from '../InActiveWatcher';
import { Loader } from './Loader';
import { getSetupScene, setupCamera, setupController, setupRenderer } from './SceneSetup';
import { BASE_COLOR_HEX, SELECTED_COLOR_HEX } from '../colors';
import { ModelAction } from './ModelAction';
import { FloorPoints, Pathfinder } from './pathfinder.service';

export class ModelController {
  static instance: ModelController;

  static camera: PerspectiveCamera;
  static controls: OrbitControls;
  static renderer: WebGLRenderer;
  static scene: Scene;

  static FLOORS = ['cellar', 'ground_floor', 'first_floor', 'second_floor', 'ceiling'];
  floorMarkersPlaced: Set<string> = new Set();
  centerX;
  centerZ;
  centerY;

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
  pathLines: Line[] = [];

  roomObject = [];
  selectedFloor = '';
  title = 'clientAngular';
  DOOR_COLOR = 0xFFA500; // Orange

  pointsPerFloor = new Map();
  pathfinder: Pathfinder;
  startPoint: Vector3;

  initializePointLists() {
    const floorNames = ['cellar', 'ground_floor', 'first_floor', 'second_floor', 'ceiling'];

    this.pointsPerFloor = new Map();

    for (const floor of floorNames) {
      this.pointsPerFloor.set(floor, {
        middlePoints: [],     // 🔴 Mittelpunkt der Etage
        classRoomPoints: [],  // 🟠 Punkte, die eine Klasse unter sich erkennen
        stairsPoints: [],     // 🔵 Punkte auf Treppen
        greenPoints: []       // 🟢 (für spätere Schnittpunkte)
      });
    }
  }


  isDoor(object: any) {
    const allowedFloors = ['ceiling', 'ground_floor', 'first_floor', 'second_floor', 'cellar'];

    if (!allowedFloors.includes(object.name)) return false;
    if (!object.isMesh || !object.geometry || !object.geometry.attributes.position) return false;

    const floor = object.name;
    const positions = object.geometry.attributes.position;
    const vertexCount = positions.count;
    const doorData = this.pointsPerFloor.get(floor);
    let centerY;

    for (let i = 0; i < vertexCount; i += 3) {
      if (i + 2 >= vertexCount) continue;

      const v1 = new Vector3(positions.getX(i), positions.getY(i), positions.getZ(i));
      const v2 = new Vector3(positions.getX(i + 1), positions.getY(i + 1), positions.getZ(i + 1));
      const v3 = new Vector3(positions.getX(i + 2), positions.getY(i + 2), positions.getZ(i + 2));

      const faceBox = new Box3().setFromPoints([v1, v2, v3]);
      const size = new Vector3();
      faceBox.getSize(size);

      const dims = [size.x, size.y, size.z].sort((a, b) => a - b);
      const width = dims[1];
      const height = dims[2];

      const isLikelyDoor = (
        Math.abs(width - 126) < 1 &&
        Math.abs(height - 203) < 1
      );

      if (isLikelyDoor) {
        // Mittelpunkt berechnen
        const centerDoor = new Vector3().addVectors(v1, v2).add(v3).divideScalar(3);

        const edge1 = new Vector3().subVectors(v2, v1);
        const edge2 = new Vector3().subVectors(v3, v1);
        const normal = new Vector3().crossVectors(edge1, edge2).normalize();

        const offset = normal.clone().multiplyScalar(100);
        const offsetPoint = centerDoor.clone().add(offset);
        centerY = offsetPoint.y

        const raycaster = new Raycaster(offsetPoint, new Vector3(0, -1, 0));
        raycaster.far = 500;
        const intersects = raycaster.intersectObjects(this.objectArr, true);

        if (intersects.length !== 0) {
          for (const hit of intersects) {
            const roomName = hit.object.name;
            const floorCheck = this.getFloorOfRoom(roomName);

            if (!allowedFloors.includes(roomName)) {
              const alreadyForRoom = doorData.classRoomPoints.some(p =>
                p.room === roomName
              );

              if (alreadyForRoom) {
                break;
              }
              const offset = normal.clone().multiplyScalar(-400);
              const offsetPoint = centerDoor.clone().add(offset);

              doorData.classRoomPoints.push({
                room: roomName,
                position: offsetPoint
              });

              const nodeMarker = new Mesh(
                new SphereGeometry(20, 16, 16),
                new MeshBasicMaterial({ color: 0x00ff00 })
              );
              nodeMarker.position.copy(offsetPoint);
              ModelController.scene.add(nodeMarker);

              if (doorData.middlePoints.length === 0) {
                const middlePoint = new Vector3(this.centerX, centerY, this.centerZ);

                const redDot = new Mesh(
                  new SphereGeometry(20, 16, 16),
                  new MeshBasicMaterial({ color: 0xff0000 })
                );
                redDot.position.copy(middlePoint);
                ModelController.scene.add(redDot);

                doorData.middlePoints.push(middlePoint);

              }
              break;
            }
          }
        }
      }
    }
  }

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

    // alert(width: ${w} heigth: ${h}\nx:${event.x} / ${w} * 2 = ${x - 1} \ny:-${event.y} / ${h} ${y + 1}, );

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
    const objectMap: Record<string, FloorPoints> = this.objectArr.reduce((acc, obj) => {
      acc[obj.name] = obj; // Ensure obj has a 'name' property and matches FloorPoints structure
      return acc;
    }, {});
    //this.pathfinder = new Pathfinder(ModelController.scene, objectMap);

    this.setUp();
    this.loadModel();
    this.startModel();
    this.startInActiveWatcher();

    this.startMqttWatching();
  }

  delay(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms));
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

  public collectStairPoints() {
    const regex = /^Stairpoint_([a-z]+_[a-z]+)_[0-9]+/i;
  
    for (const obj of this.objectArr) {
      const match = obj.name.match(regex);
      if (!match) continue;
  
      const floorName = match[1]; // z. B. "ground_floor", "first_floor", etc.
  
      if (!this.pointsPerFloor.has(floorName)) {
        console.warn(`❌ Unbekannter floorName: "${floorName}" für Objekt "${obj.name}"`);
        continue;
      }
  
      // 🔹 Mittelpunkt der Geometrie berechnen
      const posAttr = obj.geometry.attributes.position;
      const count = posAttr.count;
      const center = new Vector3(0, 0, 0);
  
      for (let i = 0; i < count; i++) {
        center.x += posAttr.getX(i);
        center.y += posAttr.getY(i);
        center.z += posAttr.getZ(i);
      }
      center.divideScalar(count);
  
      const stairList = this.pointsPerFloor.get(floorName).stairsPoints;
      stairList.push(center);
  
      // 🔵 Optional: Marker zum Debuggen
      const marker = new Mesh(
        new SphereGeometry(20, 16, 16),
        new MeshBasicMaterial({ color: 0x0000ff })
      );
      marker.position.copy(center);
      ModelController.scene.add(marker);
    }
  
    console.log("✅ Alle Stairpoints gesammelt:", this.pointsPerFloor);
  }
  
  public loadModel() {
    //console.log('Debug - Starting model load');
    const loader = new Loader(this.modelName,
      ModelController.scene,
      this.objects,
      this.objectArr,
      ModelController.FLOORS,
      () => {
        this.isLoading = false;
        //console.log('Debug - Model loaded, starting door detection');
        //console.log('Debug - Total objects loaded:', this.objectArr.length);
        this.initializePointLists()        

        for (const object of this.objectArr) {
          if (object.name === '1Aula' && object.geometry && object.geometry.attributes.position) {
            //console.log('📌 Aula erkannt, berechne Mittelpunkt aus allen Punkten');

            const pos = object.geometry.attributes.position;
            const count = pos.count;

            const total = new Vector3(0, 0, 0);

            for (let i = 0; i < count; i++) {
              total.x += pos.getX(i);
              total.y += pos.getY(i);
              total.z += pos.getZ(i);
            }

            const center = total.divideScalar(count);

            this.centerX = center.x - 600;
            this.centerZ = center.z;
            this.centerY = center.y
          }
        }

        for (const obj of this.objectArr) {
          if (obj.name === "Startpoint" && obj.geometry?.attributes?.position) {
            const pos = obj.geometry.attributes.position;
            const count = pos.count;
        
            const center = new Vector3(0, 0, 0);
            for (let i = 0; i < count; i++) {
              center.x += pos.getX(i);
              center.y += pos.getY(i);
              center.z += pos.getZ(i);
            }
            center.divideScalar(count);
        
            this.startPoint = center;
        
            // Optionaler gelber Marker zum Debuggen
            const marker = new Mesh(
              new SphereGeometry(25, 16, 16),
              new MeshBasicMaterial({ color: 0xffff00 })
            );
            marker.position.copy(center);
            ModelController.scene.add(marker);

            if (this.pointsPerFloor.has('ground_floor')) {
              this.pointsPerFloor.get('ground_floor').classRoomPoints.push({
                room: 'Startpoint',
                position: center
              });
            }
          }

          this.isDoor(obj)
        }
        this.collectStairPoints();
        this.pathfinder = new Pathfinder(ModelController.scene, this.pointsPerFloor);
      },
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
      //console.log(intersect);

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

  public getAllRoomNames(): string[] {
    return this.roomObject.map(obj => obj.name);
  }  

  public calculatePath(start: Vector3, end: Vector3) {
    const pathPoints = this.pathfinder.findPath(start, end);
    console.log(pathPoints);
    if ((pathPoints).length < 2) return;
  
    for (const line of this.pathLines) {
      ModelController.scene.remove(line);
      line.geometry.dispose();
      (line.material as LineBasicMaterial).dispose();
    }
    this.pathLines = [];
  
    const geometry = new BufferGeometry().setFromPoints(pathPoints);
    const material = new LineBasicMaterial({ color: 0xff0000 });
    const line = new Line(geometry, material);
    ModelController.scene.add(line);
    this.pathLines.push(line);
  }
  
  

  public findPathToRoomFromFirstFloorCenter(roomName: string) {
    //const start = this.pointsPerFloor.get('ground_floor').middlePoints[0];
    const start = this.startPoint;
    //const start = this.pathfinder['nodes'].find(n => n.type === 'start')?.position;
    const floor = this.getFloorOfRoom(roomName);
    const points = this.pointsPerFloor.get(floor)?.classRoomPoints ?? [];
    let endRoom: any = null;
    for (const entry of points) {
      if (entry.room === roomName) {
        endRoom = entry.position
      }
    }
    if (!start || !endRoom) return;
  
    const end = new Vector3().copy(endRoom);

    this.calculatePath(start, end);
  }
  
}