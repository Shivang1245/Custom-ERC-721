// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "./CustomERC721.sol";

contract TestCustomERC721 is CustomERC721 {
    uint256 public nextTokenId = 1;

    constructor(string memory name_, string memory symbol_)
        CustomERC721(name_, symbol_)
    {}

    function mint() public returns (uint256) {
        uint256 tokenId = nextTokenId;
        _mint(msg.sender, tokenId);
        nextTokenId++;
        return tokenId;
    }

    function exposedMint(address to, uint256 tokenId) external {
        _mint(to, tokenId);
    }

    function exposedTransfer(address from, address to, uint256 tokenId) external {
        _transfer(from, to, tokenId);
    }

    function exposedSafeTransfer(
        address from,
        address to,
        uint256 tokenId,
        bytes calldata _data
    ) external {
        _safeTransfer(from, to, tokenId, _data);
    }

    function exposedBurn(uint256 tokenId) external {
        _burn(tokenId);
    }

    function exposedApprove(uint256 tokenId, address to) external {
        _approve(to, tokenId);
    }

    function exposedIsApprovedOrOwner(address spender, uint256 tokenId) external view returns (bool) {
        return _isApprovedOrOwner(spender, tokenId);
    }

    function exposedCheckOnERC721Received(
        address from,
        address to,
        uint256 tokenId,
        bytes calldata data
    ) external returns (bool) {
        return _checkOnERC721Received(from, to, tokenId, data);
    }

    function exposedExists(uint256 tokenId) external view returns (bool) {
        return _exists(tokenId);
    }

    function exposedSetApprovalForAll(address operator, bool approved) external {
        setApprovalForAll(operator, approved);
    }

    function exposedUint2str(uint256 _i) external pure returns (string memory) {
        return _uint2str(_i);
    }



     function exposedAddTokenToOwnerEnumeration(address to, uint256 tokenId) external {
        require(to != address(0), "CustomERC721: add to zero address");
        
        uint256 length = _ownedTokens[to].length;
        for (uint256 i = 0; i < length; i++) {
            require(_ownedTokens[to][i] != tokenId, "CustomERC721: token already added");
        }
        
        _addTokenToOwnerEnumeration(to, tokenId);
    }

    function exposedTokenOfOwnerByIndex(address ownerAddr, uint256 index) external view returns (uint256) {
        require(index < _ownedTokens[ownerAddr].length, "Index out of bounds");
        return _ownedTokens[ownerAddr][index];
    }

    function exposedOwnerTokenIndex(uint256 tokenId) external view returns (uint256) {
        return _ownedTokensIndex[tokenId];
    }

    function readTokenOwner(address ownerAddr, uint256 index) external view returns (uint256) {
        require(index < _ownedTokens[ownerAddr].length, "Index out of bounds");
        return _ownedTokens[ownerAddr][index];
    }

    function tokenCount(address ownerAddr) external view returns (uint256) {
        return _ownedTokens[ownerAddr].length;
    }

    function exposedRemoveTokenFromOwnerEnumeration(address from, uint256 tokenId) external {
        _removeTokenFromOwnerEnumeration(from, tokenId);
    }

    function exposedAddTokenToAllTokensEnumeration(uint256 tokenId) external {
        _addTokenToAllTokensEnumeration(tokenId);
    }

    function allTokensCount() external view returns (uint256) {
        return _allTokens.length;
    }

    function readAllToken(uint256 index) external view returns (uint256) {
        require(index < _allTokens.length, "Index out of bounds");
        return _allTokens[index];
    }

    function readTokenIndex(uint256 tokenId) external view returns (uint256) {
        return _allTokensIndex[tokenId];
    }

    function exposedRemoveTokenFromAllTokensEnumeration(uint256 tokenId) external {
        _removeTokenFromAllTokensEnumeration(tokenId);
    }

}