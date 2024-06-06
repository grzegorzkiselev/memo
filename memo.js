const memo = (callback) => {
    const cache = new Map();

    return (...args) => {
        try {
          const joinedArgs = JSON.stringify(args);

          if (cache.has(joinedArgs)) {
            return "MEMOIZED_" + cache.get(joinedArgs);
          }

          const result = callback(...args);
          cache.set(joinedArgs, result);

          return result;
        } catch (error) {
          console.error(
            `Getting error while accessing cache with ${args}`
          )
        }
    }
}

module.exports = { memo };
