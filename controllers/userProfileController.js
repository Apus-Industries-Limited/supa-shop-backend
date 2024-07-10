const { PrismaClient, Prisma } = require("@prisma/client");
const argon = require("argon2");
const { safeUser } = require( "../constant/safeData" );
const fs = require( "fs" ).promises;

const prisma = new PrismaClient();

const uploadDp = async (req,res) =>
{
  const dp = req.file;
  const { id } = res.user;
  try {
    if ( !id )return res.status( 400 ).json( { message: "User Id is required" } );
    const user = await prisma.user.findUniqueOrThrow( {
      where:{id}, select:safeUser
    } )
    if ( user.dp ) {
      await fs.unlink(`./public/images/user/${user.dp}`)
    }
    user.dp = dp.filename
    await prisma.user.update( { data: user, where: { id } } );
    return res.status(202).json({message:"Profile Updated",profile:dp.filename})
  } catch ( e ) {
    if (e instanceof Prisma.PrismaClientKnownRequestError) {
      if (e.code === "P2025"){
        res.status( 404 ).json( { message: "User does not exist" } );
        await fs.unlink( `./public/images/user/${ dp.filename }` );
        return;
      }
    }
    if (e.code === "ENOENT"){
      res.status( 404 ).json( { message: "Images were not found" } );
      await fs.unlink( `./public/images/user/${ dp.filename }` );
      return;
    }
    res
      .status(500)
      .json( { message: "internal server error", error: e.message } );
    await fs.unlink( `./public/images/user/${ dp.filename }` );
    return;
  }
}

const deleteDp = async ( req, res ) =>
{
  const { id } = res.user;
  try {
    const user = await prisma.user.findUniqueOrThrow( {
      where:{id}, select:safeUser
    } )
    await fs.unlink( `./public/images/user/${ user.dp }` );

    return res.status(200).json({message:"Profile image deleted successfully"})
  } catch (e) {
    if (e instanceof Prisma.PrismaClientKnownRequestError) {
      if (e.code === "P2025"){
        res.status( 404 ).json( { message: "User does not exist" } );
        return;
      }
    }
    if (e.code === "ENOENT"){
      res.status( 404 ).json( { message: "Image were not found" } );
      return;
    }
    res
      .status(500)
      .json( { message: "internal server error", error: e.message } );
    return;
  }
}


const editProfile = async ( req, res ) =>
{
  try {
    const { name, phone_number, username,address } = req.body;
    const { id } = res.user;
    if ( !id ) return res.status( 400 ).json( { message: "User Id is required" } );

    const foundUser = await prisma.user.findUniqueOrThrow( { where: { id } } );


    foundUser.name = name ? name : foundUser.name;
    foundUser.phone_number = phone_number ? phone_number : foundUser.phone_number;
    foundUser.username = username ? username : foundUser.username;
    foundUser.address = address ? [ {address, id: foundUser.address.length ++}, ...foundUser.address ] : foundUser.address;
    
    const updated = await prisma.user.update( {
      where: { id },
      data: foundUser,
      select:safeUser
    } )
    delete updated.password;
    delete updated.refresh_token;
    return res.status( 200 ).json( { message: "Profile Updated", user: updated } );

  } catch ( e ) {
    if (e instanceof Prisma.PrismaClientKnownRequestError) {
      if (e.code === "P2025")
        return res.status(404).json({ message: "User not found" });
    }
    return res
      .status(500)
      .json({ message: "internal server error", error: e.message });
  }
}

const deleteAccount = async (req,res) =>
{
  const { id } = res.user
  try {
    if ( !id ) return res.status( 400 ).json( { message: "User Id is required" } );
    const user = await prisma.user.findUniqueOrThrow( { where: { id } } );
    await fs.unlink( `./public/images/user/${ user.dp }` );
    await prisma.user.delete( { where: { id } } );
    return res.status(202).json({message:"Account Deleted"})
  } catch (e) {
    if (e instanceof Prisma.PrismaClientKnownRequestError) {
      if (e.code === "P2025")
        return res.status(404).json({ message: "User not found" });
    }
    return res
      .status(500)
      .json({ message: "internal server error", error: e.message });
  }
}

const updatePassword = async ( req, res ) =>
{
  const { id } = res.user
  const {newPassword, oldPassword} = req.body
  try {
    if ( !newPassword || !oldPassword ||!id) return res.status(400).json({message:"All filed must be entered"})
    const user = await prisma.user.findUniqueOrThrow( { where: { id } } );
    const verify = await argon.verify( user.password, oldPassword )
    if ( !verify ) return res.status( 401 ).json( { message: 'Current password is incorrect' } )
    const checkNewPassword = await argon.verify( user.password, newPassword );
    if ( checkNewPassword ) return res.status( 405 ).json( { message: "New password must be different from current passeord" } );
    const newHashed = await argon.hash( newPassword );
    user.password = newHashed;
    await prisma.user.update( { where: { id }, data: user } );
    return res.status( 202 ).json( { message: "Password was updated successfully" } );
  } catch (e) {
    if (e instanceof Prisma.PrismaClientKnownRequestError) {
      if (e.code === "P2025")
        return res.status(404).json({ message: "User not found" });
    }
    return res
      .status(500)
      .json({ message: "internal server error", error: e.message });
  }
}

