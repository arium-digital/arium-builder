// algorithm based on Coursera Lecture from Algorithms, Part 1:
// https://www.coursera.org/learn/algorithms-part1/lecture/ZjoSM/heapsort

function half(k: number) {
  return Math.floor(k / 2);
}

export class MaxHeap<T> {
  private priorityQueue: T[];
  private numberOfElements: number;
  private getElementValue: (element: T) => number;

  constructor(maxSize: number, getElementValue: (element: T) => number) {
    this.priorityQueue = new Array(maxSize);
    this.numberOfElements = -1;
    this.getElementValue = getElementValue;
  }

  public clone(): MaxHeap<T> {
    const result = new MaxHeap<T>(
      this.priorityQueue.length,
      this.getElementValue
    );

    result.priorityQueue = this.priorityQueue.slice();
    result.numberOfElements = this.numberOfElements;
    result.getElementValue = this.getElementValue;

    return result;
  }

  public enqueue(x: T): void {
    this.priorityQueue[++this.numberOfElements] = x;
    this.swim(this.numberOfElements);
  }

  public dequeue(): T {
    const max = this.priorityQueue[0];
    this.exchange(0, this.numberOfElements--);
    this.sink(0);
    // @ts-ignore
    this.priorityQueue[this.numberOfElements + 1] = null;
    return max;
  }

  public empty(): boolean {
    return this.numberOfElements === -1;
  }

  public size(): number {
    return this.numberOfElements + 1;
  }

  public all(): T[] {
    return this.priorityQueue.slice(0, this.numberOfElements + 1);
  }

  public max(): T {
    return this.priorityQueue[0];
  }

  private swim(k: number): void {
    while (k > 0 && this.less(half(k), k)) {
      this.exchange(k, half(k));
      k = half(k);
    }
  }

  private sink(k: number): void {
    while (2 * k <= this.numberOfElements) {
      let j = 2 * k;
      if (j < this.numberOfElements && this.less(j, j + 1)) {
        j++;
      }
      if (!this.less(k, j)) {
        break;
      }
      this.exchange(k, j);
      k = j;
    }
  }

  private getValueAt(i: number): number {
    return this.getElementValue(this.priorityQueue[i]);
  }

  private less(i: number, j: number): boolean {
    return this.getValueAt(i) < this.getValueAt(j);
  }

  private exchange(i: number, j: number): void {
    const t = this.priorityQueue[i];
    this.priorityQueue[i] = this.priorityQueue[j];
    this.priorityQueue[j] = t;
  }
}
