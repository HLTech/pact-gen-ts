export const createMapper = <Key, Value>(map: Array<[Key, Value]>, defaultMapFunction?: Function) => {
    const createdMap = new Map(map);

    return function (key: Key) {
        const foundElement = createdMap.get(key);
        return foundElement ?? defaultMapFunction?.(key);
    }
}
