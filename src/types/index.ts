export interface Position {
  x: number
  y: number
}

export interface Dimensions {
  width: number
  height: number
}

export interface ElementPosition extends Position, Dimensions {
  page: number
}

export type DraggingElement = 'signature' | 'qr' | null

export interface SavedPositions {
  signature: ElementPosition | null
  qr: ElementPosition | null
}
