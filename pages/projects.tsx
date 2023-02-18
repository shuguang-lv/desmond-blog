import siteMetadata from '@/data/siteMetadata'
import projectsData from '@/data/projectsData'
import Card from '@/components/Card'
import { PageSEO } from '@/components/SEO'

export default function Projects() {
  return (
    <>
      <PageSEO title={`Projects - ${siteMetadata.author}`} description={siteMetadata.description} />
      <div className="flex flex-col">
        <div className="space-y-2 md:space-y-5">
          <div className="divider"></div>
          <h1 className="md:leading-14 text-3xl font-extrabold leading-9  tracking-tight sm:text-4xl sm:leading-10 md:text-6xl">
            Projects
          </h1>
          <p className="text-lg leading-7">Showcase your projects with a hero image (16 x 9)</p>
          <div className="divider"></div>
        </div>
        <div className="container py-12">
          <div className="-m-4 flex flex-wrap">
            {projectsData.map((d) => (
              <Card
                key={d.title}
                title={d.title}
                description={d.description}
                imgSrc={d.imgSrc}
                href={d.href}
              />
            ))}
          </div>
        </div>
      </div>
    </>
  )
}
