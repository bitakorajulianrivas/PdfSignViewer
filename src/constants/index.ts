import { Position, Dimensions } from '../types'

// PDF Letter size dimensions in points
export const PDF_PAGE_DIMENSIONS: Dimensions = {
  width: 612,
  height: 792
}

// Default positions
export const DEFAULT_SIGNATURE_POSITION: Position = { x: 50, y: 50 }
export const DEFAULT_QR_POSITION: Position = { x: 200, y: 50 }

// Default dimensions
export const DEFAULT_SIGNATURE_DIMENSIONS: Dimensions = { width: 150, height: 75 }
export const QR_SIZE = 50

// Signature constraints
export const SIGNATURE_MAX_WIDTH = 200
export const SIGNATURE_MAX_HEIGHT = 100
export const SIGNATURE_SCALE_MIN = 25
export const SIGNATURE_SCALE_MAX = 200
export const SIGNATURE_SCALE_DEFAULT = 100
