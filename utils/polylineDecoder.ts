type DecodeOptions = {
  precision?: number;
  dimension?: number;
};

const DEFAULT_PRECISION = 5;
const DEFAULT_DIMENSION = 2;

const decodeUnsignedIntegers = (encoded: string) => {
  const numbers: number[] = [];
  let current = 0;
  let shift = 0;

  for (let i = 0; i < encoded.length; i += 1) {
    const b = encoded.charCodeAt(i) - 63;
    current |= (b & 0x1f) << shift;

    if (b < 0x20) {
      numbers.push(current);
      current = 0;
      shift = 0;
    } else {
      shift += 5;
    }
  }

  return numbers;
};

const decodeSignedIntegers = (encoded: string) => {
  const numbers = decodeUnsignedIntegers(encoded);
  for (let i = 0; i < numbers.length; i += 1) {
    const num = numbers[i];
    numbers[i] = (num & 1) ? ~(num >> 1) : (num >> 1);
  }

  return numbers;
};

const decodeFloats = (encoded: string, precision: number) => {
  const factor = Math.pow(10, precision);
  const numbers = decodeSignedIntegers(encoded);
  for (let i = 0; i < numbers.length; i += 1) {
    numbers[i] /= factor;
  }

  return numbers;
};

const decodeDeltas = (encoded: string, precision: number, dimension: number) => {
  const numbers = decodeFloats(encoded, precision);
  const factor = Math.pow(10, precision);
  const lastNumbers: number[] = [];

  for (let i = 0; i < numbers.length;) {
    for (let d = 0; d < dimension; d += 1, i += 1) {
      const last = lastNumbers[d] || 0;
      lastNumbers[d] = numbers[i] + last;
      numbers[i] = Math.round(lastNumbers[d] * factor) / factor;
    }
  }

  return numbers;
};

export const decodePolyline = (encoded: string, options: DecodeOptions = {}) => {
  const precision = options.precision ?? DEFAULT_PRECISION;
  const dimension = options.dimension ?? DEFAULT_DIMENSION;
  const flatPoints = decodeDeltas(encoded, precision, dimension);

  const points: number[][] = [];
  for (let i = 0; i + (dimension - 1) < flatPoints.length;) {
    const point: number[] = [];
    for (let d = 0; d < dimension; d += 1) {
      point.push(flatPoints[i]);
      i += 1;
    }
    points.push(point);
  }

  return points;
};
