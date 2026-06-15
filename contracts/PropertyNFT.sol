// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Burnable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";

/**
 * @title PropertyNFT
 * @notice ERC-721 token representing a property deed as an NFT.
 *         Each token maps 1:1 to a property chain ID in the PropertyRegistry.
 *         The token URI points to an IPFS/Arweave JSON metadata file with:
 *           - Property images, title, location
 *           - Legal description, verification status
 */
contract PropertyNFT is ERC721, ERC721URIStorage, ERC721Burnable, Ownable, Pausable {
    /* ─────────────────────── State ─────────────────────── */

    uint256 private _nextTokenId;

    // chainId → tokenId mapping
    mapping(string => uint256) public chainIdToToken;
    // tokenId → chainId mapping
    mapping(uint256 => string) public tokenToChainId;

    address public minterRole;

    /* ─────────────────────── Events ────────────────────── */

    event DeedMinted(uint256 indexed tokenId, string chainId, address indexed to, string uri);
    event MinterUpdated(address indexed newMinter);

    /* ─────────────────────── Errors ────────────────────── */

    error NotMinter();
    error AlreadyMinted(string chainId);
    error ZeroAddress();

    /* ──────────────────── Constructor ───────────────────── */

    constructor(
        address initialOwner,
        address _minter
    ) ERC721("ChainEstate Property Deed", "CEPD") Ownable(initialOwner) {
        if (_minter == address(0)) revert ZeroAddress();
        minterRole = _minter;
    }

    /* ─────────────────── Modifiers ─────────────────────── */

    modifier onlyMinter() {
        if (msg.sender != minterRole && msg.sender != owner()) revert NotMinter();
        _;
    }

    /* ──────────────────── Core Functions ────────────────── */

    /**
     * @notice Mint a new deed NFT for a property.
     * @param to        The initial owner (property owner wallet).
     * @param chainId   The property chain ID from the registry (e.g. "PROP-0001").
     * @param uri       IPFS URI for property metadata JSON.
     */
    function mintDeed(
        address to,
        string calldata chainId,
        string calldata uri
    ) external onlyMinter whenNotPaused returns (uint256 tokenId) {
        if (to == address(0)) revert ZeroAddress();
        if (chainIdToToken[chainId] != 0) revert AlreadyMinted(chainId);

        tokenId = ++_nextTokenId;

        chainIdToToken[chainId] = tokenId;
        tokenToChainId[tokenId] = chainId;

        _safeMint(to, tokenId);
        _setTokenURI(tokenId, uri);

        emit DeedMinted(tokenId, chainId, to, uri);
    }

    /**
     * @notice Update the metadata URI for an existing deed (e.g. after re-verification).
     */
    function updateTokenURI(uint256 tokenId, string calldata uri)
        external
        onlyMinter
    {
        _setTokenURI(tokenId, uri);
    }

    /* ─────────────────── Admin Controls ─────────────────── */

    function setMinter(address newMinter) external onlyOwner {
        if (newMinter == address(0)) revert ZeroAddress();
        minterRole = newMinter;
        emit MinterUpdated(newMinter);
    }

    function pause()   external onlyOwner { _pause(); }
    function unpause() external onlyOwner { _unpause(); }

    /* ──────────────── Required Overrides ────────────────── */

    function tokenURI(uint256 tokenId)
        public
        view
        override(ERC721, ERC721URIStorage)
        returns (string memory)
    {
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
