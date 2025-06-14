// pragma solidity ^0.8.0;

// interface IERC721Receiver {
//     function onERC721Received(
//         address operator,
//         address from,
//         uint256 tokenId,
//         bytes calldata data
//     ) external returns (bytes4);
// }

// interface IERC721Enumerable {
//     function totalSupply() external view returns (uint256);
//     function tokenByIndex(uint256 index) external view returns (uint256);
//     function tokenOfOwnerByIndex(address owner, uint256 index) external view returns (uint256);
// }

// contract CustomERC721 is IERC721Enumerable {
//     string private _name;
//     string private _symbol;
//     string private _baseTokenURI;

//     mapping(uint256 => address) private _owners;
//     mapping(address => uint256) private _balances;
//     mapping(uint256 => address) private _tokenApprovals;
//     mapping(address => mapping(address => bool)) private _operatorApprovals;

//     uint256[] internal _allTokens;
//     mapping(uint256 => uint256) internal _allTokensIndex;
//     mapping(address => uint256[]) internal _ownedTokens;
//     mapping(uint256 => uint256) internal _ownedTokensIndex;
//     mapping(uint256 => bool) internal _tokenAdded;

//     event Transfer(address indexed from, address indexed to, uint256 indexed tokenId);
//     event Approval(address indexed owner, address indexed approved, uint256 indexed tokenId);
//     event ApprovalForAll(address indexed owner, address indexed operator, bool approved);

//     event Mint(address indexed to, uint256 indexed tokenId);
//     event Burn(address indexed from, uint256 indexed tokenId);

//     constructor(string memory name_, string memory symbol_) {
//         _name = name_;
//         _symbol = symbol_;
//         _baseTokenURI = ""; 
//     }

//     function name() public view returns (string memory) {
//         return _name;
//     }

//     function symbol() public view returns (string memory) {
//         return _symbol;
//     }

//     function tokenURI(uint256 tokenId) public view returns (string memory) {
//         require(_exists(tokenId), "ERC721Metadata: URI query for nonexistent token");
//         return string(abi.encodePacked(_baseTokenURI, _uint2str(tokenId)));
//     }

//     function balanceOf(address owner) public view returns (uint256) {
//         require(owner != address(0), "ERC721: balance query for zero address");
//         return _balances[owner];
//     }

//     function ownerOf(uint256 tokenId) public view returns (address) {
//         address owner = _owners[tokenId];
//         require(owner != address(0), "ERC721: owner query for nonexistent token");
//         return owner;
//     }

//     function totalSupply() public view override returns (uint256) {
//         return _allTokens.length;
//     }

//     function tokenByIndex(uint256 index) public view override returns (uint256) {
//         require(index < totalSupply(), "ERC721Enumerable: global index out of bounds");
//         return _allTokens[index];
//     }

//     function tokenOfOwnerByIndex(address owner, uint256 index) public view override returns (uint256) {
//         require(index < balanceOf(owner), "ERC721Enumerable: owner index out of bounds");
//         return _ownedTokens[owner][index];
//     }
    
//     function approve(address to, uint256 tokenId) public {
//         address owner = ownerOf(tokenId);
//         require(to != owner, "ERC721: approval to current owner");
//         require(msg.sender == owner || isApprovedForAll(owner, msg.sender),
//             "ERC721: approve caller is not owner nor approved for all"
//         );
//         _approve(to, tokenId);
//     }

//     function getApproved(uint256 tokenId) public view returns (address) {
//         require(_exists(tokenId), "ERC721: approved query for nonexistent token");
//         return _tokenApprovals[tokenId];
//     }

//     function setApprovalForAll(address operator, bool approved) public {
//         require(operator != msg.sender, "ERC721: approve to caller");
//         _operatorApprovals[msg.sender][operator] = approved;
//         emit ApprovalForAll(msg.sender, operator, approved);
//     }

//     function isApprovedForAll(address owner, address operator) public view returns (bool) {
//         return _operatorApprovals[owner][operator];
//     }

//     function transferFrom(address from, address to, uint256 tokenId) public {
//         require(_isApprovedOrOwner(msg.sender, tokenId), "ERC721: transfer caller not owner nor approved");
//         _transfer(from, to, tokenId);
//     }

//     function safeTransferFrom(address from, address to, uint256 tokenId, bytes memory data) public {
//         require(_isApprovedOrOwner(msg.sender, tokenId), "ERC721: transfer caller not owner nor approved");
//         _safeTransfer(from, to, tokenId, data);
//     }

