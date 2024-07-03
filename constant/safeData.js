const safeUser = {
      id: true,
      name: true,
      email: true,
      phone_number: true,
      username: true,
      address: true,
      dp: true,
      isVerified: true,
      isPromoted: true,
      createdAt:true
};

const safeMerchant = {
      id: true,
      name: true,
      email: true,
      phone_number: true,
      username: true,
      address: true,
      city: true,
      country: true,
      dp: true,
      isVerified: true,
      isPromoted: true,
      createdAt: true,
      category:true
};

module.exports = {safeMerchant,safeUser}