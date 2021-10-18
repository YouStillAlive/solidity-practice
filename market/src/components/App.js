import React, { Component } from 'react';
import Web3 from 'web3';
import './App.css';
import Marketplace from '../abis/Marketplace.json'
import Navbar from './Navbar.js';
import Main from './Main.js';

class App extends Component {
  async componentWillMount() {
    await this.loadWeb3();
    await this.loadBlockchainData();
  }

  async loadWeb3() {
    if (window.ethereum) {
      await window.ethereum.send('eth_requestAccounts');
      window.web3 = new Web3(window.ethereum);
    }
    else {
      console.log('Non-Ethereum browser detected. You should consider trying MetaMask!');
    }
  }

  async loadBlockchainData() {
    try {
      const web3 = window.web3;
      const accounts = await web3.eth.getAccounts();
      this.setState({ account: accounts[0] });
      const networkId = await web3.eth.net.getId();
      const networkData = Marketplace.networks[networkId];
      if (networkData) {
        const marketplace = web3.eth.Contract(Marketplace.abi, networkData.address);
        this.setState({ marketplace });

        const productCount = await marketplace.methods.productCount().call();
        this.setState({ productCount });

        for (let i = 1; i <= productCount; i++) {
          const product = await marketplace.methods.products(i).call();
          this.setState({
            products: [...this.state.products, product]
          });
        }
        this.setState({ loading: false });
      }
      else {
        window.alert('Marketplace contract not deployed to detected network.');
      }
    }
    catch (e) {
      console.log(e);
    }
  }

  createProduct(name, price) {
    this.setState({ loading: true });
    this.state.marketplace.methods.createProduct(name, price).send({ from: this.state.account })
    .once('receipt', (receipt) => {
      this.setState({ loading: false });
    })
  }

  purchaseProduct(id, price) {
    this.setState({ loading: true });
    this.state.marketplace.methods.purchaseProduct(id).send({ from: this.state.account, value: price })
    .once('receipt', (receipt) => {
      this.setState({ loading: false });
    });
  }

  constructor(props) {
    super(props);
    this.state = {
      account: '',
      productCount: 0,
      products: [],
      loading: true
    }
    
    this.purchaseProduct = this.purchaseProduct.bind(this);
    this.createProduct = this.createProduct.bind(this);
  }

  render() {
    return (
      <div className="bg-light h-100">
        <Navbar account={this.state.account} />
        <div className="container-fluid mt-5">
          <div className="row">
            <main role="main" className="col-lg-12 d-flex">
              {this.state.loading ?
                <div><b>Loading...</b></div>
                : <Main
                  products={this.state.products}
                  createProduct={this.createProduct}
                  purchaseProduct={this.purchaseProduct} />
              }
            </main>
          </div>
        </div>
      </div>
    );
  }
}

export default App;