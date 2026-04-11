import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(req) {
  try {
    const body = await req.json()

    const {
      projectId,
      userId,
      status,
      deployedUrl,
      image,
      ecrUri,
      imageTag,
      cluster,
      service,
      taskFamily,
      region,
      deployedAt,
      error
    } = body

    console.log(
        '📩 Callback Payload:\n',
        JSON.stringify({
          projectId,
          userId,
          status,
          deployedUrl,
          image,
          ecrUri,
          imageTag,
          cluster,
          service,
          taskFamily,
          region,
          deployedAt,
          error
        }, null, 2)
      )
    // =========================================
    // 🔐 VERIFY SECRET (IMPORTANT)
    // =========================================
    const incomingSecret = req.headers.get('x-callback-secret')
    const expectedSecret = process.env.CALLBACK_SECRET

    if (!expectedSecret || incomingSecret !== expectedSecret) {
      return NextResponse.json(
        { error: 'Unauthorized callback' },
        { status: 401 }
      )
    }

    console.log('📩 Callback received:', {
      projectId,
      status,
      deployedUrl
    })

    // =========================================
    // 🔎 FIND DEPLOYMENT
    // =========================================
    const deployment = await prisma.deployment.findUnique({
      where: {
        projectSlug: projectId
      }
    })

    if (!deployment) {
      return NextResponse.json(
        { error: 'Deployment not found' },
        { status: 404 }
      )
    }

    // =========================================
    // 💾 UPDATE DEPLOYMENT
    // =========================================
    // await prisma.deployment.update({
    //   where: {
    //     projectSlug: projectId
    //   },
    //   data: {
    //     status,                 // 🔥 you should add this field in schema
    //     deployedUrl,
    //     updatedAt: new Date(),

    //     // optional metadata (store in JSON or separate fields)
    //     buildMeta: {
    //       ecrUri,
    //       imageTag,
    //       cluster,
    //       service,
    //       taskFamily,
    //       region,
    //       deployedAt,
    //       error
    //     }
    //   }
    // })



    return NextResponse.json({
      success: true,
      message: 'Deployment updated successfully'
    })

  } catch (err) {
    console.error('❌ Callback error:', err)

    return NextResponse.json(
      { error: 'Callback failed' },
      { status: 500 }
    )
  }
}




