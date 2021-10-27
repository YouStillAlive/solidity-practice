const { equal } = require('assert');
const { assert } = require('chai');

const DappToken = artifacts.require('./DappToken.sol');

require('chai').use(require('chai-as-promised')).should();

contract('DappToken', ([deployer, buyer, fromAccount, toAccount, spendingAccount]) => {
    let dappToken, totalSupply;

    before(async () => {
        dappToken = await DappToken.deployed();
        totalSupply = await dappToken.totalSupply();
    });

    describe('deployment', async () => {
        it('deploys successfully', async () => {
            const address = await dappToken.address;
            assert.notEqual(address, 0x0);
            assert.notEqual(address, '');
            assert.notEqual(address, null);
            assert.notEqual(address, undefined);
        });

        it('sets the total supply upon deployment', async () => {
            assert.equal(totalSupply.toNumber(), 1000000, 'sets the total supply to 1,000,000');
        });

        it('it allocate the initial supply to the admin', async () => {
            let adminBalance = await dappToken.balanceOf(deployer);
            assert.equal(adminBalance.toNumber(), 1000000);
        });

        it('has a name', async () => {
            const name = await dappToken.name();
            assert.equal(name, 'DApp Token');
        });

        it('has a symbol', async () => {
            const symbol = await dappToken.symbol();
            assert.equal(symbol, "DAPP");
        });

        it('has a standard', async () => {
            const standard = await dappToken.standard();
            assert.equal(standard, 'DApp Token v1.0');
        });
    });

    describe('transfer', async () => {
        it('larger than sender\'s balance', async () => {
            await dappToken.transfer(buyer, 99999999999999999999999, { from: deployer }).should.be.rejected;
        });

        it('transfer tokens', async () => {
            const result = await dappToken.transfer(buyer, 250000, { from: deployer });
            assert.equal(await dappToken.balanceOf(buyer), 250000);
            assert.equal(await dappToken.balanceOf(deployer), 750000);

            const event = result.logs[0].args;
            assert.equal(event._from, deployer, 'from is correct');
            assert.equal(event._to, buyer, '0', 'to is correct');
            assert.equal(event._value, 250000, 'value is correct');

            const returnValue = await dappToken.transfer.call(buyer, 250000, { from: deployer });
            assert.equal(returnValue, true);
        });

        it('approves tokens for delegated transfer', async () => {
            const result = await dappToken.approve(buyer, 100, { from: deployer });

            const event = result.logs[0].args;
            assert.equal(event._owner, deployer, 'from is correct');
            assert.equal(event._spender, buyer, 'to is correct');
            assert.equal(event._value, 100, 'value is correct');

            const returnValue = await dappToken.approve.call(buyer, 100, { from: deployer });
            assert.equal(returnValue, true);
        });

        it('stores the allowance for delegated transfer', async () => {
            const allowance = await dappToken.allowance(deployer, buyer);
            assert.equal(allowance.toNumber(), 100);
        });

        it('handles delegated token transfers', async () => {
            await dappToken.transfer(fromAccount, 100, { from: deployer });
            await dappToken.approve(spendingAccount, 10, { from: fromAccount });

            await dappToken.transferFrom(fromAccount, toAccount, 9999, { from: spendingAccount }).should.be.rejected;
            const result = await dappToken.transferFrom(fromAccount, toAccount, 10, { from: spendingAccount });

            const allowance = await dappToken.allowance(fromAccount, spendingAccount);
            assert.equal(allowance.toNumber(), 0);

            const event = result.logs[0].args;
            assert.equal(event._from, fromAccount, 'from is correct');
            assert.equal(event._to, toAccount, 'to is correct');
            assert.equal(event._value, 10, 'value is correct');

            const balanceFromAccount = await dappToken.balanceOf(fromAccount);
            const balanceToAccount = await dappToken.balanceOf(toAccount);

            assert.equal(balanceFromAccount.toNumber(), 90);
            assert.equal(balanceToAccount.toNumber(), 10);

            await dappToken.approve(spendingAccount, 10, { from: fromAccount });
            const returnValue = await dappToken.transferFrom.call(fromAccount, toAccount, 10, { from: spendingAccount });
            assert.equal(returnValue, true);
        });
    });
});