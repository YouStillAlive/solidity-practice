const HDWalletProvider = require('truffle-hdwallet-provider');
const Web3 = require('web3');
const compiledFactory = require('./build/CampaignFactory.json');

const provider = new HDWalletProvider(
    'soft arrow novel dignity switch grocery limit spike cry sibling soon truth',
    'https://rinkeby.infura.io/v3/7ffbdffc6bbf4c85923473479dfdf246'
);

const web3 = new Web3(provider);

const deploy = async () => {
    try {
        const accounts = await web3.eth.getAccounts();
        console.log('Attempting to deploy from account', accounts[0]);

        const result = await new web3.eth.Contract(JSON.parse(compiledFactory.interface))
            .deploy({ data: compiledFactory.bytecode })
            .send({ gas: '1000000', from: accounts[0] });

        console.log(interface);
        console.log('Contract deployed to ', result.options.address);
    }
    catch (e) {
        console.log(e);
    }
}

deploy();