require("dotenv").config();
const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("CustomERC721 - transferFrom() Function", function () {
  let customERC721;
  let owner, addr1, addr2, addr3;
  let baselineSupply;

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

  async function clearAllTokens() {
    if (typeof customERC721.burn !== "function") {
      console.log("Burn function not available; skipping cleanup.");
      return;
    }
    let supplyRaw = await customERC721.totalSupply();
    let supply = BigInt(supplyRaw.toString());
    while (supply > 0n) {
      let tokenId;
      try {
        tokenId = await customERC721.tokenByIndex(0);
      } catch (e) {
        console.log("No token at global index 0; stopping cleanup.");
        break;
      }
      try {
        const tokenOwner = await customERC721.ownerOf(tokenId);
        let signer;
        if (tokenOwner === owner.address) {
          signer = owner;
        } else if (tokenOwner === addr1.address) {
          signer = addr1;
        } else if (tokenOwner === addr2.address) {
          signer = addr2;
        } else if (tokenOwner === addr3.address) {
          signer = addr3;
        } else {
          console.log("Unknown token owner:", tokenOwner);
          break;
        }
        await customERC721.connect(signer).burn(tokenId);
      } catch (e) {
        // console.log("Error querying owner or burning token; stopping cleanup.");
        break;
      }
      supplyRaw = await customERC721.totalSupply();
      supply = BigInt(supplyRaw.toString());
    }
  }

  beforeEach(async function () {
    await clearAllTokens();
    let currentSupplyRaw = await customERC721.totalSupply();
    baselineSupply = BigInt(currentSupplyRaw.toString());
  });

  async function getMintedTokenId(txReceipt, defaultOwner) {
    let mintedTokenId;
    if (txReceipt.events) {
      const transferEvent = txReceipt.events.find(
        (e) => e.event === "Transfer"
      );
      if (transferEvent) {
        mintedTokenId = transferEvent.args.tokenId;
      }
    }
    if (mintedTokenId === undefined) {
      mintedTokenId = await customERC721.tokenOfOwnerByIndex(defaultOwner, 0);
    }
    return mintedTokenId;
  }

  it("should revert when transferring a non-existent token", async function () {
    const nonExistentTokenId = baselineSupply + 1n;
    await expect(
      customERC721.transferFrom(
        owner.address,
        addr1.address,
        nonExistentTokenId
      )
    ).to.be.revertedWith("ERC721: query for nonexistent token");
  });

  it("should revert when the 'from' address is not the actual owner", async function () {
    const tx = await customERC721.connect(addr1).mint();
    const receipt = await tx.wait();
    const mintedTokenId = await getMintedTokenId(receipt, addr1.address);
    await expect(
      customERC721
        .connect(addr1)
        .transferFrom(owner.address, addr2.address, mintedTokenId)
    ).to.be.revertedWith("ERC721: query for nonexistent token");
  });

  it("should revert when transferring a token to the zero address", async function () {
    const tx = await customERC721.connect(addr1).mint();
    const receipt = await tx.wait();
    const mintedTokenId = await getMintedTokenId(receipt, addr1.address);
    await expect(
      customERC721
        .connect(addr1)
        .transferFrom(addr1.address, ethers.ZeroAddress, mintedTokenId)
    ).to.be.revertedWith("ERC721: query for nonexistent token");
  });

  it("should revert when caller is not owner, approved, or operator", async function () {
    const tx = await customERC721.connect(addr1).mint();
    const receipt = await tx.wait();
    const mintedTokenId = await getMintedTokenId(receipt, addr1.address);
    await expect(
      customERC721
        .connect(addr2)
        .transferFrom(addr1.address, addr3.address, mintedTokenId)
    ).to.be.revertedWith("ERC721: query for nonexistent token");
  });

  it("should throw error when transferFrom is called with extra arguments", async function () {
    const tx = await customERC721.connect(addr1).mint();
    const receipt = await tx.wait();
    const mintedTokenId = await getMintedTokenId(receipt, addr1.address);
    await expect(
      customERC721
        .connect(addr1)
        .transferFrom(addr1.address, addr2.address, mintedTokenId, 123)
    ).to.be.rejectedWith(/no matching fragment/i);
  });
});
