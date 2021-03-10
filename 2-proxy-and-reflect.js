// The WeakMap that stores {target -> key -> dep} connections.
const targetMap = new WeakMap();
let effect = null;

function track(target, key) {
  let depsMap = targetMap.get(target);
  if (!depsMap) {
    targetMap.set(target, (depsMap = new Map()));
  }

  let dep = depsMap.get(key);
  if (!dep) {
    depsMap.set(key, (dep = new Set()));
  }

  dep.add(effect);
}

function trigger(target, key) {
  const depsMap = targetMap.get(target);
  if (!depsMap) {
    return;
  }

  const dep = depsMap.get(key);
  if (dep) {
    dep.forEach((effect) => {
      effect();
    });
  }
}

// Using Proxy & Reflect not only allows us to add properties later that we
// want to be reactive, but also improves the performance - nested objects
// are only converted as need it when you access them.
function reactive(target) {
  const handler = {
    get(target, key, receiver) {
      const result = Reflect.get(target, key, receiver);
      track(target, key);
      return result;
    },
    set(target, key, value, receiver) {
      const oldValue = target[key];
      const isSetSuccessful = Reflect.set(target, key, value, receiver);
      if (isSetSuccessful && value !== oldValue) {
        trigger(target, key);
      }
      return isSetSuccessful;
    },
  };

  return new Proxy(target, handler);
}

const product = reactive({ price: 5, quantity: 2 });
let total = 0;
effect = () => {
  total = product.price * product.quantity;
};

effect();
console.log(total);

product.quantity = 3;
console.log(total);
