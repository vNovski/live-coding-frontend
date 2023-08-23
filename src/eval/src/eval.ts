// @ts-nocheck
const executionEvents = {
  client: 0,
  syncComplete: 1,
  asyncComplete: 2,
};

class AsyncOperationsManager {
  counter = 0;
  postMessage: any;

  constuctor(postMessage: any) {
    this.postMessage = postMessage;
  }

  inc() {
    this.counter += 1;
    this.shareUpdate();
  }

  dec() {
    this.counter -= 1;
    this.shareUpdate();
  }

  shareUpdate() {
    if (this.counter === 0) {
      self.postMessage(
        JSON.stringify({ type: executionEvents.asyncComplete, data: null })
      );
    }
  }
}


const executionEvents = {
  client: 0,
  syncComplete: 1,
  asyncComplete: 2,
}

const timersSet = new Set();

onmessage = (message) => {
    const nativePostMessage = this.postMessage;
    const asyncOperationManager = new AsyncOperationsManager(nativePostMessage);
    // const bufferTime = 100 // ms;
    // let startTime = performance.now();
    let actions = [];
    const unit = message.data;
    

    ['log', 'info', 'warn', 'error'].forEach(patchConsoleMethod);
    // const sandboxProxy = new Proxy(Object.assign(unitApi, apis), {has, get});
    
    // Object.keys(this).forEach(key => {
    //     delete this[key];
    // });
    
    this.Function = function() { return 'Not bad =)' };

    // Monkey patched async methods

    // Promise
    class LiveCodingPromise extends Promise {
      constructor(executor) {
        asyncOperationManager.inc();
        super(executor);
        super.finally(() => asyncOperationManager.dec());
      }
    }
    LiveCodingPromise.prototype.constructor = Promise;
    Promise = LiveCodingPromise;

    // SetTimeout
    const nativeSetTimeout = setTimeout;
    const liveCodingSetTimeout = (cb, ...args) => {
      const timeout = nativeSetTimeout(() => {
          cb();
          asyncOperationManager.dec();
          timersSet.delete(timeout);
      }, ...args);
      asyncOperationManager.inc();
      timersSet.add(timeout);
    }
    setTimeout = liveCodingSetTimeout;

    // SetInterval
    const nativeSetInterval = setInterval;
    const liveCodingSetInterval = (...args) => {
      const interval = nativeSetInterval(...args);
      asyncOperationManager.inc();
      timersSet.add(interval);
      return interval;
    }
    setInterval = liveCodingSetInterval;

    // clearInterval
    const nativeClearInterval = clearInterval;
    const liveCodingClearInterval = (id) => {
      asyncOperationManager.dec();
      timersSet.delete(id);
      return nativeClearInterval(id)
    }
    clearInterval = liveCodingClearInterval;

    // clearTimeout
    const nativeclearTimeout = clearTimeout;
    const liveCodingClearTimeout = (id) => {
      asyncOperationManager.dec();
      timersSet.delete(id);
      return nativeclearTimeout(id)
    }
    clearTimeout = liveCodingClearTimeout;


    //with (sandboxProxy) {
        (function() {
                //{INJECT}//
        }).call('Nice try but try smth else ;)')
    //}
    
    function has (target, key) {
        return true;
    }
    
    function get (target, key) {
        if (key === Symbol.unscopables) return undefined;
        return target[key];
    }

    

    function patchConsoleMethod(name) {
        const nativeMethod = console[name].bind(console);
        
        console[name] = (...attributes) => {
            attributes = attributes.map(attr => {
                if (attr instanceof Error) {
                    return attr.constructor.name + ': ' + attr.message;
                }
                
                if (attr instanceof Object) {
                    return JSON.stringify(attr);
                }
                
                return attr;
            })
            actions.push({type: name, data: [...attributes]});
           
            // let endTime = performance.now();
            // if(endTime - startTime >= bufferTime) {
              // startTime = performance.now();
              nativePostMessage(JSON.stringify({ type: executionEvents.client, data: actions}));
              actions = [];
            // }

            // nativeMethod(...attributes);
        }
    }
    nativePostMessage(JSON.stringify({ type: executionEvents.syncComplete, data: null }));
    if(asyncOperationManager.counter === 0) {
      asyncOperationManager.shareUpdate();
    }
}