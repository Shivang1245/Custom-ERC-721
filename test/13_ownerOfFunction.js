const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("CustomERC721 - ownerOf() Function", function () {
  let TestCustomERC721, customERC721, owner, addr1, addr2, addr3;

  beforeEach(async function () {
    [owner, addr1, addr2, addr3] = await ethers.getSigners();

    TestCustomERC721 = await ethers.getContractFactory("TestCustomERC721");
    customERC721 = await TestCustomERC721.deploy("Test Token", "TTK");
    await customERC721.waitForDeployment();
  });

  it("should return the correct owner for a minted token", async function () {
    await (await customERC721.connect(addr1).mint()).wait();
    const tokenOwner = await customERC721.ownerOf(1);
    expect(tokenOwner).to.equal(addr1.address);
  });

  it("should revert when ownerOf is called for a nonexistent token", async function () {
    await expect(customERC721.ownerOf(99)).to.be.revertedWith(
      "ERC721: query for nonexistent token"
    );
  });

  it("should return the same owner on repeated calls for an existing token", async function () {
    await (await customERC721.connect(addr1).mint()).wait();
    const firstCall = await customERC721.ownerOf(1);
    const secondCall = await customERC721.ownerOf(1);
    expect(firstCall).to.equal(secondCall);
  });

  it("should update the owner after an unsafe transfer", async function () {
    await (await customERC721.connect(addr2).mint()).wait();
    let initialOwner = await customERC721.ownerOf(1);
    expect(initialOwner).to.equal(addr2.address);

    await (
      await customERC721
        .connect(addr2)
        .transferFrom(addr2.address, addr3.address, 1)
    ).wait();

    let newOwner = await customERC721.ownerOf(1);
    expect(newOwner).to.equal(addr3.address);
  });

  // it("should update the owner after a safe transfer", async function () {
  //   await (await customERC721.connect(addr2).mint()).wait();
  //   let initialOwner = await customERC721.ownerOf(1);
  //   expect(initialOwner).to.equal(addr2.address);

  //   await (
  //     await customERC721
  //       .connect(addr2)
  //       .safeTransferFrom(addr2.address, addr3.address, 1)
  //   ).wait();
  //   let updatedOwner = await customERC721.ownerOf(1);
  //   expect(updatedOwner).to.equal(addr3.address);
  // });
});
