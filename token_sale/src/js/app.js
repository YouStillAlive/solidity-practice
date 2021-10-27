App = {
    web3Provider: null,
    contracts: {},
    account: '0x0',
    loading: false,
    tokenPrice: '1000000000000000',
    tokensSold: 0,
    tokensAvailable: '750000',
    dappTokenSale: '',

    init: async function () {
        console.log("App initialized...")
        return await App.initWeb3();
    },

    initWeb3: async function () {
        if (typeof web3 !== 'undefined') {
            App.web3Provider = web3.currentProvider;
            web3 = new Web3(web3.currentProvider);
        } else {
            App.web3Provider = new Web3.providers.HttpProvider('http://localhost:8545');
            web3 = new Web3(App.web3Provider);
        }
        // async () => {
        //     if (window.ethereum) {
        //       window.web3 = new Web3(window.ethereum);
        //       await window.ethereum.enable();
        //     }
        //     else if (window.web3) {
        //       window.web3 = new Web3(window.web3.currentProvider);
        //     }
        //     else {
        //       window.alert('Non-Ethereum browser detected. You should consider trying MetaMask!');
        //     }
        //   }  
        return App.initContracts();
    },

    initContracts: function () {
        $.getJSON("DappTokenSale.json", function (dappTokenSale) {
            App.contracts.DappTokenSale = TruffleContract(dappTokenSale);
            App.contracts.DappTokenSale.setProvider(App.web3Provider);

            App.contracts.DappTokenSale.deployed().then(function (dappTokenSale) {
                console.log("Dapp Token Sale Address:", dappTokenSale.address);
            });
        }).done(function () {
            $.getJSON("DappToken.json", function (dappToken) {
                App.contracts.DappToken = TruffleContract(dappToken);
                App.contracts.DappToken.setProvider(App.web3Provider);
                App.contracts.DappToken.deployed().then(function (dappToken) {
                    console.log("Dapp Token Address:", dappToken.address);
                });

                App.listenForEvents();
                return App.render();
            });
        })
    },

    listenForEvents: function () {
        App.contracts.DappTokenSale.deployed().then(function (instance) {
            instance.Sell({}, {
                fromBlock: 0,
                toBlock: 'latest',
            }).watch(function (error, event) {
                console.log("event triggered", event);
                App.render();
            })
        })
    },

    render: () => {
        if (App.loading) {
            return;
        }
        App.loading = true;

        let loader = $('#loader');
        let content = $('#content');

        loader.show();
        content.hide();

        web3.eth.getCoinbase((err, account) => {
            if (err === null) {
                App.account = account;
                $('#accountAddress').html("Your Account: " + account);
            }
        })

        App.contracts.DappTokenSale.deployed().then((instance) => {
            dappTokenSaleInstance = instance;
            return dappTokenSaleInstance.tokenPrice();
        }).then(function (tokenPrice) {
            App.tokenPrice = tokenPrice;
            $('.token-price').html(web3.fromWei(App.tokenPrice, "ether").toNumber());
            return dappTokenSaleInstance.tokensSold();
        }).then(function (tokensSold) {
            App.tokensSold = tokensSold.toNumber();
            $('.tokens-sold').html(App.tokensSold);
            $('.tokens-available').html(App.tokensAvailable);

            let progressPercent = (Math.ceil(App.tokensSold) / App.tokensAvailable) * 100;
            $('#progress').css('width', progressPercent + '%');

            App.contracts.DappToken.deployed().then((instance) => {
                dappTokenInstance = instance;
                return dappTokenInstance.balanceOf(App.account);
            }).then(function (balance) {
                $('.dapp-balance').html(balance.toNumber());
                App.loading = false;
                loader.hide();
                content.show();
            })
        });
    },

    buyTokens: () => {
        $('#content').hide();
        $('#loader').show();
        let numberOfTokens = $('#numberOfTokens').val();
        App.contracts.DappTokenSale.deployed().then((instance) => {
            return instance.buyTokens(numberOfTokens, {
                from: App.account,
                value: (numberOfTokens * App.tokenPrice).toString(),
                gas: 500000
            });
        }).then((result) => {
            console.log("Tokens bought...")
            $('form').trigger('reset')
        });
    }
}

$(function () {
    $(window).load(() => {
        App.init();
    })
});