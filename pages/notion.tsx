import siteMetadata from '@/data/siteMetadata'
import { PageSEO } from '@/components/SEO'
import { ExtendedRecordMap } from 'notion-types'
import { NotionPage } from '@/layouts/NotionLayout'
import { request } from '@/lib/fetch'

export const getStaticProps = async () => {
  const pageId = process.env.NEXT_PUBLIC_NOTION_PAGE_ID
  const recordMap = await request.get('/notion', {
    params: { page_id: pageId },
  })

  return {
    props: {
      recordMap,
    },
    revalidate: 10,
  }
}

export default function Notion({ recordMap }: { recordMap: ExtendedRecordMap }) {
  return (
    <>
      <PageSEO title={`Projects - ${siteMetadata.author}`} description={siteMetadata.description} />
      <NotionPage recordMap={recordMap} previewImagesEnabled />
    </>
  )
}
