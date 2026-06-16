// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/**
 * @title PropertyRegistry
 * @notice On-chain registry that records property title deeds and their ownership history.
 *         Each property is identified by a unique chain ID (e.g. "PROP-0001").
 *         Only authorised Registrars (granted by the contract owner) can mint new deeds.
 */
contract PropertyRegistry is Ownable, Pausable, ReentrancyGuard {
    /* ─────────────────────────── Types ─────────────────────────── */

    struct Property {
        string  chainId;        // e.g. "PROP-0001"
        address owner;          // current owner wallet
        string  metadataUri;    // IPFS / Arweave URI for off-chain metadata
        uint256 registeredAt;
        uint256 lastTransferAt;
        bool    verified;       // oracle-verified flag
    }

    struct TransferRecord {
        address from;
        address to;
        uint256 timestamp;
        bytes32 txRef;          // optional off-chain reference hash
    }

    /* ──────────────────────── State Variables ───────────────────── */

    mapping(string => Property)            private _properties;
    mapping(string => TransferRecord[])    private _history;
    mapping(address => bool)               public  registrars;
    string[]                               private _allChainIds;

    /* ─────────────────────────── Events ────────────────────────── */

    event PropertyMinted(string indexed chainId, address indexed owner, string metadataUri);
    event OwnershipTransferred(string indexed chainId, address indexed from, address indexed to, bytes32 txRef);
    event PropertyVerified(string indexed chainId, bool status);
    event RegistrarUpdated(address indexed account, bool status);

    /* ─────────────────────────── Errors ────────────────────────── */

    error NotRegistrar();
    error PropertyNotFound();
    error PropertyAlreadyRegistered();
    error ZeroAddress();
    error SelfTransfer();

    /* ─────────────────────── Modifiers ─────────────────────────── */

    modifier onlyRegistrar() {
        if (!registrars[msg.sender] && msg.sender != owner()) revert NotRegistrar();
        _;
    }

    modifier propertyExists(string calldata chainId) {
        if (_properties[chainId].registeredAt == 0) revert PropertyNotFound();
        _;
    }

    /* ───────────────────────── Constructor ──────────────────────── */

    constructor(address initialOwner) Ownable(initialOwner) {}

    /* ─────────────────── Registrar Management ───────────────────── */

    function setRegistrar(address account, bool status) external onlyOwner {
        if (account == address(0)) revert ZeroAddress();
        registrars[account] = status;
        emit RegistrarUpdated(account, status);
    }

    /* ──────────────────────── Core Functions ────────────────────── */

    /**
     * @notice Mint (register) a new property deed on-chain.
     */
    function mintProperty(
        string calldata chainId,
        address propertyOwner,
        string calldata metadataUri
    ) external onlyRegistrar whenNotPaused {
        if (propertyOwner == address(0)) revert ZeroAddress();
        if (_properties[chainId].registeredAt != 0) revert PropertyAlreadyRegistered();

        _properties[chainId] = Property({
            chainId:        chainId,
            owner:          propertyOwner,
            metadataUri:    metadataUri,
            registeredAt:   block.timestamp,
            lastTransferAt: block.timestamp,
            verified:       false
        });

        _allChainIds.push(chainId);
        emit PropertyMinted(chainId, propertyOwner, metadataUri);
    }

    /**
     * @notice Transfer ownership of a registered property.
     *         Can only be called by the current owner or an authorised registrar.
     */
    function transferOwnership(
        string calldata chainId,
        address newOwner,
        bytes32 txRef
    ) external nonReentrant whenNotPaused propertyExists(chainId) {
        Property storage prop = _properties[chainId];
        if (msg.sender != prop.owner && !registrars[msg.sender] && msg.sender != owner()) revert NotRegistrar();
        if (newOwner == address(0)) revert ZeroAddress();
        if (newOwner == prop.owner) revert SelfTransfer();

        address previousOwner = prop.owner;
        prop.owner           = newOwner;
        prop.lastTransferAt  = block.timestamp;

        _history[chainId].push(TransferRecord({
            from:      previousOwner,
            to:        newOwner,
            timestamp: block.timestamp,
            txRef:     txRef
        }));

        emit OwnershipTransferred(chainId, previousOwner, newOwner, txRef);
    }

    /**
     * @notice Mark/unmark a property as oracle-verified.
     */
    function setVerified(string calldata chainId, bool status)
        external
        onlyRegistrar
        whenNotPaused
        propertyExists(chainId)
    {
        _properties[chainId].verified = status;
        emit PropertyVerified(chainId, status);
    }

    /* ─────────────────────────── Views ─────────────────────────── */

    function getProperty(string calldata chainId)
        external
        view
        propertyExists(chainId)
        returns (Property memory)
    {
        return _properties[chainId];
    }

    function getHistory(string calldata chainId)
        external
        view
        propertyExists(chainId)
        returns (TransferRecord[] memory)
    {
        return _history[chainId];
    }

    function totalProperties() external view returns (uint256) {
        return _allChainIds.length;
    }

    function getAllChainIds() external view returns (string[] memory) {
        return _allChainIds;
    }

    /* ─────────────────────── Admin Controls ─────────────────────── */

    function pause()   external onlyOwner { _pause(); }
    function unpause() external onlyOwner { _unpause(); }
}
