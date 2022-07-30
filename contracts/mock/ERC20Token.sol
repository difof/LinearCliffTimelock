// SPDX-License-Identifier: AGPL-3.0-only
pragma solidity ^0.8.14;

import '@openzeppelin/contracts/token/ERC20/ERC20.sol';
import '@openzeppelin/contracts/utils/Context.sol';

contract ERC20Token is Context, ERC20 {
    constructor(uint256 initialSupply) ERC20('LCTToken', 'LCTT') {
        _mint(_msgSender(), initialSupply);
    }
}
