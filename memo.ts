type Callback = (...args: unknown[]) => unknown;
type HashGenerator = (...args: unknown[]) => NonNullable<unknown>;
type Memo = (callback: Callback, hashGenerator?: HashGenerator) => unknown | void;

const isValidHashGenerator = (hashGenerator, args): hashGenerator is HashGenerator => {
  return (
    typeof hashGenerator === "function"
    && hashGenerator(args) != null
  )
}

export const memo: Memo = (callback, hashGenerator) => {
  const cache = new Map();

  return (...args) => {
      try {
        if (hashGenerator && isValidHashGenerator(hashGenerator, args) === false) {
          throw new Error("Hash generator is not valid");
        }

        const argumentsKey = hashGenerator
          ? hashGenerator.apply(null, args) 
          : JSON.stringify(args);

        if (cache.has(argumentsKey)) {
          return "MEMOIZED_" + cache.get(argumentsKey);
        }

        const result = callback.apply(null, args);
        cache.set(argumentsKey, result);

        return result;
      } catch (error) {
        console.error(error.message);
        throw error;
      }
  }
};