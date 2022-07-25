// SPDX-License-Identifier: AGPL-3.0-only

pragma solidity ^0.8.14;

import '@openzeppelin/contracts/utils/introspection/IERC165.sol';
import '@openzeppelin/contracts/token/ERC20/IERC20.sol';
import './ILinearCliffTimelock.sol';

/**
 * @notice Public registry for LinearCliffTimelock contracts.
 * @notice The registry is used for the frontend at "https://github.com/difof" for indexing timelocks.
 */
contract TLPublicRegistry {
    event OnTimelockAdded(
        ILinearCliffTimelock indexed timelock,
        address indexed beneficiary
    );

    /// @dev List of beneficiary timelocks
    mapping(address => ILinearCliffTimelock[]) private _timelocks;

    /// @dev Used to avoid duplicate timelocks
    mapping(ILinearCliffTimelock => address) private _timelockBeneficiary;

    /**
     * @dev Maps a timelock to beneficiary
     * @param beneficiary The beneficiary of the timelock
     * @param timelock The timelock to map
     */
    function addTimelock(address beneficiary, ILinearCliffTimelock timelock)
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

        require(timelock.balance() > 0, 'ERROR_NO_BALANCE');

        _timelocks[beneficiary].push(timelock);
        _timelockBeneficiary[timelock] = beneficiary;

        emit OnTimelockAdded(timelock, beneficiary);
    }

    /**
     * @dev Returns the list of timelocks for a beneficiary
     * @param beneficiary The beneficiary of the timelocks
     * @return - The list of timelocks for the beneficiary
     */
    function timelocks(address beneficiary)
        external
        view
        returns (ILinearCliffTimelock[] memory)
    {
        return _timelocks[beneficiary];
    }
}
