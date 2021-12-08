export type BoundaryBox = {
    x: number
    y: number
    width: number
    height: number
}

export interface ISize {
    width: number
    height: number
}

export interface IPoint {
    x: number
    y: number
}

export interface VisualUpdateParams {
    /**
     * Middle of the canvas
     */
	canvasOffset: IPoint
    /**
     * Width and Height of the canvas
     */
	size: ISize
    /**
     * Zoom level of the canvas
     */
	scale: number
}

export type ViewportUpdateCallback = (params: VisualUpdateParams) => void