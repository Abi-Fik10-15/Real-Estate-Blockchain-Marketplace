// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";

/**
 * @title EscrowManager
 * @notice Holds buyer funds in escrow during a property purchase negotiation.
 *         Flow:
 *   1. Buyer calls `deposit()` with ETH payment for a property.
 *   2. Seller (owner) calls `release()` to release funds to seller after conditions met.
 *   3. Either party can call `refund()` if the deal falls through.
 *
 * Each escrow is keyed by (buyer, chainId) so multiple deals can run in parallel.
 */
contract EscrowManager is Ownable, Pausable, ReentrancyGuard {
    /* ─────────────────────── Types ─────────────────────── */

    enum EscrowStatus { NONE, DEPOSITED, RELEASED, REFUNDED }

    struct Escrow {
        address buyer;
        address seller;
        string  chainId;        // property chain ID
        uint256 amount;
        uint256 createdAt;
        uint256 expiresAt;
        EscrowStatus status;
    }

    /* ──────────────────── State Variables ──────────────── */

    // escrowId → Escrow
    mapping(bytes32 => Escrow) public escrows;
    // track escrow IDs per buyer
    mapping(address => bytes32[]) public buyerEscrows;

    uint256 public platformFeeBps = 100; // 1% fee (basis points)
    address public feeRecipient;

    /* ─────────────────────── Events ────────────────────── */

    event EscrowCreated(bytes32 indexed escrowId, address indexed buyer, address indexed seller, string chainId, uint256 amount, uint256 expiresAt);
    event EscrowReleased(bytes32 indexed escrowId, address indexed seller, uint256 netAmount, uint256 fee);
    event EscrowRefunded(bytes32 indexed escrowId, address indexed buyer, uint256 amount);
    event FeeUpdated(uint256 newFeeBps);

    /* ─────────────────────── Errors ────────────────────── */

    error InvalidAmount();
    error EscrowNotFound();
    error EscrowAlreadyExists();
    error NotBuyer();
    error NotSeller();
    error EscrowExpired();
    error EscrowNotActive();
    error TransferFailed();
    error InvalidFee();

    /* ───────────────────── Constructor ─────────────────── */

    constructor(address initialOwner, address _feeRecipient) Ownable(initialOwner) {
        feeRecipient = _feeRecipient;
    }

    /* ────────────────── Escrow ID Helper ───────────────── */

    function getEscrowId(address buyer, string calldata chainId)
        public
        pure
        returns (bytes32)
    {
        return keccak256(abi.encodePacked(buyer, chainId));
    }

    /* ──────────────────── Core Functions ────────────────── */

    /**
     * @notice Buyer deposits funds into escrow for a property purchase.
     * @param seller    The property seller/owner address.
     * @param chainId   The property chain ID.
     * @param duration  Escrow duration in seconds (e.g. 7 days = 604800).
     */
    function deposit(
        address seller,
        string calldata chainId,
        uint256 duration
    ) external payable nonReentrant whenNotPaused {
        if (msg.value == 0) revert InvalidAmount();

        bytes32 escrowId = getEscrowId(msg.sender, chainId);
        if (escrows[escrowId].status == EscrowStatus.DEPOSITED) revert EscrowAlreadyExists();

        uint256 expiresAt = block.timestamp + duration;

        escrows[escrowId] = Escrow({
            buyer:     msg.sender,
            seller:    seller,
            chainId:   chainId,
            amount:    msg.value,
            createdAt: block.timestamp,
            expiresAt: expiresAt,
            status:    EscrowStatus.DEPOSITED
        });

        buyerEscrows[msg.sender].push(escrowId);

        emit EscrowCreated(escrowId, msg.sender, seller, chainId, msg.value, expiresAt);
    }

    /**
     * @notice Seller releases escrow, claiming funds (minus platform fee).
     */
    function release(bytes32 escrowId) external nonReentrant whenNotPaused {
        Escrow storage esc = escrows[escrowId];
        if (esc.amount == 0) revert EscrowNotFound();
        if (esc.status != EscrowStatus.DEPOSITED) revert EscrowNotActive();
        if (msg.sender != esc.seller && msg.sender != owner()) revert NotSeller();

        esc.status = EscrowStatus.RELEASED;

        uint256 fee       = (esc.amount * platformFeeBps) / 10_000;
        uint256 netAmount = esc.amount - fee;

        _transfer(esc.seller, netAmount);
        if (fee > 0) _transfer(feeRecipient, fee);

        emit EscrowReleased(escrowId, esc.seller, netAmount, fee);
    }

    /**
     * @notice Refund buyer if deal falls through or escrow expires.
     */
    function refund(bytes32 escrowId) external nonReentrant {
        Escrow storage esc = escrows[escrowId];
        if (esc.amount == 0) revert EscrowNotFound();
        if (esc.status != EscrowStatus.DEPOSITED) revert EscrowNotActive();
        if (msg.sender != esc.buyer && msg.sender != owner()) revert NotBuyer();

        esc.status = EscrowStatus.REFUNDED;

        _transfer(esc.buyer, esc.amount);
        emit EscrowRefunded(escrowId, esc.buyer, esc.amount);
    }

    /* ─────────────────── Admin Controls ─────────────────── */

    function setPlatformFee(uint256 newFeeBps) external onlyOwner {
        if (newFeeBps > 1000) revert InvalidFee(); // max 10%
        platformFeeBps = newFeeBps;
        emit FeeUpdated(newFeeBps);
    }

    function setFeeRecipient(address newRecipient) external onlyOwner {
        feeRecipient = newRecipient;
    }

    function pause()   external onlyOwner { _pause(); }
    function unpause() external onlyOwner { _unpause(); }

    /* ─────────────────── Internal Helpers ───────────────── */

    function _transfer(address to, uint256 amount) internal {
        (bool ok, ) = payable(to).call{value: amount}("");
        if (!ok) revert TransferFailed();
    }

    receive() external payable {}
}
