const { equal } = require('assert');
const { assert } = require('chai');

const DappTokenSale = artifacts.require('./DappTokenSale.sol');
const DappToken = artifacts.require('./DappToken.sol');

require('chai').use(require('chai-as-promised')).should();

contract('DappTokenSale', ([admin, buyer, fromAccount, toAccount, spendingAccount]) => {
    let tokenContract, dappTokenSale, price;

    before(async () => {
        tokenContract = await DappToken.deployed(1000000);
        dappTokenSale = await DappTokenSale.deployed(tokenContract.address, web3.utils.toWei('1', 'Ether'));
        price = await dappTokenSale.tokenPrice();
    });

    describe('deployment', async () => {
        it('deploys successfully', async () => {
            const address = await dappTokenSale.address;
            assert.notEqual(address, 0x0);
            assert.notEqual(address, '');
            assert.notEqual(address, null);
            assert.notEqual(address, undefined);
        });

        it('check start values', async () => {
            const address = await dappTokenSale.tokenContract();
            assert.notEqual(address, 0x0);
            assert.notEqual(address, '');
            assert.notEqual(address, null);
            assert.notEqual(address, undefined);

            assert.equal(price.toString(), '1000000000000000000');
        });
    });

    describe('buy tokens', async () => {
        before(async () => {
            await tokenContract.transfer(DappTokenSale.address, 750000, { from: admin });
        })

        it('facilitates token buying', async () => {
            const numTokens = '1';
            const result = await dappTokenSale.buyTokens(numTokens, { from: fromAccount, value: (price * numTokens).toString() });
            const amount = (await dappTokenSale.tokensSold()).toString();
            assert.equal(amount, numTokens);

            const event = result.logs[0].args;
            assert.equal(event._buyer, fromAccount, 'logs the account that purchased the tokens');
            assert.equal(event._amount, numTokens, 'logs the number of tokens purchased');

            const balance = await tokenContract.balanceOf(fromAccount);
            assert.equal(balance.toString(), numTokens.toString(), 'buyer account tokens');
        });
    });

    describe('end sale', async ()=>{
        it('check admin rights', async () => {
            await dappTokenSale.endSale({ from: buyer }).should.be.rejected;
            await dappTokenSale.endSale();
        });

        it('returns all unsold dapp tokens to admin', async () => {
            const adminBalance = await tokenContract.balanceOf(admin);
            assert.equal(adminBalance.toString(), '999999');

            const balance = await web3.eth.getBalance(DappTokenSale.address);
            assert.equal(balance.toString(), '0');
        });
    });
});