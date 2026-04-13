import { FC, RefObject } from 'react'
import { Document, Page } from 'react-pdf'
import { SignatureOverlay } from '../SignatureOverlay'
import { QrOverlay } from '../QrOverlay'
import { Position, Dimensions, DraggingElement } from '../../types'
import 'react-pdf/dist/Page/AnnotationLayer.css'
import 'react-pdf/dist/Page/TextLayer.css'
import './PdfViewer.css'

interface PdfViewerProps {
  file: File
  currentPage: number
  containerRef: RefObject<HTMLDivElement | null>
  onLoadSuccess: (data: { numPages: number }) => void
  // Signature props
  signatureImage: string | null
  signaturePosition: Position
  signatureDimensions: Dimensions
  onSignatureLoad: (event: React.SyntheticEvent<HTMLImageElement>) => void
  // QR props
  qrText: string
  qrPosition: Position
  qrSize: number
  // Drag props
  draggingElement: DraggingElement
  onMouseDown: (event: React.MouseEvent, element: DraggingElement) => void
  onMouseMove: (event: React.MouseEvent) => void
  onMouseUp: () => void
}

export const PdfViewer: FC<PdfViewerProps> = ({
  file,
  currentPage,
  containerRef,
  onLoadSuccess,
  signatureImage,
  signaturePosition,
  signatureDimensions,
  onSignatureLoad,
  qrText,
  qrPosition,
  qrSize,
  draggingElement,
  onMouseDown,
  onMouseMove,
  onMouseUp
}) => {
  return (
    <div
      className="pdf-viewer-area"
      onMouseMove={onMouseMove}
      onMouseUp={onMouseUp}
      onMouseLeave={onMouseUp}
    >
      <div className="pdf-wrapper">
        <div className="pdf-object-container" ref={containerRef}>
          <Document
            file={file}
            onLoadSuccess={onLoadSuccess}
            className="pdf-document"
          >
            <Page
              pageNumber={currentPage}
              width={containerRef.current?.clientWidth}
              renderTextLayer={false}
              renderAnnotationLayer={false}
              className="pdf-page"
            />
          </Document>

          {qrText && (
            <QrOverlay
              text={qrText}
              position={qrPosition}
              size={qrSize}
              isDragging={draggingElement === 'qr'}
              onMouseDown={onMouseDown}
            />
          )}

          {signatureImage && (
            <SignatureOverlay
              image={signatureImage}
              position={signaturePosition}
              dimensions={signatureDimensions}
              isDragging={draggingElement === 'signature'}
              onMouseDown={onMouseDown}
              onLoad={onSignatureLoad}
            />
          )}
        </div>
      </div>
    </div>
  )
}
