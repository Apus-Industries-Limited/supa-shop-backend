const { PrismaClient, Prisma } = require("@prisma/client");
const { safeUser } = require( "../constant/safeData" );


const prisma = new PrismaClient();

const getUser = async ( req, res ) =>
{
      const { id } = req.params;
      try {
            if ( !id ) return res.status( 400 ).json( { message: "User Id is required" } )
            const user = await prisma.user.findUniqueOrThrow( { where: { id },select:safeUser } );
            delete user.password;
            delete user.refresh_token;
            delete user.createdAt;
            delete user.address;
            return res.status(200).json(user)
      } catch (e) {
    if (e instanceof Prisma.PrismaClientKnownRequestError) {
      if (e.code === "P2025")
        return res.status(404).json({ message: "User not found" });
    }
    return res.status(500).json({ message: "internal server error", error: e });
  }
};

module.exports = {getUser}