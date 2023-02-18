import { NextResponse } from 'next/server'
import { Client } from '@notionhq/client'

if (!process.env.NEXT_PUBLIC_NOTION_SECRET || !process.env.NEXT_PUBLIC_DATABASE_ID) {
  throw new Error('Missing Notion api key')
}

export const config = {
  runtime: 'edge',
}

const handler = async (): Promise<Response> => {
  try {
    const notion = new Client({
      auth: process.env.NEXT_PUBLIC_NOTION_SECRET,
    })
    const res = await notion.databases.query({
      database_id: process.env.NEXT_PUBLIC_DATABASE_ID,
    })
    return NextResponse.json(res)
  } catch (error) {
    return new Response(error, { status: 500 })
  }
}

export default handler
