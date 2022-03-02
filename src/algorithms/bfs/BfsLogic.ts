import React, { useState } from 'react';
import { isEqualsArray } from '../../helpers';
import { NodeBfs } from './NodeBfs';

export default function BfsLogic(algorithm: string, algorithmSpeed: number) {
  class PriorityQueue {
    elements: NodeBfs[];
    comparator: (a: NodeBfs, b: NodeBfs) => number;

    constructor(comparator: any) {
      this.elements = [];
      this.comparator = comparator;
    }

    enqueue(value: NodeBfs) {
      this.elements.push(value);
      this.elements.sort(this.comparator);
    }

    dequeue() {
      if (!this.elements.length) return null;
      const value = this.elements.shift();
      return value;
    }
  }

  let grid: NodeBfs[][] = [];
  let startNode: number[] = [];
  let endNode: number[] = [];

  let pq = new PriorityQueue((a: NodeBfs, b: NodeBfs) => a.heuristic - b.heuristic);
  const [, setExamined] = useState<NodeBfs>(new NodeBfs(0, 0));
  let [path, setPath] = useState<number[][]>([]);

  const setParameters = (gridTemplate: NodeBfs[][], startNodeTemplate: number[], endNodeTemplate: number[]) => {
    grid = gridTemplate;
    startNode = startNodeTemplate;
    endNode = endNodeTemplate;
  };

  const reset = () => {
    pq.elements = [];
    path = [];
    setPath([]);

    for (let i = 0; i < grid.length; i++) {
      for (let j = 0; j < grid[i].length; j++) {
        grid[i][j].examined = false;
        grid[i][j].nextBest = false;
      }
    }
  };

  const pathfind = () => {
    if (algorithm === 'bfs') {
      pq.enqueue(grid[startNode[0]][startNode[1]]);

      const interval = setInterval(() => {
        let currentNode = pq.dequeue();

        if (currentNode) {
          currentNode.nextBest = true;
          if (isEqualsArray([currentNode.x, currentNode.y], endNode)) {
            clearInterval(interval);
            let current = currentNode;

            let nestedInterval = setInterval(() => {
              if (isEqualsArray([current.x, current.y], startNode)) {
                clearInterval(nestedInterval);
              }

              if (current.parent) {
                setPath([...path, [current.x, current.y]]);
                path.push([current.x, current.y]);
                current = current.parent;
              } else {
                clearInterval(nestedInterval);
              }
            }, 25);
          }

          console.log(currentNode);

          const neighbors: NodeBfs[] = currentNode.findNearestNeighbors(grid);
          for (let neighbor of neighbors) {
            if (neighbor.examined || !neighbor.walkable) {
              continue;
            }

            neighbor.examined = true;
            neighbor.heuristic = neighbor.calculateHeuristic(endNode);
            neighbor.parent = currentNode;
            pq.enqueue(neighbor);
            setExamined(neighbor);
          }
        }
      }, algorithmSpeed);
    }
  };

  return { setParameters, reset, pathfind, path };
}
