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
        // const session = await getSession();

      const {
        deploymentName,
        gitURL,
        deploymentType,
        userId,
        projectId
      } = await request.json()
      console.log(    deploymentName,
        gitURL,
        deploymentType,
        userId,
        projectId,process.env.AWS_BUILDER_IMAGE)
  
      // 1. Fetch username
      // const user = await prisma.user.findUnique({
      //   where: { id: userId },
      //   select: { username: true }
      // })
  
      // if (!user) {
      //   return NextResponse.json({ error: 'User not found' }, { status: 404 })
      // }
  
      // 2. Generate numeric suffix
      const randomNumber = Math.floor(100000 + Math.random() * 900000)
      const normalizedProjectId = String(projectId || '').replace(/\s+/g, '')
      const projectSlug = `${normalizedProjectId}-${randomNumber}`
  
      // 3. Build proxy URL
      const proxyUrl = `http://${projectSlug}.velocity-reverse-proxy.vercel.app`

      // 4. Queue ECS task
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

  
      // 5. Save deployment to DB
      const deployment = await prisma.Deployment.create({
        data: {
          name: deploymentName,
          projectSlug,
          proxyUrl,
          userId
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
    } catch (error) {
      console.error('Error queueing project:', error)
      return NextResponse.json(
        { error: 'Failed to queue project' },
        { status: 500 }
      )
    }
  }