//     function safeTransferFrom(address from, address to, uint256 tokenId) public {
//         safeTransferFrom(from, to, tokenId, "");
//     }

//     function _transfer(address from, address to, uint256 tokenId) internal {
//         require(ownerOf(tokenId) == from, "ERC721: transfer of token that is not own");
//         require(to != address(0), "ERC721: transfer to zero address");

//         _approve(address(0), tokenId); 

//         _removeTokenFromOwnerEnumeration(from, tokenId);
//         _balances[from] -= 1;

//         _owners[tokenId] = to;
//         _balances[to] += 1;
//         _addTokenToOwnerEnumeration(to, tokenId);

//         emit Transfer(from, to, tokenId);
//     }

//     function _safeTransfer(address from, address to, uint256 tokenId, bytes memory data) internal {
//         _transfer(from, to, tokenId);
//         require(_checkOnERC721Received(from, to, tokenId, data), "ERC721: transfer to non ERC721Receiver implementer");
//     }

//     function _mint(address to, uint256 tokenId) internal {
//         require(to != address(0), "ERC721: mint to zero address");
//         require(!_exists(tokenId), "ERC721: token already minted");

//         _balances[to] += 1;
//         _owners[tokenId] = to;
//         _addTokenToOwnerEnumeration(to, tokenId);
//         _addTokenToAllTokensEnumeration(tokenId);

//         emit Transfer(address(0), to, tokenId);
//         emit Mint(to, tokenId);
//     }


//     function _burn(uint256 tokenId) internal {
//         address owner = ownerOf(tokenId);

//         _approve(address(0), tokenId);

//         _removeTokenFromOwnerEnumeration(owner, tokenId);
//         _removeTokenFromAllTokensEnumeration(tokenId);

//         delete _owners[tokenId];
//         _balances[owner] -= 1;

//         emit Transfer(owner, address(0), tokenId);
//         emit Burn(owner, tokenId);
//     }

//     function _approve(address to, uint256 tokenId) internal {
//         _tokenApprovals[tokenId] = to;
//         emit Approval(ownerOf(tokenId), to, tokenId);
//     }

//     function _isApprovedOrOwner(address spender, uint256 tokenId) internal view returns (bool) {
//         require(_exists(tokenId), "ERC721: operator query for nonexistent token");
//         address owner = ownerOf(tokenId);
//         return (spender == owner || getApproved(tokenId) == spender || isApprovedForAll(owner, spender));
//     }

//     function _checkOnERC721Received(address from, address to, uint256 tokenId, bytes memory data)
//         internal returns (bool)
//     {
//         if (to.code.length > 0) {
//             try IERC721Receiver(to).onERC721Received(msg.sender, from, tokenId, data) returns (bytes4 retval) {
//                 return retval == IERC721Receiver.onERC721Received.selector;
//             } catch {
//                 revert("ERC721: transfer to non ERC721Receiver implementer");
//             }
//         }
//         return true;
//     }

//     function _exists(uint256 tokenId) internal view returns (bool) {
//         return _owners[tokenId] != address(0);
//     }

//     function _addTokenToOwnerEnumeration(address to, uint256 tokenId) internal {
//     _ownedTokens[to].push(tokenId);
//     _ownedTokensIndex[tokenId] = _ownedTokens[to].length - 1;
//     }

//     function _addTokenToAllTokensEnumeration(uint256 tokenId) internal {
//         require(!_tokenAdded[tokenId], "ERC721: token already added");

//         _allTokensIndex[tokenId] = _allTokens.length;
//         _allTokens.push(tokenId);

//         _tokenAdded[tokenId] = true;
//     }

//     function _removeTokenFromOwnerEnumeration(address from, uint256 tokenId) internal {
//         require(from != address(0), "ERC721: remove token from zero address");
    
//         uint256 ownerTokenCount = _ownedTokens[from].length;
//         require(ownerTokenCount > 0, "ERC721: token not found in enumeration");
    
//         uint256 tokenIndex = _ownedTokensIndex[tokenId];
//         require(_ownedTokens[from][tokenIndex] == tokenId, "ERC721: token not found in enumeration");
    
//         uint256 lastTokenIndex = ownerTokenCount - 1;
    
//         if (tokenIndex != lastTokenIndex) {
//             uint256 lastTokenId = _ownedTokens[from][lastTokenIndex];
//             _ownedTokens[from][tokenIndex] = lastTokenId;
//             _ownedTokensIndex[lastTokenId] = tokenIndex;
//         }
//         _ownedTokens[from].pop();
    
