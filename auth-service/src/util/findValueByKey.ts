export interface TargetObjectType {
  [key: string]: string | number | TargetObjectType;
}

type FindValueType = string | number | boolean | null | TargetObjectType;

export const findValueByKey = (targetObj: TargetObjectType, keyToFind: string): FindValueType => {
  for (const key in targetObj) {
    // 1. key에 해당하는 value가 객체일 때, 재귀적으로 순회
    if (typeof targetObj[key] === 'object') {
      const result = findValueByKey(targetObj[key] as TargetObjectType, keyToFind);
      if (result) return result;
    }

    // 2. key에 해당하는 value가 객체 외의 타입일 경우, 해당 value 반환
    if (key === keyToFind) {
      return targetObj[keyToFind];
    }
  }

  return null;
};
