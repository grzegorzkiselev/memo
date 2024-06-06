const memo = (callback, hashGenerator) => {
  const cache = new Map();

  return (...args) => {
      try {
        const argumentsKey = hashGenerator && typeof hashGenerator === "function"
          ? hashGenerator.apply(null, args) 
          : JSON.stringify(args);
        
          console.log(argumentsKey);

        if (cache.has(argumentsKey)) {
          return "MEMOIZED_" + cache.get(argumentsKey);
        }

        const result = callback.apply(null, args);
        cache.set(argumentsKey, result);

        return result;
      } catch (error) {
        console.error(
          `Getting error while accessing cache with ${args}`
        )
      }
  }
}

module.exports = { memo };
