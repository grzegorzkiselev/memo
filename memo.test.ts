import { expect, it } from "vitest";
import { memo } from "./memo.ts";
import hash from "object-hash";

const numbersCallback = (int1: number, int2: number) => int1 + int2;
interface RecursiveObject {
  [key: string]: number | RecursiveObject;
}
const invalidHashGenerator = () => null

it("Мемоизирует", () => { 
  const sumInts = memo(numbersCallback);

  expect(sumInts(30, 10)).toBe(40);
  expect(sumInts(30, 10)).toBe("MEMOIZED_40");
  });

it("Работает с Фэлси", () => {
  const sumInts = memo(numbersCallback);

  expect(sumInts(0, 0)).toBe(0);
  expect(sumInts(0, 0)).toBe("MEMOIZED_0");
});

it("Не смешивает результаты разных функций", () => {
  const sumInts = memo(numbersCallback);
  const sumInts2 = memo(numbersCallback);

  expect(sumInts(30, 10)).toBe(40);
  expect(sumInts2(30, 10)).toBe(40);
});

it("Не создаёт коллизий", () => {
  const sumInts = memo(numbersCallback);
  const sumInts2 = memo(numbersCallback);

  expect(sumInts(30, 15)).toBe(45);
  expect(sumInts2(301, 5)).toBe(306);
});

it("Работает с объектами", () => {
  const sumInts = memo(({ a, b }: { a: number, b: number }) => a + b);

  expect(sumInts({ a: 30, b: 5 })).toBe(35);
  expect(sumInts({ a: 30, b: 5 })).toBe("MEMOIZED_35")
});

it("Работает с наборами", () => {
  const sumInts = memo((set: Set<number>): number => {
    const valuesIter = set.values();
    return valuesIter.next().value + valuesIter.next().value;
  });

  expect(sumInts(new Set([30, 5]))).toBe(35);
  expect(sumInts(new Set([30, 5]))).toBe("MEMOIZED_35")
});

it("Работает со вложенными объектами", () => {
  const sumInts = memo((object: RecursiveObject) => {
    return object.a + object.b[(typeof object.b !== "number" && "a") as string];
  });

  const upperObject: RecursiveObject = { a: 30 };
  upperObject.b = { ...upperObject };
  upperObject.b.a = 5;

  const secondObject = { ...upperObject }

  expect(sumInts(upperObject)).toBe(35);
  expect(sumInts(secondObject)).toBe("MEMOIZED_35")
});

it("Работает с копиями объектов", () => {
  const sumInts = memo((object: Record<string, number>) => {
    return object.a + object.b;
  });

  const upperObject = { a: 30, b: 5 };
  const secondObject = { ...upperObject };

  expect(sumInts(upperObject)).toBe(35);
  expect(sumInts(secondObject)).toBe("MEMOIZED_35")
});

it("Работает с циклическими объектами", () => {
  const sumInts = memo((object: RecursiveObject) => {
    return object.a + object.b[(typeof object.b !== "number" && "a") as string];
  },
    hash
  );

  const upperObject: RecursiveObject = { a: 0 };
  upperObject.b = upperObject;
  upperObject.b.a = 5;

  expect(sumInts(upperObject)).toBe(10);
  expect(sumInts(upperObject)).toBe("MEMOIZED_10")
});

it("Работает с пользовательскими генераторами ключа", () => {
  const sumIntsObject = memo(
    (object: RecursiveObject): number => {
      return object.a + object.b[(typeof object.b !== "number" && "a") as string];
    },
    hash
  );

  const sumInts = memo(
    numbersCallback,
    hash
  );

  const upperObject: RecursiveObject = { a: 30 };
  upperObject.b = { ...upperObject };
  upperObject.b.a = 5;
  const secondObject = { ...upperObject }

  expect(sumIntsObject(upperObject)).toBe(35);
  expect(sumIntsObject(secondObject)).toBe("MEMOIZED_35");
  expect(sumInts(30, 5)).toBe(35);
  expect(sumInts(30, 5)).toBe("MEMOIZED_35");
});

it("Ломается с неправильным генератором хэша", () => {
  const sumInts = memo(
    numbersCallback,
    invalidHashGenerator
  );

  expect(
    () => { sumInts(30, 5) }
  ).toThrowError("not valid");
});