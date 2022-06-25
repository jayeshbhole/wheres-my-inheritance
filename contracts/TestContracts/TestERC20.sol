// SPDX-License-Identifier: SEE LICENSE IN LICENSE
pragma solidity 0.8.7;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract TestERC20 is ERC20 {
    constructor(uint initialSupply) ERC20("Test ERC20 Token", "TEST") {
        _mint(msg.sender, initialSupply);
    }
}
