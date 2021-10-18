import React, { Component } from 'react';

class Tokens extends Component {
    render() {
        return (
            <div className="row text-center">
                {this.props.colors.map((color, key) => {
                    let price;
                    return (
                        <div key={key} className="col-md-3 border m-2 p-2 rounded">
                            <div className="token shadow" style={{ backgroundColor: color.color }}></div>
                            <div className="form-check text-left"><b>color: {color.color}</b></div>
                            <div className="form-check text-left"><b>current price: {color.price + ' Eth'}</b></div>
                            <div className="form-check text-left" style={{ overflow: 'hidden' }}><b>owner: {color.author}</b></div>
                            <div className="form-check m-auto text-left">
                                <label className="form-check-label m-0 text-left pr-4" htmlFor="flexSwitchCheckDefault"><b>Sell status</b></label>
                                <input className="form-check-input" checked={color.isSell} type="checkbox" id="flexSwitchCheckDefault" onClick={(e) => {
                                    this.changeSellStatus(key);
                                }} />
                            </div>
                            <div className="input-group form-check mb-3">
                                <div className="input-group-prepend">
                                    <span className="input-group-text"><b>Price</b></span>
                                </div>
                                <input type="text" className="form-control" onChange={(e) => {
                                    price = e.target.value;
                                }} />
                                <div className="input-group-append">
                                    <button onClick={(e) => {
                                        this.changePrice(key, price);
                                    }} className="btn btn-primary"><b>Change</b></button>
                                </div>
                            </div>
                            {color.isSell ?
                                <input
                                    type="submit"
                                    className="btn form-check btn-primary"
                                    value="BUY" onClick={() => {
                                        this.buy(key, color.price);
                                    }} />
                                :
                                <input
                                    type="submit"
                                    className="btn form-check btn-primary"
                                    value="BUY" style={{ opacity: '.3' }} disabled />}
                        </div>
                    );
                })}
            </div>
        );
    }
}

export default Tokens;
