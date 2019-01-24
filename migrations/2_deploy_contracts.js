var SimpleStorage = artifacts.require("./SimpleStorage.sol");
var Battleship = artifacts.require("./Battleship.sol");

module.exports = function(deployer) {
  deployer.deploy(SimpleStorage);
  deployer.deploy(Battleship);
};