//         delete _ownedTokensIndex[tokenId];
//     }

//     function _removeTokenFromAllTokensEnumeration(uint256 tokenId) internal {
//         uint256 tokenCount = _allTokens.length;
//         require(tokenCount > 0, "ERC721: token not found in global enumeration");

//         uint256 tokenIndex = _allTokensIndex[tokenId];

//         require(tokenIndex < tokenCount, "ERC721: token not found in global enumeration");
//         require(_allTokens[tokenIndex] == tokenId, "ERC721: token not found in global enumeration");

//         uint256 lastTokenIndex = tokenCount - 1;

//         if (tokenIndex != lastTokenIndex) {
//             uint256 lastTokenId = _allTokens[lastTokenIndex];
//             _allTokens[tokenIndex] = lastTokenId;
//             _allTokensIndex[lastTokenId] = tokenIndex;
//         }

//         _allTokens.pop();
//         delete _allTokensIndex[tokenId];
//     }

//     function _uint2str(uint256 _i) internal pure returns (string memory) {
//         if (_i == 0) {
//             return "0";
//         }
//         uint256 temp = _i;
//         uint256 len;
//         while (temp != 0) {
//             len++;
//             temp /= 10;
//         }
//         bytes memory buffer = new bytes(len);
//         while (_i != 0) {
//             len -= 1;
//             buffer[len] = bytes1(uint8(48 + _i % 10));
//             _i /= 10;
//         }
//         return string(buffer);
//     }
// }



// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

interface IERC721Receiver {
    function onERC721Received(
        address operator,
        address from,
        uint256 tokenId,
        bytes calldata data
    ) external returns (bytes4);
}

interface IERC721Enumerable {
    function totalSupply() external view returns (uint256);
    function tokenByIndex(uint256 index) external view returns (uint256);
    function tokenOfOwnerByIndex(address owner, uint256 index) external view returns (uint256);
}

