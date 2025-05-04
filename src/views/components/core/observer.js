let currentObserver = null;

export const observe = (fn) => {
  currentObserver = fn;
  fn();
  currentObserver = null;
};

export const observable = (obj) => {
  Object.keys(obj).forEach((key) => {
    let _value = obj[key];
    const observers = new Set();

    Object.defineProperty(obj, key, {
      get() {
        if (currentObserver) observers.add(currentObserver);
        return _value;
      },
      set(value) {
        // 변경된 상태가 이전(기존) 상태와 값이 같을 경우 렌더링 X
        if (_value === value) return;
        if (JSON.stringify(_value) === JSON.stringify(value)) return;
        // Set, Map, WeekSet, WeekMap 같은 것들은 JSON.stringify로 변환되지 않는다. 이런 경우에는 추가적인 검사 로직이 필요하다.
        _value = value;
        observers.forEach((fn) => fn());
      },
    });
  });
  return obj;
};
