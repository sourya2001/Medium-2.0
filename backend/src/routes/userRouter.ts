import { Hono } from 'hono'
//creating connection pool for server less backend in cloudfare worker
import { PrismaClient } from '@prisma/client/edge'
import { withAccelerate } from '@prisma/extension-accelerate'
import { sign,verify } from 'hono/jwt';
import {signupInput,signinInput} from '@100xdevs/medium-common'

export const userRouter = new Hono<{
  Bindings:{
    DATABASE_URL: string,
    JWT_SECRET: string
  }
}>();


//type inference in zod

userRouter.post('/signup', async(c) => {
    const prisma = new PrismaClient({
      datasourceUrl: c.env.DATABASE_URL,
  }).$extends(withAccelerate())
  const body=await c.req.json();
  const {success}=signupInput.safeParse(body);
  if (!success) {
    c.status(411);
    return c.json({
        message: "Inputs not correct"
    })
}
    
    //need toi sanitie the requests
    //{
    //
    //}
    try{
    const user=await prisma.user.create({
      data:{
        email:body.username,
        password:body.password,
        name:body.name
      },
    })
    console.log
    const token=await sign({id:user.id},c.env.JWT_SECRET)
  
    return c.json({
      jwt:token
    });
  }
  catch(e){
    c.status(400);
    return c.json({
      message:"User not created"
    })
  }
  })
  
  userRouter.post('/signin', async(c) => {
    const prisma=new PrismaClient({
      datasourceUrl: c.env.DATABASE_URL,
  }).$extends(withAccelerate())
  const body=await c.req.json();
  const { success } = signinInput.safeParse(body);
  if (!success) {
    c.status(411);
    return c.json({
        message: "Inputs not correct"
    })
}
  const user=await prisma.user.findFirst({
    where:{
      email:body.username,
      password:body.password
    }
  })
  if(!user){
    c.status(403);
    return c.json({message: "Incorrect creds"})
  }
  const token=await sign({id:user.id},c.env.JWT_SECRET)
  return c.json({jwt:token});
  })
  