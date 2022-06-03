export class CircularQueue<T> {
  private front: number;
  private rear: number;
  length: number;
  private size: number;
  private values: Array<T>;
  constructor(size: number = 100) {
    this.size = size + 1;
    this.length = 0;
    this.front = 0;
    this.rear = 0;
    this.values = Array(this.size);
  }

  isEmpty(): boolean {
    return this.length === 0;
  }

  isFull(): boolean {
    return (this.front + 1) % this.size === this.rear;
  }
  push(val: T) {
    if (this.isFull()) {
      this.rear += 1;
      this.rear %= this.size;
      this.length -= 1;
    }
    this.front += 1;
    this.front %= this.size;
    this.values[this.front % this.size] = val;
    this.length += 1;
  }
  pop(): T | undefined {
    if (this.isEmpty()) return undefined;
    const val = this.values[this.front % this.size];
    this.front -= 1;
    this.length -= 1;
    if (this.front < 0) this.front += this.size;
    return val;
  }

  getFront(): T | undefined {
    if (this.isEmpty()) return undefined;
    return this.values[this.front % this.size];
  }

  getRear(): T | undefined {
    if (this.isEmpty()) return undefined;
    return this.values[(this.rear + 1) % this.size];
  }
}
