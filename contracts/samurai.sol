// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/security/Pausable.sol";

contract Samurai is ERC721, ERC721Enumerable, ERC721URIStorage, AccessControl, Pausable {

    bytes32 public constant MINTER_ROLE = keccak256("MINTER_ROLE");
    uint256 public initialPrice = 190000000000000000; // 0.19 ETH
    uint256 public initialTokenPrice = 1000; // Example token price
    address public ERC20TokenAddress; // Address of the ERC20 token to accept as payment
    string private _baseURIextended;    
    
    constructor() ERC721("LastBloodLines", "LBL") {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(MINTER_ROLE, msg.sender);
    }

    modifier isValidToken(uint256 _tokenId) {
        require(_tokenId >= 1 && _tokenId <= 666, "Invalid token Id");
        if (_exists(_tokenId)) revert TokenExist();
        _;
    }

    function adminMint(address to, uint256 tokenId) public onlyRole(MINTER_ROLE) isValidToken(tokenId) whenNotPaused {
        _mintToken(to, tokenId);
    }

    function userMint(uint256 tokenId) public payable isValidToken(tokenId) whenNotPaused {
        require(msg.value == (tokenId == 666 ? 666 ether : initialPrice), "Incorrect amount");
        _mintToken(msg.sender, tokenId);
    }

    function userMintWithToken(uint256 tokenId) public isValidToken(tokenId) whenNotPaused {
        IERC20 token = IERC20(ERC20TokenAddress);
        require(token.transferFrom(msg.sender, address(this), initialTokenPrice), "Token transfer failed");
        _mintToken(msg.sender, tokenId);
    }

    function setPrice(uint256 newPrice) public onlyRole(DEFAULT_ADMIN_ROLE) {
        initialPrice = newPrice;
    }

    function setTokenPrice(uint256 newTokenPrice) public onlyRole(DEFAULT_ADMIN_ROLE) {
        initialTokenPrice = newTokenPrice;
    }

    function setERC20TokenAddress(address newAddress) public onlyRole(DEFAULT_ADMIN_ROLE) {
        ERC20TokenAddress = newAddress;
    }

    function pause() public onlyRole(DEFAULT_ADMIN_ROLE) {
        _pause();
    }

    function unpause() public onlyRole(DEFAULT_ADMIN_ROLE) {
        _unpause();
    }

    function _mintToken(address to, uint256 tokenId) private {        
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
        override(ERC721, ERC721Enumerable, AccessControl,ERC721URIStorage)
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
