const jwt_decode = require("jwt-decode");
const { UnauthenticatedError } = require("../errors");

const auth = (req, res, next) => {
  //check header
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    throw new UnauthenticatedError("Authorization Invalid");
  }

  const token = authHeader.split(" ")[1];
  // console.log(token);
  try {
    let payload = jwt_decode(token);
    // console.log(payload);
    console.log(payload.email);
    //attach the user with job routes
    req.user = { email: payload.email };
    next();
  } catch (error) {
    throw new UnauthenticatedError("Authorization Invalid");
  }
};

module.exports = auth;
