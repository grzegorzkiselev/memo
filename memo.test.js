const { memo } = require("./memo.js");
const hash = require('object-hash');

it("Мемоизирует", () => {
  const sumInts = memo((a, b) => a + b);

  expect(sumInts(30, 10)).toBe(40);
  expect(sumInts(30, 10)).toBe("MEMOIZED_40");
});

it("Работает с Фэлси", () => {
  const sumInts = memo((a, b) => a + b);
  
  expect(sumInts(0, 0)).toBe(0);
  expect(sumInts(0, 0)).toBe("MEMOIZED_0");
});

it("Не смешивает результаты разных функций", () => {
  const sumInts = memo((a, b) => a + b);
  const sumInts2 = memo((a, b) => a + b);

  expect(sumInts(30, 10)).toBe(40);
  expect(sumInts2(30, 10)).toBe(40);
});

it("Не создаёт коллизий", () => {
    const sumInts = memo((a, b) => a + b);
    const sumInts2 = memo((a, b) => a + b);
    
    expect(sumInts(30, 15)).toBe(45);
    expect(sumInts2(301, 5)).toBe(306);
});

it("Работает с объектами", () => {
  const sumInts = memo(({ a, b }) => a + b);
  
  expect(sumInts({ a: 30, b: 5 })).toBe(35);
  expect(sumInts({ a: 30, b: 5 })).toBe("MEMOIZED_35")
});

it("Работает с наборами", () => {
  const sumInts = memo((set) => {
    const valuesIter = set.values(); 
    return valuesIter.next().value + valuesIter.next().value;
  });

  expect(sumInts(new Set([30, 5]))).toBe(35);
  expect(sumInts(new Set([30, 5]))).toBe("MEMOIZED_35")
});

it("Работает со вложенными объектами", () => {
  const sumInts = memo((object) => {
    return object.a + object.b.a;
  });

  const upperObject = { a: 30 };
  upperObject.b = { ...upperObject };
  upperObject.b.a = 5;

  const secondObject = {...upperObject}

  expect(sumInts(upperObject)).toBe(35);
  expect(sumInts(secondObject)).toBe("MEMOIZED_35")
});

it("Работает с копиями объектов", () => {
  const sumInts = memo((object) => {
    return object.a + object.b;
  });

  const upperObject = { a: 30, b: 5 };
  const secondObject = { ...upperObject };

  expect(sumInts(upperObject)).toBe(35);
  expect(sumInts(secondObject)).toBe("MEMOIZED_35")
});

it("Работает с циклическими объектами", () => {
    const sumInts = memo((object) => {
      return object.a + object.b.a;
    },
    hash
  );

  const upperObject = { a: 0 };
  upperObject.b = upperObject;
  upperObject.b.a = 5;

  expect(sumInts(upperObject)).toBe(10);
  expect(sumInts(upperObject)).toBe("MEMOIZED_10")
});

it("Работает с пользовательскими генераторами ключа", () => {
  const sumIntsObject = memo(
    (object) => {
      return object.a + object.b.a;
    },
    hash
  );

  const sumInts = memo(
    (a, b) => a + b,
    hash
  );

  const upperObject = { a: 30 };
  upperObject.b = { ...upperObject };
  upperObject.b.a = 5;
  const secondObject = {...upperObject}

  expect(sumIntsObject(upperObject)).toBe(35);
  expect(sumIntsObject(secondObject)).toBe("MEMOIZED_35");
  expect(sumInts(30, 5)).toBe(35);
  expect(sumInts(30, 5)).toBe("MEMOIZED_35");
});