const targetMap = new WeakMap();
let activeEffect = null;

function track(target, key) {
  if (!activeEffect) {
    return;
  }

  let depsMap = targetMap.get(target);
  if (!depsMap) {
    depsMap = new Map();
    targetMap.set(target, depsMap);
  }

  let dep = depsMap.get(key);
  if (!dep) {
    dep = new Set();
    depsMap.set(key, dep);
  }

  dep.add(activeEffect);
}

function trigger(target, key) {
  const depsMap = targetMap.get(target);
  if (!depsMap) {
    return;
  }

  const dep = depsMap.get(key);
  if (dep) {
    dep.forEach((activeEffect) => {
      activeEffect();
    });
  }
}

function reactive(target) {
  const handler = {
    get(target, key, receiver) {
      const result = Reflect.get(target, key, receiver);
      track(target, key);
      return result;
    },
    set(target, key, value, receiver) {
      const oldValue = target[key];
      const result = Reflect.set(target, key, value, receiver);
      if (oldValue !== result) {
        trigger(target, key);
      }
      return result;
    },
  };

  return new Proxy(target, handler);
}

function effect(eff) {
  activeEffect = eff;
  activeEffect();
  activeEffect = null;
}

const product = reactive({ price: 5, quantity: 2 });

effect(() => {
  const total = product.price * product.quantity;
  console.log(`total = ${total}`);
});

effect(() => {
  console.log(`Updated quantity to = ${product.quantity}`);
});

product.price = 10;
