type RGB = `rgb(${number}, ${number}, ${number})`;
type RGBA = `rgba(${number}, ${number}, ${number}, ${number})`;
type HEX = `#${string}`;

type Color = RGB | RGBA | HEX;

export interface OffScreenIndicator {
    display: 'none' | 'block',
    angle: number,
    top: number,
    left: number,
    color: Color,
}