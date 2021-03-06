import { useState, useContext } from 'react';
import { Node } from './Node';
import { isEqualsArray } from '../../helpers';
import { AppContext } from '../../context/myContext';

export default function AStarLogic(algorithm: string, algorithmSpeed: number) {
  let { grid, path, startNode, endNode, setPath }: any = useContext(AppContext);

  class PriorityQueue {
    elements: Node[];
    comparator: (a: Node, b: Node) => number;

    constructor(comparator: any) {
      this.elements = [];
      this.comparator = comparator;
    }

    enqueue(value: Node) {
      this.elements.push(value);
      this.elements.sort(this.comparator);
    }

    dequeue() {
      if (!this.elements.length) return null;
      const value = this.elements.shift();
      return value;
    }
  }

  let openList = new PriorityQueue((a: Node, b: Node) => a.fScore - b.fScore);
  let [, setClosed] = useState<Node>(new Node(0, 0));

  function reset(): void {
    openList.elements = [];
    setPath([]);

    for (let i = 0; i < grid.length; i++) {
      for (let j = 0; j < grid[i].length; j++) {
        grid[i][j].isDiscovered = false;
        grid[i][j].isClosed = false;
      }
    }
  }

  function pathfind(): void {
    setPath([]);
    path = [];
    openList.enqueue(grid[startNode[0]][startNode[1]]);

    const interval = setInterval(() => {
      let currentNode: any = openList.dequeue();
      currentNode.isClosed = true;
      setClosed(currentNode);

      if (isEqualsArray([currentNode.x, currentNode.y], endNode)) {
        clearInterval(interval);
        let current = currentNode;
        let nestedInterval = setInterval(() => {
          if (current.parentNode) {
            setPath([...path, [current.x, current.y]]);
            path.push([current.x, current.y]);
            current = current.parentNode;
          } else {
            clearInterval(nestedInterval);
          }
        }, algorithmSpeed);
      }

      let neighbors: Node[] = currentNode.findNearestNeighbors(grid);
      for (let neighbor of neighbors) {
        if (neighbor.isClosed || !neighbor.walkable) {
          continue;
        }

        const tentativeScoreG = currentNode.gScore + 1;
        if (!neighbor.isDiscovered) {
          neighbor.gScore = tentativeScoreG;
          neighbor.hScore = neighbor.calculateDistance(endNode);
          neighbor.fScore = neighbor.gScore + neighbor.hScore;
          neighbor.parentNode = currentNode;
          neighbor.isDiscovered = true;
          openList.enqueue(neighbor);
        } else if (tentativeScoreG < neighbor.gScore) {
          neighbor.gScore = tentativeScoreG;
          neighbor.hScore = neighbor.calculateDistance(endNode);
          neighbor.fScore = neighbor.gScore + neighbor.hScore;
          neighbor.parentNode = currentNode;
        }
      }

      if (!openList.elements.length) {
        clearInterval(interval);
        console.log('No Path!');
      }
    }, algorithmSpeed);
  }

  return { pathfind, reset, path };
}
