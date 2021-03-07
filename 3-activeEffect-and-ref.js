// The WeakMap that stores {target -> key -> dep} connections.
const targetMap = new WeakMap();
let activeEffect = null;

function track(target, key) {
  if (!activeEffect) {
    return;
  }

  let depsMap = targetMap.get(target);
  if (!depsMap) {
    targetMap.set(target, (depsMap = new Map()));
  }

  let dep = depsMap.get(key);
  if (!dep) {
    depsMap.set(key, (dep = new Set()));
  }

  dep.add(activeEffect);
  console.log('[FUNC TRACK] ACTIVE_EFFECT = ', activeEffect);
  console.log('[FUNC TRACK] TARGET = ', target);
  console.log('[FUNC TRACK] KEY = ', key);
  console.log('[FUNC TRACK] DEP = ', dep);
  console.log('[FUNC TRACK] TARGET_MAP = ', targetMap);
}

function trigger(target, key) {
  console.log('[FUNC TRIGGER] TARGET = ', target);
  console.log('[FUNC TRIGGER] KEY = ', key);
  const depsMap = targetMap.get(target);

  if (!depsMap) {
    return;
  }

  const dep = depsMap.get(key);
  console.log('[FUNC TRIGGER] DEP = ', dep);
  if (dep) {
    dep.forEach((innerEffect) => {
      effect(innerEffect);
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
      if (result && oldValue !== value) {
        trigger(target, key);
      }
      return result;
    },
  };

  return new Proxy(target, handler);
}

function effect(eff) {
  console.log('[FUNC EFFECT] ACTIVE_EFFECT = ', eff);
  activeEffect = eff;
  activeEffect();
  activeEffect = null;
}

// Make variable reactive

// *** function ref() will cause unexpected behavior when
// *** the code snippet is executed in online editors like codepen or jsbin.
// *** 1. The function () => salePrice.value = product.price * 0.9; will be
// *** added to salePrice dep set.
// *** 2. console.log(target); in the function track() will cause an infinite loop.

// function ref(rawValue) {
//   const r = {
//     get value() {
//       track(this, 'value');
//       return rawValue;
//     },
//     set value(newValue) {
//       if (newValue !== rawValue) {
//         rawValue = newValue;
//         trigger(this, 'value');
//       }
//     },
//   };

//   return r;
// }

// Make variable reactive
class Ref {
  constructor(rawValue) {
    this._value = rawValue;
  }

  get value() {
    track(this, 'value');
    return this._value;
  }

  set value(newVal) {
    if (newVal !== this._value) {
      this._value = newVal;
      trigger(this, 'value');
    }
  }
}

function createRef(rawValue) {
  return new Ref(rawValue);
}

function ref(rawValue) {
  return createRef(rawValue);
}

const product = reactive({ price: 5, quantity: 2 });
let salePrice = ref(0);

effect(() => {
  const total = salePrice.value * product.quantity;
  console.log(`total = ${total}`);
});

effect(() => {
  salePrice.value = product.price * 0.9;
  console.log(`sale price = ${salePrice.value}`);
});

product.price = 10;