const getAllAddress = async ( req, res ) =>
{
  const { id } = res.user
  try {
    if ( !id ) return res.status( 400 ).json( { message: "User Id is required" } );
    const user = await prisma.user.findUniqueOrThrow( { where: { id } } );
    return res.status(200).json({address:user.address})
  } catch (e) {
    if (e instanceof Prisma.PrismaClientKnownRequestError) {
      if (e.code === "P2025")
        return res.status(404).json({ message: "User not found" });
    }
    return res
      .status(500)
      .json({ message: "internal server error", error: e.message });
  }
}

const editAddress = async ( req, res ) =>
{
  const { id } = res.user;
  const { address, index } = req.body;
  try {
    if ( !id ) return res.status( 400 ).json( { message: "User Id is required" } );
    const user = await prisma.user.findUniqueOrThrow( { where: { id } } );
    const oldAddress = user.address.find( item => item.id === index )
    if ( !oldAddress ) return res.status( 400 ).json( { message: "Address was not found" } )
    oldAddress.address = address;
    user.address.filter( address => address.id !== index );
    user.address.push( oldAddress );
    await prisma.user.update( { where: id, data: user } );
    return res.status( 202 ).json( { message: "Address was updated successfully", address } );
  } catch (e) {
    if (e instanceof Prisma.PrismaClientKnownRequestError) {
      if (e.code === "P2025")
        return res.status(404).json({ message: "User not found" });
    }
    return res
      .status(500)
      .json({ message: "internal server error", error: e.message });
  }
}

const deleteAddress = async ( req, res ) =>
{
  const { id } = res.user;
  const { index } = req.params
  try {
    if ( !id )return res.status( 400 ).json( { message: "User Id is required" } );
    if ( !index ) return res.status( 400 ).json( { message: "Address id is required"} );
    const user = await prisma.user.findFirstOrThrow( { where: { id } } )
    const oldAddress = user.address.find( item => item.id === index )
    if ( !oldAddress ) return res.status( 400 ).json( { message: "Address not found" } );
    user.address.filter( address => address.id !== index );
    user.address.forEach( address =>
    {
      address.id = user.address.indexOf(address) + 1
    } )
    await prisma.user.update( { where: { id }, data: user } )
    return res.status(202).json({message:"Address Deleted", address: user.address})
    
  } catch (e) {
    if (e instanceof Prisma.PrismaClientKnownRequestError) {
      if (e.code === "P2025")
        return res.status(404).json({ message: "User not found" });
    }
    return res
      .status(500)
      .json({ message: "internal server error", error: e.message });
  }
}

const addAddress = async ( req, res ) =>
{
  const { id } = res.user;
  try {
    if ( !id ) return res.status( 400 ).json( { message: "User Id is required" } );
    const { address } = req.body;
    if ( !address ) return res.status( 400 ).json( { message: "address is required" } );
    
    const user = await prisma.user.findUniqueOrThrow( { where: id } );
    user.address.push( { address, id: user.address.length++ } );
    await prisma.user.update( {
      where: { id },
      data:user
    } )
    return res.status( 202 ).json( { message: "Address added successfully" } );
  } catch (e) {
    if (e instanceof Prisma.PrismaClientKnownRequestError) {
      if (e.code === "P2025")
        return res.status(404).json({ message: "User not found" });
    }
    return res
      .status(500)
      .json({ message: "internal server error", error: e.message });
  }
}

const deleteAllAddress = async ( req, res ) =>
{
  const { id } = res.user;
  try {
    if ( !id )return res.status( 400 ).json( { message: "User Id is required" } );
    const user = await prisma.user.findFirstOrThrow( { where: { id } } )
    user.address = []
    await prisma.user.update( { where: { id }, data: user } )
    return res.status(202).json({message:"Addresses Deleted"})
    
  } catch (e) {
    if (e instanceof Prisma.PrismaClientKnownRequestError) {
      if (e.code === "P2025")
        return res.status(404).json({ message: "User not found" });
    }
    return res
      .status(500)
      .json({ message: "internal server error", error: e.message });
  }
}


module.exports ={uploadDp,editProfile,deleteDp,deleteAccount,updatePassword,addAddress,editAddress,getAllAddress,deleteAddress,deleteAllAddress}