const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("CustomERC721 - approve() Function", function () {
  let TestCustomERC721, customERC721;
  let owner, addr1, addr2, addr3;

  beforeEach(async function () {
    [owner, addr1, addr2, addr3] = await ethers.getSigners();

    TestCustomERC721 = await ethers.getContractFactory("TestCustomERC721");
    customERC721 = await TestCustomERC721.deploy("Test Token", "TTK");
    await customERC721.waitForDeployment();
  });

  it("should revert when trying to approve a token that does not exist", async function () {
    await expect(customERC721.approve(addr1.address, 999)).to.be.revertedWith(
      "ERC721: query for nonexistent token"
    );
  });

  it("should revert when trying to approve the token's current owner", async function () {
    await (await customERC721.connect(addr1).mint()).wait();

    await expect(
      customERC721.connect(addr1).approve(addr1.address, 1)
    ).to.be.revertedWith("ERC721: approval to current owner");
  });

  it("should revert when the caller is not token owner nor an approved operator", async function () {
    await (await customERC721.connect(addr1).mint()).wait();

    await expect(
      customERC721.connect(addr2).approve(addr3.address, 1)
    ).to.be.revertedWith(
      "ERC721: approve caller is not owner nor approved for all"
    );
  });

  it("should allow the token owner to approve a different address", async function () {
    await (await customERC721.mint()).wait();

    await expect(customERC721.approve(addr1.address, 1))
      .to.emit(customERC721, "Approval")
      .withArgs(owner.address, addr1.address, 1);

    const approved = await customERC721.getApproved(1);
    expect(approved).to.equal(addr1.address);
  });

  it("should allow an approved operator to approve on behalf of the owner", async function () {
    await (await customERC721.connect(addr1).mint()).wait();

    await (
      await customERC721.connect(addr1).setApprovalForAll(addr2.address, true)
    ).wait();

    await expect(customERC721.connect(addr2).approve(addr3.address, 1))
      .to.emit(customERC721, "Approval")
      .withArgs(addr1.address, addr3.address, 1);

    const approved = await customERC721.getApproved(1);
    expect(approved).to.equal(addr3.address);
  });

  it("should update the approval if approve is called again with a different address", async function () {
    await (await customERC721.mint()).wait();

    await (await customERC721.approve(addr1.address, 1)).wait();
    let approved = await customERC721.getApproved(1);
    expect(approved).to.equal(addr1.address);

    await (await customERC721.approve(addr2.address, 1)).wait();
    approved = await customERC721.getApproved(1);
    expect(approved).to.equal(addr2.address);
  });
});
