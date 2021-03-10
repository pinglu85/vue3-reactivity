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
  console.log('[FUNC TRACK] TARGET_MAP = ', targetMap);
}

function trigger(target, key) {
  const depsMap = targetMap.get(target);

  if (!depsMap) {
    return;
  }

  const dep = depsMap.get(key);
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
  activeEffect = eff;
  activeEffect();
  activeEffect = null;
}

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

function ref(rawValue) {
  return new Ref(rawValue);
}

// Computed properties
function computed(getter) {
  const result = ref();

  effect(() => {
    result.value = getter();
  });

  console.log(result);
  return result;
}

const product = reactive({ price: 5, quantity: 2 });
let salePrice = computed(() => {
  return product.price * 0.9;
});

let total = computed(() => {
  return salePrice.value * product.quantity;
});

console.log(
  `Before updated total (should be 10) = ${total.value}. salePrice (should be 4.5) = ${salePrice.value}`
);

product.quantity = 3;
console.log(
  `After updated total (should be 13.5) = ${total.value}. salePrice (should be 4.5) = ${salePrice.value}`
);

product.price = 10;
console.log(
  `After updated total (should be 27) = ${total.value}. salePrice (should be 9) = ${salePrice.value}`
);

// Add additional properties to the reactive object.
product.name = 'Shoes';

effect(() => {
  console.log(`Product name is now ${product.name}`);
});

product.name = 'Socks';
