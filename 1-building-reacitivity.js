const targetMap = new WeakMap();
let effect = null;

function track(target, key) {
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

const product = { price: 5, quantity: 2 };
let total = 0;
effect = () => {
  total = product.price * product.quantity;
  console.log(`total = ${total}`);
};

track(product, 'quantity');
effect();

product.quantity = 3;
trigger(product, 'quantity');
