function calculateSum(a, b) {
  return a + b;
}

// Using map: transform each number then sum
function sumUsingMap(numbers) {
  return numbers.map(num => num * 1).reduce((acc, num) => acc + num, 0);
}

// Using filter: sum only positive numbers
function sumUsingFilter(numbers) {
  return numbers.filter(num => num > 0).reduce((acc, num) => acc + num, 0);
}

// Using reduce: calculate the sum directly
function sumUsingReduce(numbers) {
  return numbers.reduce((acc, num) => acc + num, 0);
}

// Using for loop: iterate and accumulate
function sumUsingForLoop(numbers) {
  let sum = 0;
  for (let i = 0; i < numbers.length; i++) {
    sum += numbers[i];
  }
  return sum;
}

// Using built-in forEach method
function sumUsingForEach(numbers) {
  let sum = 0;
  numbers.forEach(num => {
    sum += num;
  });
  return sum;
}

// implement the debounce and throttle functions in JavaScript:
// Debounce function: delays the execution of a function until after a specified wait time has elapsed since the last time it was invoked.

function debounce(func, wait) {
  let timeout;
  return function(...args) {
    clearTimeout(timeout);
    timeout = setTimeout(() => func.apply(this, args), wait);
  };
}

// Throttle function: ensures that a function is only called once in a specified time period.
function throttle(func, limit) {
  let lastFunc;
  let lastRan;
  return function(...args) {
    if (!lastRan) {
      func.apply(this, args);
      lastRan = Date.now();
    } else {
      clearTimeout(lastFunc);
      lastFunc = setTimeout(() => {
        if ((Date.now() - lastRan) >= limit) {
          func.apply(this, args);
          lastRan = Date.now();
        }
      }, limit - (Date.now() - lastRan));
    }
  };
}   

module.exports = { calculateSum, sumUsingMap, sumUsingFilter, sumUsingReduce, sumUsingForLoop, sumUsingForEach, debounce, throttle };

