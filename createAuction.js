exports.createAuction = async (event) => {
  const {title} = JSON.parse(event.body);
  const now = new Date();

  const auction = {
    title,
    status: 'OPEN',
    createdAt: now.toISOString()
  }

  // 201: Resource created
  return {
    statusCode: 201,
    body: JSON.stringify({auction})
  };
};
