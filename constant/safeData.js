const safeUser = {
      id: true,
      name: true,
      email: true,
      phone_number: true,
      username: true,
      address: true,
      dp: true,
      isVerified: true,
      createdAt: true,
      password: true,
      refresh_token:true
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
      category: true,
      password: true,
      refresh_token: true,
      ratings: true,
      reviews:true
};

const productSelect = {
      id: true,
      name: true,
      description: true,
      price: true,
      merchantId: true,
      category: true,
      dp: true,
      images: true,
      quantity: true,
      isInStock: true,
      color: true,
      dimension: true,
      ratings: true,
      isFeatured: true,
      reviews:true
}

module.exports = {safeMerchant,safeUser, productSelect}