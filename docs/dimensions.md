# Layout Dimensions

Figma canvas: **1728 × 1117px** (MacBook Pro 16")

## Conversion to viewport units

| Measurement | Figma (px) | Viewport unit | Formula |
|---|---|---|---|
| Left inset | 219px | `12.67vw` | `219 / 1728 × 100` |
| Right inset | 219px | `12.67vw` | `219 / 1728 × 100` |
| Container width | 635px | `36.75vw` | `635 / 1728 × 100` |
| Container height | 1117px | `h-screen` (100vh) | `1117 / 1117 × 100` |

## How it scales

| Screen | Res | Left inset | Width |
|---|---|---|---|
| 14" laptop | 1440px | 182px | 529px |
| 16" MacBook | 1728px | 219px | 635px |
| 24" monitor | 1920px | 243px | 706px |
| 27" monitor (1440p) | 2560px | 324px | 941px |

## Future reference

To convert any new Figma measurement:

```
vw = (px / 1728) × 100
vh = (px / 1117) × 100
```

Add to Tailwind as arbitrary values: `left-[Xvw]`, `w-[Xvw]`, `h-[Yvh]`, etc.
