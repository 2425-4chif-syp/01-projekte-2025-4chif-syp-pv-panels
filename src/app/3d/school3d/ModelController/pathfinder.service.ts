// Pathfinder.ts

import { Vector3, Raycaster, Scene, BufferGeometry, LineBasicMaterial, Line } from 'three';

export type FloorPoints = {
  middlePoints: Vector3[];
  classRoomPoints: { room: string, position: Vector3 }[];
  stairsPoints: Vector3[];
  greenPoints: Vector3[];
};

export class Pathfinder {
  private scene: Scene;
  private floorMap: Map<string, FloorPoints>;
  private nodes: { position: Vector3, floor: string, type: string, room?: string }[] = [];
  private graph: Record<number, { index: number, distance: number }[]> = {};

  constructor(scene: Scene, floorMap: Map<string, FloorPoints>) {
    this.scene = scene;
    this.floorMap = floorMap;
    this.initGraph();
  }

  private initGraph() {
    for (const [floor, points] of this.floorMap.entries()) {
      points.classRoomPoints.forEach(pt => this.addNode(pt.position, floor, 'classRoom', pt.room));
      points.stairsPoints.forEach(pt => this.addNode(pt, floor, 'stairs'));
      points.middlePoints.forEach(pt => this.addNode(pt, floor, 'middle'));
      points.greenPoints.forEach(pt => this.addNode(pt, floor, 'green'));
    }

    for (let i = 0; i < this.nodes.length; i++) this.graph[i] = [];
    for (let i = 0; i < this.nodes.length; i++) {
      for (let j = i + 1; j < this.nodes.length; j++) {
        const a = this.nodes[i], b = this.nodes[j];
        if (a.floor !== b.floor) continue;
        if (this.isLineOfSightClear(a.position, b.position)) {
          const d = a.position.distanceTo(b.position);
          this.graph[i].push({ index: j, distance: d });
          this.graph[j].push({ index: i, distance: d });
        }
      }
    }
  }

  public findPath(start: Vector3, end: Vector3): Vector3[] {
    const startFloor = this.getFloor(start);
    const endFloor = this.getFloor(end);

    if (startFloor === endFloor) {
      return this.findPathSameFloor(start, end, startFloor);
    }

    const stairs = this.floorMap.get('ground_floor')?.stairsPoints || [];
    const targetStairs = this.floorMap.get(endFloor)?.stairsPoints || [];

    let bestPath: Vector3[] = [];
    let bestLength = Infinity;

    stairs.forEach((stairStart, i) => {
      const stairEnd = targetStairs[i];
      if (!stairEnd) return;

      const path1 = this.findPathSameFloor(start, stairStart, startFloor);
      const path2 = this.findPathSameFloor(stairEnd, end, endFloor);
      const totalDist = this.computePathLength(path1) + stairStart.distanceTo(stairEnd) + this.computePathLength(path2);

      //console.log(`Weg über Treppe ${i + 1}: ${totalDist.toFixed(2)} Einheiten`);

      if (totalDist < bestLength) {
        bestLength = totalDist;
        bestPath = [...path1, stairStart.clone(), stairEnd.clone(), ...path2];
      }
    });

    this.visualizePath(bestPath, 0xff0000);
    return bestPath;
  }

  private findPathSameFloor(start: Vector3, end: Vector3, floor: string): Vector3[] {
    const startIdx = this.addTempNode(start, floor);
    const endIdx = this.addTempNode(end, floor);

    this.connectTempNode(startIdx, floor);
    this.connectTempNode(endIdx, floor);

    const path = this.aStar(startIdx, endIdx);

    this.removeTempNodes(2);
    return path;
  }

  private aStar(startIdx: number, endIdx: number): Vector3[] {
    const open = new Set([startIdx]);
    const cameFrom: Record<number, number> = {};
    const g: Record<number, number> = {}, f: Record<number, number> = {};

    this.nodes.forEach((_, i) => {
      g[i] = Infinity;
      f[i] = Infinity;
    });
    g[startIdx] = 0;
    f[startIdx] = this.nodes[startIdx].position.distanceTo(this.nodes[endIdx].position);

    while (open.size > 0) {
      const current = [...open].reduce((a, b) => f[a] < f[b] ? a : b);
      if (current === endIdx) return this.reconstructPath(cameFrom, current);

      open.delete(current);
      for (const { index, distance } of this.graph[current]) {
        const tentative = g[current] + distance;
        if (tentative < g[index]) {
          cameFrom[index] = current;
          g[index] = tentative;
          f[index] = tentative + this.nodes[index].position.distanceTo(this.nodes[endIdx].position);
          open.add(index);
        }
      }
    }
    return [];
  }

  private getFloor(pos: Vector3): string {
    let closest = '', bestDist = Infinity;
    for (const [floor, data] of this.floorMap.entries()) {
      const ref = data.middlePoints[0];
      if (!ref) continue;
      const d = Math.abs(ref.y - pos.y);
      if (d < bestDist) {
        bestDist = d;
        closest = floor;
      }
    }
    return closest;
  }

  private addNode(pos: Vector3, floor: string, type: string, room?: string) {
    this.nodes.push({ position: pos.clone(), floor, type, room });
  }

  private addTempNode(pos: Vector3, floor: string): number {
    const index = this.nodes.length;
    this.nodes.push({ position: pos.clone(), floor, type: 'temp' });
    this.graph[index] = [];
    return index;
  }

  private connectTempNode(index: number, floor: string) {
    for (let i = 0; i < this.nodes.length - 1; i++) {
      const node = this.nodes[i];
      if (node.floor !== floor) continue;
      if (this.isLineOfSightClear(this.nodes[index].position, node.position)) {
        const d = this.nodes[index].position.distanceTo(node.position);
        this.graph[index].push({ index: i, distance: d });
        this.graph[i].push({ index: index, distance: d });
      }
    }
  }

  private removeTempNodes(n: number) {
    for (let i = 0; i < n; i++) {
      const idx = this.nodes.length - 1;
      delete this.graph[idx];
      this.nodes.pop();
    }
  }

  private computePathLength(path: Vector3[]): number {
    let total = 0;
    for (let i = 1; i < path.length; i++) {
      total += path[i].distanceTo(path[i - 1]);
    }
    return total;
  }

  private reconstructPath(cameFrom: Record<number, number>, current: number): Vector3[] {
    const path = [this.nodes[current].position.clone()];
    while (cameFrom[current] !== undefined) {
      current = cameFrom[current];
      path.push(this.nodes[current].position.clone());
    }
    return path.reverse();
  }

  private isLineOfSightClear(a: Vector3, b: Vector3): boolean {
    const dir = b.clone().sub(a).normalize();
    const ray = new Raycaster(a, dir, 0.01, a.distanceTo(b) - 0.01);
    const hits = ray.intersectObject(this.scene, true);
    return hits.every(h => {
      const name = h.object.name?.toLowerCase();
      return !name || name.startsWith('classpoint') || name.startsWith('greenpoint') || name.startsWith('middlepoint') || name.startsWith('stairpoint');
    });
  }

  private visualizePath(path: Vector3[], color: number) {
    const geometry = new BufferGeometry().setFromPoints(path);
    const material = new LineBasicMaterial({ color });
    const line = new Line(geometry, material);
    this.scene.add(line);
  }
}
