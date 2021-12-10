// SPDX-License-Identifier: MIT
pragma solidity ^0.8.2;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract Asharfi is ERC20 {
    mapping(address => uint256) balances;

    constructor() ERC20("Asharfi", "ASHF") {
        _mint(msg.sender, 10000 * 10**decimals());
    }
}
