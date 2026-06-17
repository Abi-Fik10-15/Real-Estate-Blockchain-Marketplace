// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/**
 * @title RealEstateMarketplace
 * @notice ERC-721 property deeds with escrow-backed sales and rental metadata.
 */
contract RealEstateMarketplace is ERC721, ERC721URIStorage, Ownable, ReentrancyGuard {
    uint256 private _nextTokenId;

    struct PropertyData {
        address owner;
        bool inEscrow;
        address escrowBuyer;
        uint256 escrowAmount;
    }

    struct RentalAgreement {
        uint256 startDate;
        uint256 endDate;
        uint256 monthlyRent;
        bool active;
    }

    mapping(uint256 => PropertyData) private _properties;
    mapping(uint256 => RentalAgreement) private _rentals;

    event PropertyListed(uint256 indexed tokenId, address indexed owner, string tokenURI);
    event EscrowDeposited(uint256 indexed tokenId, address indexed buyer, uint256 amount);
    event OwnershipTransferred(uint256 indexed tokenId, address indexed from, address indexed to);
    event RentalCreated(uint256 indexed tokenId, uint256 startDate, uint256 endDate, uint256 monthlyRent);

    constructor(address initialOwner) ERC721("ChainEstate Property", "CEP") Ownable(initialOwner) {}

    function listProperty(string memory uri) external onlyOwner returns (uint256 tokenId) {
        tokenId = ++_nextTokenId;
        _safeMint(msg.sender, tokenId);
        _setTokenURI(tokenId, uri);
        _properties[tokenId] = PropertyData(msg.sender, false, address(0), 0);
        emit PropertyListed(tokenId, msg.sender, uri);
    }

    function initiateEscrow(uint256 tokenId) external payable nonReentrant {
        require(_ownerOf(tokenId) != address(0), "Invalid token");
        PropertyData storage prop = _properties[tokenId];
        require(!prop.inEscrow, "Escrow active");
        require(msg.value > 0, "Deposit required");

        prop.inEscrow = true;
        prop.escrowBuyer = msg.sender;
        prop.escrowAmount = msg.value;

        emit EscrowDeposited(tokenId, msg.sender, msg.value);
    }

    function confirmSale(uint256 tokenId) external nonReentrant {
        PropertyData storage prop = _properties[tokenId];
        require(prop.inEscrow, "No escrow");
        require(ownerOf(tokenId) == msg.sender, "Not seller");

        address buyer = prop.escrowBuyer;
        uint256 amount = prop.escrowAmount;

        prop.inEscrow = false;
        prop.escrowBuyer = address(0);
        prop.escrowAmount = 0;

        _transfer(msg.sender, buyer, tokenId);
        prop.owner = buyer;

        (bool sent, ) = payable(msg.sender).call{value: amount}("");
        require(sent, "Transfer failed");

        emit OwnershipTransferred(tokenId, msg.sender, buyer);
    }

    function cancelEscrow(uint256 tokenId) external nonReentrant {
        PropertyData storage prop = _properties[tokenId];
        require(prop.inEscrow, "No escrow");
        require(ownerOf(tokenId) == msg.sender || msg.sender == prop.escrowBuyer, "Not authorized");

        address buyer = prop.escrowBuyer;
        uint256 amount = prop.escrowAmount;

        prop.inEscrow = false;
        prop.escrowBuyer = address(0);
        prop.escrowAmount = 0;

        (bool sent, ) = payable(buyer).call{value: amount}("");
        require(sent, "Refund failed");
    }

    function createRental(
        uint256 tokenId,
        uint256 startDate,
        uint256 endDate,
        uint256 monthlyRent
    ) external {
        require(ownerOf(tokenId) == msg.sender, "Not owner");
        require(endDate > startDate, "Invalid dates");

        _rentals[tokenId] = RentalAgreement(startDate, endDate, monthlyRent, true);
        emit RentalCreated(tokenId, startDate, endDate, monthlyRent);
    }

    function transferOwnership(uint256 tokenId, address newOwner) external {
        require(ownerOf(tokenId) == msg.sender, "Not owner");
        require(newOwner != address(0), "Zero address");
        _transfer(msg.sender, newOwner, tokenId);
        _properties[tokenId].owner = newOwner;
        emit OwnershipTransferred(tokenId, msg.sender, newOwner);
    }

    function getProperty(uint256 tokenId)
        external
        view
        returns (address owner, string memory uri, bool inEscrow, address escrowBuyer, uint256 escrowAmount)
    {
        PropertyData memory prop = _properties[tokenId];
        return (ownerOf(tokenId), super.tokenURI(tokenId), prop.inEscrow, prop.escrowBuyer, prop.escrowAmount);
    }

    function tokenURI(uint256 tokenId) public view override(ERC721, ERC721URIStorage) returns (string memory) {
        return super.tokenURI(tokenId);
    }

    function supportsInterface(bytes4 interfaceId)
        public
        view
        override(ERC721, ERC721URIStorage)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }
}
