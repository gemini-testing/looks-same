# Benchmark Results

Execution times (in milliseconds) for image comparison packages across test cases.  
All values represent raw performance metrics (average, p50, p99).

---

## Case: web avg diff (672x623)
| Package      | Avg (ms) | p50 (ms) | p99 (ms) |
|--------------|----------|----------|----------|
| looks-same   | 43.5     | 42       | 53.66    |
| pixelmatch   | 49.48    | 48.56    | 53.31    |
| resemblejs   | 47.01    | 46.63    | 51.89    |
| blink-diff   | 59.8     | 60.44    | 68.73    |

## Case: web avg success (656x547)
| Package      | Avg (ms) | p50 (ms) | p99 (ms) |
|--------------|----------|----------|----------|
| looks-same   | 12.74    | 12.44    | 17.99    |
| pixelmatch   | 37.51    | 36.98    | 41.37    |
| resemblejs   | 28.74    | 28.27    | 33.31    |
| blink-diff   | 35.19    | 33.25    | 43.28    |

## Case: equal images (1000x1000)
| Package      | Avg (ms) | p50 (ms) | p99 (ms) |
|--------------|----------|----------|----------|
| looks-same   | 0.04     | 0.04     | 0.05     |
| pixelmatch   | 45.39    | 44.95    | 49.18    |
| resemblejs   | 69.44    | 69.04    | 74.8     |
| blink-diff   | 88.65    | 88.14    | 98.4     |

## Case: 1% visible diff (1000x1000)
| Package      | Avg (ms) | p50 (ms) | p99 (ms) |
|--------------|----------|----------|----------|
| looks-same   | 28.73    | 27.89    | 36.44    |
| pixelmatch   | 102.03   | 102.16   | 106.81   |
| resemblejs   | 72.63    | 72.17    | 82.85    |
| blink-diff   | 94.93    | 94.46    | 107.78   |

## Case: 10% visible diff (1000x1000)
| Package      | Avg (ms) | p50 (ms) | p99 (ms) |
|--------------|----------|----------|----------|
| looks-same   | 33.66    | 33.68    | 37.44    |
| pixelmatch   | 101.23   | 101.02   | 105.67   |
| resemblejs   | 72.09    | 71.77    | 80.57    |
| blink-diff   | 94.52    | 94.13    | 105.07   |

## Case: full max diff (1000x1000)
| Package      | Avg (ms) | p50 (ms) | p99 (ms) |
|--------------|----------|----------|----------|
| looks-same   | 467.33   | 463.05   | 491.6    |
| pixelmatch   | 148.59   | 148.39   | 153.3    |
| resemblejs   | 605.37   | 600.99   | 668.96   |
| blink-diff   | 685.83   | 683.26   | 741.43   |

## Case: demonstrative example visible 8% diff (896×784)
| Package      | Avg (ms) | p50 (ms) | p99 (ms) |
|--------------|----------|----------|----------|
| looks-same   | 55.1     | 55.7     | 61.5     |
| pixelmatch   | 87.05    | 86.96    | 89.62    |
| resemblejs   | 80.05    | 79.72    | 87.71    |
| blink-diff   | 111.29   | 109.2    | 126.47   |
