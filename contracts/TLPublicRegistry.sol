// SPDX-License-Identifier: AGPL-3.0-only

pragma solidity ^0.8.14;

import '@openzeppelin/contracts/utils/introspection/IERC165.sol';
import './ILinearCliffTimelock.sol';

contract TLPublicRegistry {
    event OnTimelockAdded(
        ILinearCliffTimelock indexed timelock,
        address indexed beneficiary
    );

    mapping(address => ILinearCliffTimelock[]) private _timelocks;
    mapping(ILinearCliffTimelock => address) private _timelockBeneficiary;

    function addTimeLock(address beneficiary, ILinearCliffTimelock timelock)
        external
    {
        require(
            _timelockBeneficiary[timelock] == address(0),
            'ERROR_ALREADY_ADDED'
        );

        require(
            timelock.supportsInterface(type(ILinearCliffTimelock).interfaceId),
            'ERROR_NOT_TIMELOCK'
        );

        require(
            timelock.beneficiary() == beneficiary,
            'ERROR_BENEFICIARY_MISMATCH'
        );

        _timelocks[beneficiary].push(timelock);
        _timelockBeneficiary[timelock] = beneficiary;

        emit OnTimelockAdded(timelock, beneficiary);
    }

    function getTimelocks(address beneficiary)
        external
        view
        returns (ILinearCliffTimelock[] memory timelocks)
    {
        return _timelocks[beneficiary];
    }
}
