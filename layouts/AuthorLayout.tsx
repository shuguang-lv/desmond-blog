import { ReactNode } from 'react'
import type { Authors } from 'contentlayer/generated'
import SocialIcon from '@/components/social-icons'
import Image from '@/components/Image'
import { PageSEO } from '@/components/SEO'

interface Props {
  children: ReactNode
  content: Omit<Authors, '_id' | '_raw' | 'body'>
}

export default function AuthorLayout({ children, content }: Props) {
  const { name, avatar, occupation, company, email, twitter, linkedin, github } = content

  return (
    <>
      <PageSEO title={`About - ${name}`} description={`About me - ${name}`} />
      <div className="flex flex-col">
        <div className="space-y-2 pt-6 pb-8 md:space-y-5">
          <h1 className="md:leading-14 text-3xl font-extrabold leading-9 tracking-tight sm:text-4xl sm:leading-10 md:text-6xl">
            About
          </h1>
          <div className="divider"></div>
        </div>
        <div className="items-start space-y-2 xl:grid xl:grid-cols-3 xl:gap-x-8 xl:space-y-0">
          <div className="flex flex-col items-center space-x-2 pt-8">
            <Image
              src={avatar}
              alt="avatar"
              width={192}
              height={192}
              className="h-48 w-48 rounded-full"
            />
            <h3 className="pt-4 pb-2 text-2xl font-bold leading-8 tracking-tight">{name}</h3>
            <p>{occupation}</p>
            <p>{company}</p>
            <div className="flex space-x-3 pt-6">
              <SocialIcon kind="mail" href={`mailto:${email}`} />
              <SocialIcon kind="github" href={github} />
              <SocialIcon kind="linkedin" href={linkedin} />
              <SocialIcon kind="twitter" href={twitter} />
            </div>
          </div>
          <div className="dark:prose-dark prose max-w-none pt-8 pb-8 xl:col-span-2">{children}</div>
        </div>
      </div>
    </>
  )
}
