const AmazonCognitoIdentity = require("amazon-cognito-identity-js");

var poolData = {
  UserPoolId: "us-east-1_o5UNdgRXq",
  ClientId: "4o7j8edjjr1d83cje3t4i9seuk",
};

const userPool = new AmazonCognitoIdentity.CognitoUserPool(poolData);

const signUp = async (req, res) => {
  console.log(req.body);
  var dataEmail = {
    Name: "email",
    Value: req.body.email,
  };

  var dataName = {
    Name: "name",
    Value: req.body.name,
  };
  var attributeList = [];
  var attributeEmail = new AmazonCognitoIdentity.CognitoUserAttribute(
    dataEmail
  );
  var attributeName = new AmazonCognitoIdentity.CognitoUserAttribute(dataName);

  attributeList.push(attributeEmail);
  attributeList.push(attributeName);
  const signUpCallback = doSignup(req, attributeList, function (err, cogres) {
    if (err) {
      console.log(err);
      return res.status(400).send(err);
    } else {
      return res.json(cogres);
    }
  });
};

function doSignup(req, attributeList, callback) {
  userPool.signUp(
    req.body.email,
    req.body.password,
    attributeList,
    null,
    async function (err, result) {
      if (err) {
        console.log(err.message || JSON.stringify(err));
        callback(err, null);
        return;
      }
      console.log(result);
      var cognitoUser = result.user;
      console.log("user name is " + cognitoUser.getUsername());
      console.log("user name is " + result.userSub);

      //   var data = await prisma.users.create({
      //     data: {
      //       key: result.userSub,
      //       name: cognitoUser.getUsername(),
      //     },
      //   });
      //   console.log(">>>>>>>>>DB USER:>>>>>", data);
      callback(null, result);
      return;
    }
  );
}

const signIn = async (req, res) => {
  console.log(req.body);

  const signInCallback = doLogin(req, function (err, cogres) {
    if (err) {
      return res.status(400).send(err);
    } else {
      return res.json(cogres);
    }
  });
};

function doLogin(req, callback) {
  console.log("doLogin", req.body);
  var authenticationData = {
    Username: req.body.email,
    Password: req.body.password,
  };
  const authenticationDetails = new AmazonCognitoIdentity.AuthenticationDetails(
    authenticationData
  );
  var userData = {
    Username: req.body.email,
    Pool: userPool,
  };
  var cognitoUser = new AmazonCognitoIdentity.CognitoUser(userData);
  cognitoUser.authenticateUser(authenticationDetails, {
    onSuccess: async function (result) {
      /*  console.log("Access Token:" + JSON.stringify(jwt_decode(result.getAccessToken().getJwtToken())));
      console.log("Id Token + " + JSON.stringify(jwt_decode(result.getIdToken().getJwtToken())));
      console.log("Refresh Token + " + JSON.stringify(result.getRefreshToken().getToken()));*/
      callback(null, result);
      return;
    },
    onFailure: function (err) {
      console.error(err);
      callback(err, null);
      return;
    },
    mfaRequired: (codeDeliveryDetails) => {
      console.error(codeDeliveryDetails);
      cognitoUser.sendMFACode(mfaCode, this);
    },
  });
}

const confirmation = async (req, res) => {
  console.log(req.body);

  const signUpCallback = doVerification(req, function (err, cogres) {
    if (err) {
      console.log(err);
      return res.status(400).send(err);
    } else {
      return res.json(cogres);
    }
  });
};

function doVerification(req, callback) {
  const userPool = new AmazonCognitoIdentity.CognitoUserPool(poolData);
  var userData = {
    Username: req.body.email,
    Pool: userPool,
  };
  var cognitoUser = new AmazonCognitoIdentity.CognitoUser(userData);
  cognitoUser.confirmRegistration(req.body.code, true, function (err, result) {
    if (err) {
      callback(err, null);
      return;
    }
    console.log("call result: " + result);
    callback(null, result);
  });
}

module.exports = {
  signUp,
  signIn,
  confirmation,
};
