export const isNumeric: Function = (data: string): boolean =>
  !isNaN(Number(data));

export const getRandomInteger: Function = (max: number): number =>
  ~~(Math.random() * max);
