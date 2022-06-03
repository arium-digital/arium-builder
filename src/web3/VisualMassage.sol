//SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Strings.sol";

import "./NiftyForge/INiftyForge721.sol";
import "./NiftyForge/Modules/NFBaseModule.sol";
import "./NiftyForge/Modules/INFModuleTokenURI.sol";
import "./NiftyForge/Modules/INFModuleWithRoyalties.sol";

/// @title VisualMassageModule
/// @author Simon Fremaux (@dievardump)
contract VisualMassageModule is
    Ownable,
    NFBaseModule,
    INFModuleTokenURI,
    INFModuleWithRoyalties
{
    uint256 constant MAX_TOKEN_ID = 300;

    address public nftContract;

    uint256 public price = 0.001 ether;

    /// @dev Receive, for royalties
    receive() external payable {}

    /// @notice constructor
    /// @param contractURI_ The contract URI (containing its metadata) - can be empty ''
    /// @param owner_ Address to whom transfer ownership (can be address(0), then owner is deployer)
    constructor(string memory contractURI_, address owner_)
        NFBaseModule(contractURI_)
    {
        if (address(0) != owner_) {
            transferOwnership(owner_);
        }
    }

    function supportsInterface(bytes4 interfaceId)
        public
        view
        virtual
        override
        returns (bool)
    {
        return
            interfaceId == type(INFModuleTokenURI).interfaceId ||
            interfaceId == type(INFModuleWithRoyalties).interfaceId ||
            super.supportsInterface(interfaceId);
    }

    /// @inheritdoc	INFModuleWithRoyalties
    function royaltyInfo(uint256 tokenId)
        public
        view
        override
        returns (address, uint256)
    {
        return royaltyInfo(msg.sender, tokenId);
    }

    /// @inheritdoc	INFModuleWithRoyalties
    function royaltyInfo(address, uint256)
        public
        view
        override
        returns (address receiver, uint256 basisPoint)
    {
        receiver = address(this);
        basisPoint = 1000;
    }

    /// @inheritdoc	INFModuleTokenURI
    function tokenURI(uint256 tokenId)
        public
        view
        override
        returns (string memory)
    {
        return tokenURI(msg.sender, tokenId);
    }

    /// @inheritdoc	INFModuleTokenURI
    function tokenURI(address, uint256 tokenId)
        public
        view
        override
        returns (string memory)
    {
        return "ipfs://QmeUhr93CpoWyiN3ck4KpNSTq3kejrXwBNRASJbtZVdCtn";
    }

    /// @inheritdoc	INFModule
    function onAttach()
        external
        virtual
        override(INFModule, NFBaseModule)
        returns (bool)
    {
        if (nftContract == address(0)) {
            nftContract = msg.sender;
            return true;
        }

        // only allows attachment if nftContract if not set
        return false;
    }

    /// @notice collect tokenId
    /// @param tokenId the token to buy
    function collect(uint256 tokenId) external payable {
        require(tokenId > 0 && tokenId <= MAX_TOKEN_ID, "!WRONG_ID!");
        require(msg.value == price, "!WRONG_VALUE!");

        INiftyForge721(nftContract).mint(
            msg.sender,
            "",
            tokenId,
            address(0),
            0,
            address(0)
        );
    }

    /// @notice sets nft contract
    /// @param nftContract_ the contract containing nft
    function setNFTContract(address nftContract_) external onlyOwner {
        nftContract = nftContract_;
    }

    /// @notice sets price
    /// @param price_ the new price
    function setPrice(uint256 price_) external onlyOwner {
        price = price_;
    }

    /// @notice sets contract uri
    /// @param newURI the new uri
    function setContractURI(string memory newURI) external onlyOwner {
        _setContractURI(newURI);
    }

    /// @dev Owner withdraw balance function
    function withdraw() external onlyOwner {
        address owner_ = owner();
        (bool success, ) = owner_.call{value: address(this).balance}("");
        require(success, "!ERROR_WHEN_WITHDRAWING!");
    }
}