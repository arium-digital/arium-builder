import { describe, expect, it } from "@jest/globals";
import { CircularQueue } from "../circularQueue";

describe("CircularQueue", () => {
  it("works", () => {
    const queue = new CircularQueue<number>(3);
    queue.push(1);
    queue.push(2);
    queue.push(3);
    queue.push(4);

    expect(queue.length).toBe(3);
    expect(queue.getFront()).toBe(4);
    expect(queue.getRear()).toBe(2);
    expect(queue.isEmpty()).toBe(false);
    expect(queue.isFull()).toBe(true);

    // pop 1
    let popped = queue.pop();
    expect(popped).toBe(4);
    expect(queue.length).toBe(2);
    expect(queue.getFront()).toBe(3);
    expect(queue.getRear()).toBe(2);
    expect(queue.isEmpty()).toBe(false);
    expect(queue.isFull()).toBe(false);

    //pop all
    popped = queue.pop();
    expect(popped).toBe(3);
    popped = queue.pop();
    expect(popped).toBe(2);

    // keep popping
    popped = queue.pop();
    expect(popped).toBe(undefined);
    popped = queue.pop();
    expect(popped).toBe(undefined);
    popped = queue.pop();
    expect(popped).toBe(undefined);

    //validate
    expect(queue.length).toBe(0);
    expect(queue.getFront()).toBe(undefined);
    expect(queue.getRear()).toBe(undefined);
    expect(queue.isEmpty()).toBe(true);
    expect(queue.isFull()).toBe(false);

    queue.push(11);
    queue.push(12);
    expect(queue.length).toBe(2);
    expect(queue.getFront()).toBe(12);
    expect(queue.getRear()).toBe(11);
    expect(queue.isEmpty()).toBe(false);
    expect(queue.isFull()).toBe(false);
    expect(queue.pop()).toBe(12);
    expect(queue.pop()).toBe(11);
  });
});
