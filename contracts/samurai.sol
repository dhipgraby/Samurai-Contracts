// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

contract Samurai is ERC721, ERC721Enumerable, ERC721URIStorage, AccessControl {
    using Counters for Counters.Counter;

    string private _baseURIextended;
    bytes32 public constant MINTER_ROLE = keccak256("MINTER_ROLE");
    uint256 public _maxSupply = 666;
    uint256 initialPrice = 190000000000000000; //Price in wei of 0.19 eth

    Counters.Counter private _tokenIdCounter;

    constructor() ERC721("TheLastBlood", "TLB") {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(MINTER_ROLE, msg.sender);
    }

    modifier isValidToken(uint256 _tokenId) {
        require(_tokenId <= 665, "Invalid token Id");
        require(_tokenId >= 1, "Invalid token Id");
        if (_exists(_tokenId)) revert TokenExist();
        _;
    }

    function mint(uint256 tokenId) public payable isValidToken(tokenId) {
        _tokenIdCounter.increment();
        require(msg.value == initialPrice, "Incorrect amount");
        require(_tokenIdCounter.current() <= _maxSupply, "Max supply reached");
        _safeMint(msg.sender, tokenId);
        _setTokenURI(tokenId, _baseURI());
    }

    function safeMint(
        address to,
        uint256 tokenId
    ) public onlyRole(DEFAULT_ADMIN_ROLE) isValidToken(tokenId) {
        _tokenIdCounter.increment();
        require(_tokenIdCounter.current() <= _maxSupply, "Max supply reached");
        _safeMint(to, tokenId);
        _setTokenURI(tokenId, _baseURI());
    }

    // The following functions are overrides required by Solidity.

    function _beforeTokenTransfer(
        address from,
        address to,
        uint256 tokenId,
        uint256 batchSize
    ) internal override(ERC721, ERC721Enumerable) {
        super._beforeTokenTransfer(from, to, tokenId, batchSize);
    }

    function _burn(
        uint256 tokenId
    ) internal override(ERC721, ERC721URIStorage) {
        super._burn(tokenId);
    }

    function tokenURI(
        uint256 tokenId
    ) public view override(ERC721, ERC721URIStorage) returns (string memory) {
        return super.tokenURI(tokenId);
    }

    function supportsInterface(
        bytes4 interfaceId
    )
        public
        view
        override(ERC721, ERC721Enumerable, AccessControl)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }

    function setBaseURI(string memory baseURI_) external {
        require(
            hasRole(DEFAULT_ADMIN_ROLE, msg.sender),
            "Must have admin role to set base URI"
        );
        _baseURIextended = baseURI_;
    }

    function _baseURI() internal view virtual override returns (string memory) {
        return _baseURIextended;
    }

    error TokenExist();
}
