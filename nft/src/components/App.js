import React, { Component } from 'react';
import Web3 from 'web3';
import './App.css';
import Color from '../abis/Color.json';
import Navbar from './Navbar.js';
import Tokens from './Tokens.js'

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      account: '',
      contract: null,
      totalSupply: 0,
      colors: [],
      id: 0
    }
  }

  async componentWillMount() {
    await this.loadWeb3();
    await this.loadBlockchainData();
  }

  async loadWeb3() {
    if (window.ethereum) {
      window.web3 = new Web3(window.ethereum);
      await window.ethereum.enable();
    }
    else if (window.web3) {
      window.web3 = new Web3(window.web3.currentProvider);
    }
    else {
      window.alert('Non-Ethereum browser detected. You should consider trying MetaMask!');
    }
  }

  async loadBlockchainData() {
    const web3 = window.web3;
    const accounts = await web3.eth.getAccounts();
    this.setState({ account: accounts[0] });
    const networkId = await web3.eth.net.getId();
    const networkData = Color.networks[networkId];
    if (networkData) {
      const abi = Color.abi;
      const address = networkData.address;
      const contract = new web3.eth.Contract(abi, address);
      this.setState({ contract });
      const totalSupply = await contract.methods.totalSupply().call();
      this.setState({ totalSupply });

      for (let i = 0; i < totalSupply; i++) {
        const token = await contract.methods.tokens(i).call();
        this.setState({ colors: [...this.state.colors, token] });
      }
    }
    else {
      window.alert('Smart contract not deployed to detected network.');
    }
  }

  mint = async (color) => {
    this.state.contract.methods.mint(color).send({ from: this.state.account });
  }

  changeSellStatus = (id) => {
    this.state.contract.methods.changeSellStatus(id).send({ from: this.state.account });
  }

  changePrice = (id, price) => {
    this.state.contract.methods.changePrice(id, price).send({ from: this.state.account });
  }

  buy = (id, price) => {
    this.state.contract.methods.buy(id).send({ from: this.state.account, value: window.web3.utils.toWei(price.toString(), 'Ether') });
  }

  render() {
    return (
      <div >
        <Navbar account={this.state.account} />
        <div className="container-fluid mt-5">
          <div className="row">
            <div role="main" className="col-lg-12 d-flex text-center">
              <div className="content mr-auto ml-auto">
                <h1>Issue Token</h1>
                <form onSubmit={async (event) => {
                  event.preventDefault();
                  const color = this.color.value;
                  await this.mint(color);
                }}>
                  <input
                    type="text"
                    className="form-control mb-1"
                    placeholder="e.g. #FFFFFF"
                    ref={(input) => {
                      this.color = input;
                    }} />
                  <input
                    type="submit"
                    className="btn btn-block btn-primary"
                    value="MINT" />
                </form>
              </div>
            </div>
          </div>
          <hr />
          <Tokens colors={this.state.colors} />
        </div>
      </div>
    );
  }
}

export default App;