let intervalId = null;

self.onmessage = (e) => {
  const { action, duration } = e.data;

  switch (action) {
    case 'start': {
      if (intervalId) clearInterval(intervalId);
      let remaining = duration;
      intervalId = setInterval(() => {
        remaining -= 1;
        if (remaining <= 0) {
          remaining = 0;
          clearInterval(intervalId);
          intervalId = null;
          self.postMessage({ type: 'complete' });
        }
        self.postMessage({ type: 'tick', remaining });
      }, 1000);
      break;
    }
    case 'pause': {
      if (intervalId) {
        clearInterval(intervalId);
        intervalId = null;
      }
      break;
    }
    case 'stop': {
      if (intervalId) {
        clearInterval(intervalId);
        intervalId = null;
      }
      break;
    }
  }
};
