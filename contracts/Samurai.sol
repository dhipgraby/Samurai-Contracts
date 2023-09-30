// SPDX-License-Identifier: MIT
pragma solidity 0.8.19;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/token/common/ERC2981.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

/// @title Samurai NFT Contract
/// @notice This contract handles the minting and management of Samurai NFTs.
contract Samurai is
    ERC721,
    ERC721Enumerable,
    ERC721URIStorage,
    AccessControl,
    ERC2981
{
    /// @notice Role identifier for admin-level privileges
    bytes32 public constant ADMIN_ROLE = keccak256("ADMIN_ROLE");
    /// @notice Role identifier for minter-level privileges
    bytes32 public constant MINTER_ROLE = keccak256("MINTER_ROLE");
    /// @notice Initial price for minting an NFT in ETH
    uint256 public initialPrice = 0.19 ether;
    /// @notice Initial price for minting an NFT in ERC20 tokens
    uint256 public initialTokenPrice = 1000 ether;
    /// @notice Address of the ERC20 token used for payment
    address public erc20TokenAddress;
    /// @notice Base URI for metadata
    string private _baseURIextended;

    /// @notice Custom error to indicate that a token already exists
    error TokenExist();

    /// @notice Event emitted when a new token is minted
    /// @param to The address to mint the token to
    /// @param tokenId The ID of the minted token
    event Minted(address indexed to, uint256 indexed tokenId);

    /// @notice Emited when the Contract balance is withdrawn.
    /// @param balance Withdrawn balance.
    event Withdrawn(uint256 balance);

    /// @notice Event emitted when a new royalty data is set
    /// @param royaltyReceiver Receiver of royalty amount
    /// @param feeNumerator The royalty fee in bips
    event RoyaltySet(address indexed royaltyReceiver, uint96 feeNumerator);

    /// @notice Emited when tokens is withdrawn.
    /// @param token Withdrawn token
    /// @param amount Withdrawn amount
    event WithdrawnTokens(IERC20 indexed token, uint256 amount);

    /// @notice Event emitted when Ether is received
    /// @param sender Address of the sender
    /// @param amount Amount of Ether received
    event Received(address indexed sender, uint256 amount);

    /// @dev Checks if the token ID is valid and doesn't exist
    /// @param _tokenId The ID of the token to validate
    modifier isValidToken(uint256 _tokenId) {
        require(_tokenId >= 1 && _tokenId <= 666, "Invalid token Id");
        if (_exists(_tokenId)) revert TokenExist();
        _;
    }

    /// @notice Initializes the contract, setting the roles for the deployer
    /// @dev Default feeNumerator is 10000, which is 10%
    constructor(
        address payable _royaltyReceiver
    ) ERC721("LastBloodLines", "LBL") {
        _grantRole(ADMIN_ROLE, msg.sender);
        _grantRole(MINTER_ROLE, msg.sender);

        _setDefaultRoyalty(_royaltyReceiver, 10000);
    }

    /// @notice Fallback function to accept Ether
    receive() external payable {
        emit Received(msg.sender, msg.value);
    }

    /// @notice Allows an admin to mint a new token
    /// @param to The address to mint the token to
    /// @param tokenId The ID of the token to mint
    function adminMint(
        address to,
        uint256 tokenId
    ) public onlyRole(MINTER_ROLE) isValidToken(tokenId) {
        _mintToken(to, tokenId);
    }

    /// @notice Allows a user to mint a new token with ETH
    /// @param tokenId The ID of the token to mint
    function userMint(uint256 tokenId) public payable isValidToken(tokenId) {
        require(
            msg.value == (tokenId == 666 ? 666 ether : initialPrice),
            "Incorrect amount"
        );
        _mintToken(msg.sender, tokenId);
    }

    /// @notice Allows a user to mint a new token with ERC20 tokens
    /// @param tokenId The ID of the token to mint
    /// @dev requries ERC20 token approval to be given to this contract
    function userMintWithToken(uint256 tokenId) public isValidToken(tokenId) {
        IERC20 token = IERC20(erc20TokenAddress);
        require(
            token.transferFrom(msg.sender, address(this), initialTokenPrice),
            "Token transfer failed"
        );
        _mintToken(msg.sender, tokenId);
    }

    /// @notice Sets the new ETH price for minting
    /// @param newPrice The new price in ETH
    function setPrice(uint256 newPrice) public onlyRole(ADMIN_ROLE) {
        initialPrice = newPrice;
    }

    /// @notice Sets the new token price for minting
    /// @param newTokenPrice The new price in tokens
    function setTokenPrice(uint256 newTokenPrice) public onlyRole(ADMIN_ROLE) {
        initialTokenPrice = newTokenPrice;
    }

    /// @notice Sets the ERC20 token address for payments
    /// @param newAddress The new ERC20 token address
    function setERC20TokenAddress(
        address newAddress
    ) public onlyRole(ADMIN_ROLE) {
        erc20TokenAddress = newAddress;
    }

    /// @dev Internal function to handle the minting logic
    /// @param to The address to mint the token to
    /// @param tokenId The ID of the token to mint
    function _mintToken(address to, uint256 tokenId) private {
        _safeMint(to, tokenId);
        _setTokenURI(tokenId, _baseURI());
        emit Minted(to, tokenId);
    }

    function _beforeTokenTransfer(
        address from,
        address to,
        uint256 tokenId,
        uint256 batchSize
    ) internal override(ERC721, ERC721Enumerable) {
        super._beforeTokenTransfer(from, to, tokenId, batchSize);
    }

    /// @dev Internal function to burn a token
    /// @param tokenId The ID of the token to burn
    function _burn(
        uint256 tokenId
    ) internal override(ERC721, ERC721URIStorage) {
        super._burn(tokenId);
    }

    /// @dev Function to return the token URI
    /// @param tokenId The ID of the token to return the URI for
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
        override(
            ERC721,
            ERC721Enumerable,
            AccessControl,
            ERC721URIStorage,
            ERC2981
        )
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }

    /// @notice Sets the base URI for metadata
    /// @param baseURI_ The new base URI
    function setBaseURI(string memory baseURI_) external onlyRole(ADMIN_ROLE) {
        _baseURIextended = baseURI_;
    }

    /// @dev Internal function to return the base URI
    /// @return The current base URI
    function _baseURI() internal view virtual override returns (string memory) {
        return _baseURIextended;
    }

    /// @notice Sets the global royalty information for all tokens.
    /// @param royaltyReceiver Receiver of royalty amount
    /// @param feeNumerator The royalty fee in bips
    function resetRoyalties(
        address payable royaltyReceiver,
        uint96 feeNumerator
    ) external onlyRole(ADMIN_ROLE) {
        _setDefaultRoyalty(royaltyReceiver, feeNumerator);
        emit RoyaltySet(royaltyReceiver, feeNumerator);
    }

    /// @notice Allows the admin to withdraw Ether from the contract
    /// @param to The address to send Ether to
    function withdrawEther(address payable to) external onlyRole(ADMIN_ROLE) {
        uint256 balance = address(this).balance;
        (bool success, ) = to.call{value: balance}("");
        require(success, "Transfer failed.");
        emit Withdrawn(balance);
    }

    /// @notice Allows the admin to withdraw ERC20 tokens from the contract
    /// @param contractAddress Token address to withdraw.
    /// @param to The address to send tokens to.
    function withdrawTokens(
        address contractAddress,
        address to
    ) external onlyRole(ADMIN_ROLE) {
        IERC20 token = IERC20(contractAddress);
        uint256 amount = token.balanceOf(address(this));
        require(token.transfer(to, amount), "Token transfer failed");
        emit WithdrawnTokens(token, amount);
    }
}
