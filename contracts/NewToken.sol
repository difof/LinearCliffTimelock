// SPDX-License-Identifier: AGPL-3.0-only
pragma solidity ^0.8.4;

import '@openzeppelin/contracts/token/ERC20/ERC20.sol';
import '@openzeppelin/contracts/utils/Context.sol';

contract NewToken is Context, ERC20 {
    constructor(uint256 initialSupply) ERC20('NewToken', 'NTK') {
        _mint(msg.sender, initialSupply);
    }
}
