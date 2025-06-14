// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

// import "./CustomERC721.sol";

// contract MyNFT is CustomERC721 {

//     constructor(string memory _name, string memory _symbol) CustomERC721(_name, _symbol) {}

//     function mintNFT(uint256 tokenId) public {
//         require(!_exists(tokenId), "MyNFT: token already minted");
//         _mint(msg.sender, tokenId);
//     }    
    
//     function burn(uint256 tokenId) public override {
//         require(ownerOf(tokenId) == msg.sender, "Only token owner can burn");
//         _burn(tokenId);
//     }
    
//     function isApprovedOrOwnerTest(address spender, uint256 tokenId) public view returns (bool) {
//         return _isApprovedOrOwner(spender, tokenId);
//     }

//     function myTransferFrom(address from, address to, uint256 tokenId) public {
//         transferFrom(from, to, tokenId);
//     }
    
//     function mySafeTransferFrom(address from, address to, uint256 tokenId, bytes memory data) public {
//         safeTransferFrom(from, to, tokenId, data);
//     }
    
//     function testCheckOnERC721Received(address from, address to, uint256 tokenId, bytes memory data) public returns (bool) {
//         return _checkOnERC721Received(from, to, tokenId, data);
//     }
// }
