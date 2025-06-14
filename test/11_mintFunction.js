const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("CustomERC721 - _mint() Function", function () {
  let TestCustomERC721, customERC721;
  let owner, addr1, addr2;

  beforeEach(async function () {
    [owner, addr1, addr2] = await ethers.getSigners();

    TestCustomERC721 = await ethers.getContractFactory("TestCustomERC721");
    customERC721 = await TestCustomERC721.deploy("Test Token", "TTK");
    await customERC721.waitForDeployment();
  });

  it("should mint a new token successfully via public mint()", async function () {
    await expect(customERC721.connect(addr1).mint())
      .to.emit(customERC721, "Transfer")
      .withArgs(ethers.ZeroAddress, addr1.address, 1);

    expect(await customERC721.ownerOf(1)).to.equal(addr1.address);
    expect(await customERC721.balanceOf(addr1.address)).to.equal(1);
  });

  it("should revert when attempting to mint a token to the zero address (using exposedMint)", async function () {
    await expect(
      customERC721.exposedMint(ethers.ZeroAddress, 100)
    ).to.be.revertedWith("ERC721: mint to zero address");
  });

  it("should revert when attempting to mint a token that already exists (using exposedMint)", async function () {
    await customERC721.connect(addr1).mint();
    await expect(customERC721.exposedMint(addr2.address, 1)).to.be.revertedWith(
      "ERC721: token already minted"
    );
  });

  it("should update balances correctly after minting tokens", async function () {
    expect(await customERC721.balanceOf(addr1.address)).to.equal(0);
    expect(await customERC721.balanceOf(addr2.address)).to.equal(0);

    await customERC721.connect(addr1).mint();
    expect(await customERC721.balanceOf(addr1.address)).to.equal(1);

    await customERC721.connect(addr2).mint();
    expect(await customERC721.balanceOf(addr2.address)).to.equal(1);
  });
});
