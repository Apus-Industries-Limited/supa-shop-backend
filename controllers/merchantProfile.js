const { PrismaClient, Prisma } = require("@prisma/client");
const argon = require("argon2");
const { safeMer, safeMerchantchant } = require( "../constant/safeData" );
const fs = require( "fs" ).promises;

const prisma = new PrismaClient();

const uploadMerchantDp = async (req,res) =>
{
  const dp = req.file;
  const { id } = res.merchant;
  try {
    if ( !id )return res.status( 400 ).json( { message: "User Id is required" } );
    const user = await prisma.merchant.findUniqueOrThrow( {
      where:{id}, select:safeMerchant
    } )
        await fs.unlink( `./public/images/store/${ user.dp }` );
        user.dp = dp.filename;
    await prisma.merchant.update( { data: user, where: { id } } );
    return res.status(202).json({message:"Profile Updated",profile:dp.filename})
  } catch ( e ) {
    if (e instanceof Prisma.PrismaClientKnownRequestError) {
      if (e.code === "P2025"){
        res.status( 404 ).json( { message: "Merchant does not exist" } );
        await fs.unlink( `./public/images/store/${ dp.filename }` );
        return;
      }
    }
    if (e.code === "ENOENT"){
      res.status( 404 ).json( { message: "Images were not found" } );
      await fs.unlink( `./public/images/store/${ dp.filename }` );
      return;
    }
    res
      .status(500)
      .json( { message: "internal server error", error: e.message } );
    await fs.unlink( `./public/images/store/${ dp.filename }` );
    return;
  }
};

const editMerchantProfile = async ( req, res ) =>
{
  try {
    const { name, phone_number, username, address, city, country, category } = req.body;
    const { id } = res.merchant;
    if ( !id ) return res.status( 400 ).json( { message: "Merchant Id is required" } );

    const foundMerchant = await prisma.merchant.findUniqueOrThrow( { where: { id }, select: safeMerchantchant } );
    
    foundMerchant.name = name ? name : foundMerchant.name;
    foundMerchant.phone_number = phone_number ? phone_number : foundMerchant.phone_number;
    foundMerchant.username = username ? username : foundMerchant.username;
    foundMerchant.address = address ? address : foundMerchant.address;
    foundMerchant.city = city ? city : foundMerchant.city;
    foundMerchant.country = country ? country : foundMerchant.country;
    foundMerchant.category = category ? category : foundMerchant.category;

    const updatedMerchant = await prisma.merchant.update( {
      where: { id },
      data: foundMerchant,
      select: safeMerchantchant
    } )
    delete updatedMerchant.password;
    delete updatedMerchant.refresh_token;
    return res.status(200).json({message:"Profile updated", user:updatedMerchant})

  } catch ( e ) {
    if (e instanceof Prisma.PrismaClientKnownRequestError) {
      if (e.code === "P2025")
        return res.status(404).json({ message: "User not found" });
    }
    return res
      .status(500)
      .json({ message: "internal server error", error: e.message });
  }
};

const deleteMerchant = async ( req, res ) =>
{
  const { id } = res.merchant;
  try {
    const user = await prisma.merchant.findUniqueOrThrow( { where: { id } } );
    const merchantProduct = await prisma.product.findMany( { where: { merchantId: id } } );
    await prisma.merchant.delete( { where: { id } } );
    await fs.unlink( `./public/images/user/${ user.dp }` );
    return res.status( 202 ).json( { message: "Account Deleted" } );
  } catch ( e ) {
    
    if ( e instanceof Prisma.PrismaClientKnownRequestError ) {
      
      if (e.code === "P2025")
        return res.status(404).json({ message: "Meerchant not found" });
    }
    if (e.code === "ENOENT"){
      res.status( 202 ).json( { message: "Account Deleted" } );
      return;
    }
    return res
      .status(500)
      .json({ message: "internal server error", error: e.message });
  }
};

const updateMerchantPassword = async ( req, res ) =>
{
  const { id } = res.user
  const {newPassword, oldPassword} = req.body
  try {
    if ( !newPassword || !oldPassword ||!id) return res.status(400).json({message:"All filed must be entered"})
    const user = await prisma.merchant.findUniqueOrThrow( { where: { id } } );
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
        return res.status(404).json({ message: "Merchant not found" });
    }
    return res
      .status(500)
      .json({ message: "internal server error", error: e.message });
  }
}


module.exports = {updateMerchantPassword,deleteMerchant,editMerchantProfile,uploadMerchantDp}