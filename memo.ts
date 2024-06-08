type HashGenerator = (...args: any[]) => NonNullable<unknown>;

export const memo = <T extends (...args: any[]) => any>(
    callback: T, 
    hashGenerator: HashGenerator = JSON.stringify
): (...args: Parameters<T>) => ReturnType<T> | string => {
  const cache = new Map<unknown, ReturnType<T>>();

  return (...args) => {
      try {
        if (typeof hashGenerator !== "function") {
          throw new Error("Hash generator is not valid");
        }

        const argumentsKey = hashGenerator(args);

        if (argumentsKey == null) {
          throw new Error("Hash generator is not valid");
        }

        if (cache.has(argumentsKey)) {
          return "MEMOIZED_" + cache.get(argumentsKey);
        }

        const result = callback(...args);
        cache.set(argumentsKey, result);

        return result;
      } catch (error) {
        error instanceof Error && console.error(error.message);
        throw error;
      }
  }
};