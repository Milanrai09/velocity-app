import { NextResponse } from 'next/server'
import { ECSClient, RunTaskCommand } from '@aws-sdk/client-ecs'
import { prisma } from '@/lib/prisma'

const ecsClient = new ECSClient({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
  }
})

export async function POST(request) {
  try {
    const {
      deploymentName,
      gitURL,
      deploymentType,
      userId,
      projectId,
      envVars,           // { KEY: 'value', ... } or undefined
    } = await request.json()

    // =========================================
    // 🔢 Generate slug
    // =========================================
    const randomNumber = Math.floor(100000 + Math.random() * 900000)
    const normalizedProjectId = String(projectId || '').replace(/\s+/g, '')
    const projectSlug = `${normalizedProjectId}-${randomNumber}`

    const proxyUrl = `http://${projectSlug}.velocity-reverse-proxy.vercel.app`

    // =========================================
    // 🌿 Dynamic env vars (Next.js only)
    // =========================================
    const dynamicEnv = []

    if (envVars && typeof envVars === 'object') {
      for (const [key, value] of Object.entries(envVars)) {
        if (key.trim() && value && String(value).trim() !== '') {
          dynamicEnv.push({
            name: key.trim(),
            value: String(value).trim()
          })
        }
      }
    }

    // =========================================
    // 🧱 Base env
    // =========================================
    const baseEnv = [
      { name: 'GIT_REPOSITORY__URL', value: gitURL },
      { name: 'PROJECT_ID', value: projectSlug },
      { name: 'USER_ID', value: userId }
    ]




    // =========================================
    // ⚛️ REACT
    // =========================================
    if (deploymentType === "react") {
      const command = new RunTaskCommand({
        cluster: process.env.AWS_ECS_CLUSTER,
        taskDefinition: process.env.AWS_ECS_TASK_DEFINITION,
        launchType: 'FARGATE',
        count: 1,
        networkConfiguration: {
          awsvpcConfiguration: {
            assignPublicIp: 'ENABLED',
            subnets: process.env.AWS_SUBNETS?.split(','),
            securityGroups: [process.env.AWS_SECURITY_GROUP]
          }
        },
        overrides: {
          containerOverrides: [
            {
              name: 'build-server-container',
              environment: [
                { name: 'GIT_REPOSITORY__URL', value: gitURL },
                { name: 'PROJECT_ID', value: projectSlug }
              ]
            }
          ]
        }
      })

      await ecsClient.send(command)

      const deployment = await prisma.deployment.create({
        data: {
          name: deploymentName,
          projectSlug,
          proxyUrl,
          userId,
          deploymentType
        }
      })

      return NextResponse.json({
        status: 'queued',
        data: {
          deploymentId: deployment.id,
          projectSlug,
          url: proxyUrl
        }
      })
    }




    // =========================================
    // ⚡ NEXTJS
    // =========================================
    if (deploymentType === "nextjs") {
      const command = new RunTaskCommand({
        cluster: process.env.NEXTJS_AWS_ECS_CLUSTER,
        taskDefinition: process.env.NEXTJS_AWS_ECS_TASK_DEFINITION,
        launchType: 'FARGATE',
        count: 1,
        networkConfiguration: {
          awsvpcConfiguration: {
            assignPublicIp: 'ENABLED',
            subnets: process.env.AWS_SUBNETS?.split(','),
            securityGroups: [process.env.AWS_SECURITY_GROUP]
          }
        },
        overrides: {
          containerOverrides: [
            {
              name: 'nextjs-build-system',
              environment: [...baseEnv, ...dynamicEnv]  // base + user-supplied envs
            }
          ]
        }
      })

      await ecsClient.send(command)

      const deployment = await prisma.deployment.create({
        data: {
          name: deploymentName,
          projectSlug,
          proxyUrl,
          userId,
          deploymentType,
          env: envVars ?? {}
        }
      })

      return NextResponse.json({
        status: 'queued',
        data: {
          deploymentId: deployment.id,
          projectSlug,
          url: proxyUrl
        }
      })
    }

    // =========================================
    // ❌ INVALID TYPE
    // =========================================
    return NextResponse.json(
      { error: 'Invalid deployment type' },
      { status: 400 }
    )

  } catch (error) {
    console.error('Error queueing project:', error)

    return NextResponse.json(
      { error: 'Failed to queue project' },
      { status: 500 }
    )
  }
}