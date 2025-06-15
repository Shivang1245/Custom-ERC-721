require("dotenv").config();
const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("CustomERC721 - ownerOf() Function", function () {
  let customERC721;
  let owner, addr1, addr2, addr3;

  before(async function () {
    [owner, addr1, addr2, addr3] = await ethers.getSigners();
    const deployedAddress = process.env.TESTCUSTOMERC721;
    if (!deployedAddress || deployedAddress.trim() === "") {
      throw new Error(
        "No deployed contract address provided in TESTCUSTOMERC721."
      );
    }
    customERC721 = await ethers.getContractAt(
      "TestCustomERC721",
      deployedAddress.trim()
    );
    console.log("Using deployed TestCustomERC721 at:", deployedAddress.trim());
  });

  async function mintAndGetTokenId(signer) {
    const tx = await customERC721.connect(signer).mint();
    const receipt = await tx.wait();
    let tokenId;
    if (receipt.events) {
      const transferEvent = receipt.events.find((e) => e.event === "Transfer");
      if (transferEvent) {
        tokenId = transferEvent.args.tokenId;
      }
    }
    if (tokenId === undefined) {
      const balance = await customERC721.balanceOf(signer.address);
      tokenId = await customERC721.tokenOfOwnerByIndex(
        signer.address,
        balance - 1n
      );
    }
    return tokenId;
  }

  it("should return the correct owner for a minted token", async function () {
    const tokenId = await mintAndGetTokenId(addr1);
    const tokenOwner = await customERC721.ownerOf(tokenId);
    expect(tokenOwner).to.equal(addr1.address);
  });

  it("should revert when ownerOf is called for a nonexistent token", async function () {
    await expect(customERC721.ownerOf(999)).to.be.revertedWith(
      "ERC721: query for nonexistent token"
    );
  });

  it("should return the same owner on repeated calls for an existing token", async function () {
    const tokenId = await mintAndGetTokenId(addr1);
    const firstCall = await customERC721.ownerOf(tokenId);
    const secondCall = await customERC721.ownerOf(tokenId);
    expect(firstCall).to.equal(secondCall);
  });

  it("should update the owner after an unsafe transfer", async function () {
    const tokenId = await mintAndGetTokenId(addr2);
    let initialOwner = await customERC721.ownerOf(tokenId);
    expect(initialOwner).to.equal(addr2.address);

    await (
      await customERC721
        .connect(addr2)
        .transferFrom(addr2.address, addr3.address, tokenId)
    ).wait();

    let newOwner = await customERC721.ownerOf(tokenId);
    expect(newOwner).to.equal(addr3.address);
  });
});