contract CustomERC721 is IERC721Enumerable {
    string private _name;
    string private _symbol;
    string private _baseTokenURI;
    
    mapping(uint256 => address) private _owners;
    mapping(address => uint256) private _balances;
    mapping(uint256 => address) private _tokenApprovals;
    mapping(address => mapping(address => bool)) private _operatorApprovals;
    
    uint256[] internal _allTokens;
    mapping(uint256 => uint256) internal _allTokensIndex;
    mapping(address => uint256[]) internal _ownedTokens;
    mapping(uint256 => uint256) internal _ownedTokensIndex;
    mapping(uint256 => bool) internal _tokenAdded;
    
    address private _owner;
    event OwnershipTransferred(address indexed previousOwner, address indexed newOwner);
    
    bool private _notEntered;
    
    event Transfer(address indexed from, address indexed to, uint256 indexed tokenId);
    event Approval(address indexed owner, address indexed approved, uint256 indexed tokenId);
    event ApprovalForAll(address indexed owner, address indexed operator, bool approved);
    
    event Mint(address indexed to, uint256 indexed tokenId);
    event Burn(address indexed from, uint256 indexed tokenId);

    modifier onlyOwner() {
        require(msg.sender == _owner, "Ownable: caller is not the owner");
        _;
    }
    
    modifier nonReentrant() {
        require(_status != _ENTERED, "ReentrancyGuard: reentrant call");
        _status = _ENTERED;
        _;
        _status = _NOT_ENTERED;
    }

    modifier tokenExistsModifier(uint256 tokenId) {
        require(_exists(tokenId), "ERC721: query for nonexistent token");
        _;
    }

    uint256 private constant _NOT_ENTERED = 1;
    uint256 private constant _ENTERED = 2;
    uint256 private _status;

    constructor(string memory name_, string memory symbol_) {
        _name = name_;
        _symbol = symbol_;
        _baseTokenURI = "";
        _owner = msg.sender;
        _status = _NOT_ENTERED;
    }

    function owner() public view returns (address) {
        return _owner;
    }
    
    function transferOwnership(address newOwner) public onlyOwner {
        require(newOwner != address(0), "Ownable: new owner is the zero address");
        emit OwnershipTransferred(_owner, newOwner);
        _owner = newOwner;
    }
    
    function name() public view returns (string memory) {
        return _name;
    }
    
    function symbol() public view returns (string memory) {
        return _symbol;
    }
    
    function tokenURI(uint256 tokenId) public view tokenExistsModifier(tokenId) returns (string memory) {
        return string(abi.encodePacked(_baseTokenURI, _uint2str(tokenId)));
    }
    
    function totalSupply() public view override returns (uint256) {
        return _allTokens.length;
    }
    
    function tokenByIndex(uint256 index) public view override returns (uint256) {
        require(index < totalSupply(), "ERC721Enumerable: global index out of bounds");
        return _allTokens[index];
    }
    
    function tokenOfOwnerByIndex(address ownerAddr, uint256 index) public view override returns (uint256) {
        require(index < balanceOf(ownerAddr), "ERC721Enumerable: owner index out of bounds");
        return _ownedTokens[ownerAddr][index];
    }
    
    function balanceOf(address ownerAddr) public view returns (uint256) {
        require(ownerAddr != address(0), "ERC721: balance query for zero address");
        return _balances[ownerAddr];
    }
    
    function ownerOf(uint256 tokenId) public view tokenExistsModifier(tokenId) returns (address) {
        return _owners[tokenId];
    }
    
    function approve(address to, uint256 tokenId) public tokenExistsModifier(tokenId) {
        address tokenOwner = ownerOf(tokenId);
        require(to != tokenOwner, "ERC721: approval to current owner");
        require(
            msg.sender == tokenOwner || isApprovedForAll(tokenOwner, msg.sender),
            "ERC721: approve caller is not owner nor approved for all"
        );
        _approve(to, tokenId);
    }
    
    function getApproved(uint256 tokenId) public view tokenExistsModifier(tokenId) returns (address) {
        return _tokenApprovals[tokenId];
    }
    
    function setApprovalForAll(address operator, bool approved) public {
        require(operator != msg.sender, "ERC721: approve to caller");
        _operatorApprovals[msg.sender][operator] = approved;
        emit ApprovalForAll(msg.sender, operator, approved);
    }
    
    function isApprovedForAll(address ownerAddr, address operator) public view returns (bool) {
        return _operatorApprovals[ownerAddr][operator];
    }
    
    function transferFrom(address from, address to, uint256 tokenId) public nonReentrant {
        require(_isApprovedOrOwner(msg.sender, tokenId), "ERC721: transfer caller not owner nor approved");
        _transfer(from, to, tokenId);
    }
    
    function safeTransferFrom(address from, address to, uint256 tokenId, bytes memory data) public nonReentrant {
        require(_isApprovedOrOwner(msg.sender, tokenId), "ERC721: transfer caller not owner nor approved");
        _safeTransfer(from, to, tokenId, data);
    }
    
    function safeTransferFrom(address from, address to, uint256 tokenId) public nonReentrant {
        safeTransferFrom(from, to, tokenId, "");
    }
    
    function mint(address to, uint256 tokenId) public onlyOwner {
        _mint(to, tokenId);
    }
    
    function supportsInterface(bytes4 interfaceId) public pure returns (bool) {
        return 
            interfaceId == 0x80ac58cd || 
            interfaceId == 0x5b5e139f ||
            interfaceId == 0x780e9d63;   
    }

    function burn(uint256 tokenId) public {
        address tokenOwner = ownerOf(tokenId);
        require(
            msg.sender == tokenOwner ||
            isApprovedForAll(tokenOwner, msg.sender) ||
            getApproved(tokenId) == msg.sender,
            "ERC721: caller is not owner nor approved"
        );
        _burn(tokenId);
    }
    
    function _transfer(address from, address to, uint256 tokenId) internal {
        require(ownerOf(tokenId) == from, "ERC721: transfer of token that is not own");
        require(to != address(0), "ERC721: transfer to zero address");

        _approve(address(0), tokenId); 

        _removeTokenFromOwnerEnumeration(from, tokenId);
        _balances[from] -= 1;

        _owners[tokenId] = to;
        _balances[to] += 1;
        _addTokenToOwnerEnumeration(to, tokenId);

        emit Transfer(from, to, tokenId);
    }
    
    function _safeTransfer(address from, address to, uint256 tokenId, bytes memory data) internal {
        require(
            _checkOnERC721Received(from, to, tokenId, data),
            "ERC721: transfer to non ERC721Receiver implementer"
        );
        _transfer(from, to, tokenId);
    }
    
    function _mint(address to, uint256 tokenId) internal {
        require(to != address(0), "ERC721: mint to zero address");
        require(!_exists(tokenId), "ERC721: token already minted");

        _balances[to] += 1;
        _owners[tokenId] = to;

        _addTokenToOwnerEnumeration(to, tokenId);
        _addTokenToAllTokensEnumeration(tokenId);

        emit Transfer(address(0), to, tokenId);
        emit Mint(to, tokenId);
    }
    
    function _burn(uint256 tokenId) internal {
        address tokenOwner = ownerOf(tokenId);
        _approve(address(0), tokenId);

        _removeTokenFromOwnerEnumeration(tokenOwner, tokenId);
        _removeTokenFromAllTokensEnumeration(tokenId);

        delete _owners[tokenId];
        _balances[tokenOwner] -= 1;

        emit Transfer(tokenOwner, address(0), tokenId);
        emit Burn(tokenOwner, tokenId);
    }
    
    function _approve(address to, uint256 tokenId) internal {
        _tokenApprovals[tokenId] = to;
        emit Approval(ownerOf(tokenId), to, tokenId);
    }
    
    function _isApprovedOrOwner(address spender, uint256 tokenId) internal view tokenExistsModifier(tokenId) returns (bool) {
        address tokenOwner = ownerOf(tokenId);
        return (
            spender == tokenOwner ||
            getApproved(tokenId) == spender ||
            isApprovedForAll(tokenOwner, spender)
        );
    }
    
    function _checkOnERC721Received(
        address from,
        address to,
        uint256 tokenId,
        bytes memory data
    ) internal returns (bool) {
        if (to.code.length > 0) {
            try IERC721Receiver(to).onERC721Received(msg.sender, from, tokenId, data) returns (bytes4 retval) {
                return retval == IERC721Receiver.onERC721Received.selector;
            } catch {
                revert("ERC721: transfer to non ERC721Receiver implementer");
            }
        }
        return true;
    }
    
    function _exists(uint256 tokenId) internal view returns (bool) {
        return _owners[tokenId] != address(0);
    }
    
    function _addTokenToOwnerEnumeration(address to, uint256 tokenId) internal {
        _ownedTokens[to].push(tokenId);
        _ownedTokensIndex[tokenId] = _ownedTokens[to].length - 1;
    }
    
    function _addTokenToAllTokensEnumeration(uint256 tokenId) internal {
        require(!_tokenAdded[tokenId], "ERC721: token already added");
        _allTokensIndex[tokenId] = _allTokens.length;
        _allTokens.push(tokenId);
        _tokenAdded[tokenId] = true;
    }
    
    function _removeTokenFromOwnerEnumeration(address from, uint256 tokenId) internal {
        require(from != address(0), "ERC721: remove token from zero address");
        uint256 ownerTokenCount = _ownedTokens[from].length;
        require(ownerTokenCount > 0, "ERC721: token not found in enumeration");
        
        uint256 tokenIndex = _ownedTokensIndex[tokenId];
        require(_ownedTokens[from][tokenIndex] == tokenId, "ERC721: token not found in enumeration");

        uint256 lastTokenIndex = ownerTokenCount - 1;
        if (tokenIndex != lastTokenIndex) {
            uint256 lastTokenId = _ownedTokens[from][lastTokenIndex];
            _ownedTokens[from][tokenIndex] = lastTokenId;
            _ownedTokensIndex[lastTokenId] = tokenIndex;
        }
        _ownedTokens[from].pop();
        delete _ownedTokensIndex[tokenId];
    }
    
    function _removeTokenFromAllTokensEnumeration(uint256 tokenId) internal {
        uint256 tokenCount = _allTokens.length;
        require(tokenCount > 0, "ERC721: token not found in global enumeration");
        
        uint256 tokenIndex = _allTokensIndex[tokenId];
        require(tokenIndex < tokenCount, "ERC721: token not found in global enumeration");
        require(_allTokens[tokenIndex] == tokenId, "ERC721: token not found in global enumeration");
        
        uint256 lastTokenIndex = tokenCount - 1;
        if (tokenIndex != lastTokenIndex) {
            uint256 lastTokenId = _allTokens[lastTokenIndex];
            _allTokens[tokenIndex] = lastTokenId;
            _allTokensIndex[lastTokenId] = tokenIndex;
        }
        _allTokens.pop();
        delete _allTokensIndex[tokenId];
    }
    
    function _uint2str(uint256 _i) internal pure returns (string memory) {
        if (_i == 0) {
            return "0";
        }
        uint256 temp = _i;
        uint256 len;
        while (temp != 0) {
            len++;
            temp /= 10;
        }
        bytes memory buffer = new bytes(len);
        while (_i != 0) {
            len -= 1;
            buffer[len] = bytes1(uint8(48 + _i % 10));
            _i /= 10;
        }
        return string(buffer);
    }
}
