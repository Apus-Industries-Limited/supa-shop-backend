const { PrismaClient, Prisma } = require( '@prisma/client' );
const nodemailer = require('nodemailer')

const prisma = new PrismaClient();

const joinWaitlist = async (req,res) =>
{
      try {
            const { email } = req.body;
            if ( !email ) return res.status( 400 ).json( { message: "Enter a valid email" } )
            await prisma.waitlist.create( {
                  data: {
                        email
                  }
            } )
            return res.status(201).json({message:"You have successfully joined supashop customer waitlist. Stay tuned for updates on your mail."})
      } catch (e) {
            if ( e instanceof Prisma.PrismaClientKnownRequestError ) {
                  if(e.code === 'P2002') return res.status(409).json({message:"Email already exist"})
            }
            return res.status(500).json({message:"internal server error", error:e})
      } finally {
            await prisma.$disconnect()
      }
}

module.exports={joinWaitlist}