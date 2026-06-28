import { PageHeader, Container, ContentWrapper } from '@/components/layout/Layout'
import { ImageProcessor } from '@/features/image/components/ImageProcessor'

export function ImagePage() {
  return (
    <Container className="pb-24 pt-4">
      <PageHeader
        title="Image Processor"
        description="Crop, resize, and compress images with smart automatic document naming."
      />

      <ContentWrapper>
        <ImageProcessor />
      </ContentWrapper>
    </Container>
  )
}
