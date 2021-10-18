const { assert } = require('chai')

const Color = artifacts.require('./Color.sol')

require('chai').use(require('chai-as-promised')).should()

contract('Color', ([deployer, author, buyer]) => {
    let contract

    before(async () => {
        contract = await Color.deployed()
    })

    describe('deployment', async () => {
        it('deploys succesfully', async () => {
            const address = contract.address
            assert.notEqual(address, '')
            assert.notEqual(address, 0x0)
            assert.notEqual(address, null)
            assert.notEqual(address, undefined)
        })

        it('has a name', async () => {
            const name = await contract.name()
            assert.equal(name, 'Color')
        })

        it('has a symbol', async () => {
            const symbol = await contract.symbol()
            assert.equal(symbol, 'COLOR')
        })
    })

    describe('tokens', async () => {
        let result, tokensCount

        before(async () => {
            result = await contract.mint('#EC058E', { from: author })
            tokensCount = await contract.totalSupply()
        })

        it('creates a new token', async () => {
            const totalSupply = await contract.totalSupply()
            assert.equal(totalSupply, 1)
            const event = result.logs[0].args
            assert.equal(event.tokenId.toNumber(), 1, 'id is correct')
            assert.equal(
                event.from,
                '0x0000000000000000000000000000000000000000',
                'from is correct',
            )
            assert.equal(event.to, author, 'to is correct')

            await contract.mint('#EC058E').should.be.rejected
        })

        it('check token start value', async () => {
            const event = result.logs[1].args
            assert.equal(event.color, '#EC058E', 'color is correct')
            assert.equal(event.price, '0', 'price is correct')
            assert.equal(event.author, author, 'author is correct')
            assert.equal(event.isSell, false, 'status sell is correct')
        })

        it('token availability', async () => {
            const token = await contract.tokens(tokensCount - 1)
            assert.equal(token.color, '#EC058E', 'color is correct')
            assert.equal(token.price, '0', 'price is correct')
            assert.equal(token.author, author, 'author is correct')
            assert.equal(token.isSell, false, 'status sell is correct')

            await contract.mint('#000000', { from: author }) //Second token
            tokensCount = await contract.totalSupply()
            const secondToken = await contract.tokens(tokensCount - 1)

            assert.equal(secondToken.color, '#000000', 'color is correct')
            assert.equal(secondToken.price, '0', 'price is correct')
            assert.equal(secondToken.author, author, 'author is correct')
            assert.equal(secondToken.isSell, false, 'status sell is correct')
        })
    })

    describe('methods accessability', async () => {
        let token, validId = 0
        let unvalidId = 15, validPrice = 1

        before(async () => {
            token = await contract.tokens(validId)
        })

        it('token exist when change the price', async () => {
            await contract.changePrice(validId, validPrice, { from: token.author })
            await contract.changePrice(unvalidId, validPrice + 1, { from: token.author }).should.be.rejected
        })

        it('token exist when change the sell status', async () => {
            await contract.changeSellStatus(validId, { from: token.author })
            await contract.changeSellStatus(unvalidId, { from: token.author }).should.be.rejected
        })

        it('only the owner can change the price', async () => {
            await contract.changePrice(validId, validPrice + 1, { from: token.author })
            await contract.changePrice(validId, validPrice, { from: buyer }).should.be.rejected
        })

        it('only the owner can change the sell status', async () => {
            await contract.changeSellStatus(validId, { from: token.author })
            await contract.changeSellStatus(validId, { from: buyer }).should.be.rejected
        })

        it('the buyer is not the author', async () => {
            await contract.buy(validId, { from: author, value: web3.utils.toWei(token.price, 'Ether') }).should.be.rejected
        })

        it('token exists upon purchase', async () => {
            await contract.buy(validId, { from: buyer, value: web3.utils.toWei(token.price, 'Ether') })
            await contract.buy(unvalidId, { from: author, value: web3.utils.toWei(token.price, 'Ether') }).should.be.rejected
        })
    })

    describe('marketing', async () => {
        let token, id = 0
        before(async () => {
            token = await contract.tokens(id)
            if (token.author !== author)
                await contract.buy(0, { from: author, value: web3.utils.toWei(token.price, 'Ether') })
        })

        it('change price', async () => {
            let newPrice = parseInt(token.price) + 2
            await contract.changePrice(id, newPrice, { from: author })
            token = await contract.tokens(id)
            assert.equal(newPrice.toString(), token.price.toString(), 'price is correct')

            await contract.changePrice(id, 0, { from: author }).should.be.rejected
        })

        it('change status sell', async () => {
            let newSellStatus = !token.isSell
            await contract.changeSellStatus(id, { from: author })
            token = await contract.tokens(id)
            assert.equal(newSellStatus, token.isSell, 'status is correct')
        })

        it('test new owner token', async () => {
            let oldOwner = author
            let newOwner = buyer
            await contract.buy(id, { from: newOwner, value: web3.utils.toWei(token.price, 'Ether') })
            token = await contract.tokens(id)

            assert.equal(newOwner, token.author, 'owner is correct')
            assert.equal('0', token.price)
            assert.equal(false, token.isSell)
            assert.notEqual(newOwner, oldOwner)

            await contract.buy(id, { from: oldOwner, value: web3.utils.toWei(token.price, 'Ether') })
        })

        it('transfer money', async () => {
            let oldSellerBalance = await web3.eth.getBalance(author)
            oldSellerBalance = new web3.utils.BN(oldSellerBalance)

            await contract.buy(id, { from: buyer, value: web3.utils.toWei('1', 'Ether') })

            let newSellerBalance
            newSellerBalance = await web3.eth.getBalance(author)
            newSellerBalance = new web3.utils.BN(newSellerBalance)

            let price
            price = web3.utils.toWei('1', 'Ether')
            price = new web3.utils.BN(price)
            const exepectedBalance = oldSellerBalance.add(price)

            assert.equal(newSellerBalance.toString(), exepectedBalance.toString())
        })
    })
})