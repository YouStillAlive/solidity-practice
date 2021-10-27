const DappToken = artifacts.require("DappToken");
const DappTokenSale = artifacts.require("DappTokenSale");

module.exports = async function (deployer) {
  await deployer.deploy(DappToken, 1000000);
  const token = await DappToken.deployed();
  await deployer.deploy(DappTokenSale, token.address, '1000000000000000000');
};