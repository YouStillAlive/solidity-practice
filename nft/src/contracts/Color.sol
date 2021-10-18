// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";

contract Color is ERC721 {
    struct Token {
        address payable author;
        uint price;
        string color;
        bool isSell;
    }

    event TokenCreated(
        address payable author,
        uint price,
        string color,
        bool isSell
    );

    Token[] public tokens;
    mapping(string => bool) _colorExists;

    constructor() ERC721("Color", "COLOR") {}

    modifier tokenExist(uint _id){
        require(_colorExists[tokens[_id].color]);
        _;
    }

    modifier onlyOwner(uint _id){
        require(msg.sender == tokens[_id].author);
        _;
    }

    function mint(string memory _color) public {
        require(!_colorExists[_color]);
        
        tokens.push(Token({
            author: payable(msg.sender),
            price:   0,
            color:  _color,
            isSell: false
            }));
        _mint(msg.sender, tokens.length);
        _colorExists[_color] = true;

        emit TokenCreated(payable(msg.sender), 0, _color, false);
    }

    function totalSupply() public view returns(uint) {
        return tokens.length;
    }

    function changePrice(uint _id, uint _price) public tokenExist(_id) onlyOwner(_id) {
        require(_price > 0 && _price != tokens[_id].price);
        require(_id >= 0 && _id < tokens.length);
        tokens[_id].price = _price;
    }

    function changeSellStatus(uint _id) public tokenExist(_id) onlyOwner(_id) {
        tokens[_id].isSell = !tokens[_id].isSell;
    }

    function buy(uint _id) public payable tokenExist(_id) {
        require(msg.sender != tokens[_id].author);
        tokens[_id].author.transfer(msg.value);
        tokens[_id].author = payable(msg.sender);
        tokens[_id].price = 0;
        tokens[_id].isSell = false;
    }
}