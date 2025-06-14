// require("dotenv").config(); // Load env variables from .env

// const { expect } = require("chai");
// const { ethers } = require("hardhat");

// /**
//  * Helper function that returns an instance of TestCustomERC721.
//  * If process.env.TESTCUSTOMERC721 is set to a non-empty string representing
//  * a deployed contract address, it will try to use that. Otherwise, it deploys a new instance.
//  */
// async function getCustomERC721Instance() {
//   const providedAddress = process.env.TESTCUSTOMERC721;
//   // if (providedAddress && providedAddress.trim() !== "")
//   {
//     try {
//       const instance = await ethers.getContractAt(
//         "TestCustomERC721",
//         providedAddress.trim()
//       );
//       await instance.name();
//       console.log(
//         "Using already deployed TestCustomERC721 at:",
//         providedAddress
//       );
//       return instance;
//     } catch (error) {
//       console.log(
//         "Provided contract address is invalid or not deployed; deploying a new instance."
//       );
//     }
//   }
//   // Otherwise deploy a new instance.
//   const ERC721Factory = await ethers.getContractFactory("TestCustomERC721");
//   const instance = await ERC721Factory.deploy("Test Token", "TTK");
//   await instance.waitForDeployment();
//   console.log("Deployed new TestCustomERC721 at:", await instance.getAddress());
//   return instance;
// }

// describe("CustomERC721 - Event Emission Tests", function () {
//   let customERC721;
//   let owner, addr1, addr2;
//   let contractAddress; // to store the contract address once retrieved

//   beforeEach(async function () {
//     [owner, addr1, addr2] = await ethers.getSigners();
//     // Use the helper to either reuse an already deployed contract or deploy a new one.
//     customERC721 = await getCustomERC721Instance();
//     if (!customERC721) {
//       throw new Error("Failed to obtain a TestCustomERC721 instance.");
//     }
//     contractAddress = await customERC721.getAddress();
//     console.log("Using contract at address:", contractAddress);
//   });
//   // let a = ;
//   // console.log(a);
//   it("should emit Mint event on successful minting", async function () {
//     await expect(customERC721.connect(addr1).mint())
//       .to.emit(customERC721, "Transfer")
//       .withArgs(ethers.ZeroAddress, addr1.address, 1);
//   });

//   it("should revert mint if the token is already minted", async function () {
//     // This test expects that minting a token that's already minted will revert.
//     await expect(customERC721.connect(addr1).exposedMint(addr2.address, 1)).to
//       .be.reverted; // Customize the expected revert message if needed.
//   });

//   it("should revert when trying to burn a non-existent token", async function () {
//     await expect(
//       customERC721.connect(addr1).exposedBurn(999)
//     ).to.be.revertedWith("ERC721: query for nonexistent token");
//   });

//   it("should emit Transfer event on successful transfer", async function () {
//     await customERC721.connect(owner).exposedMint(owner.address, 1);
//     await expect(
//       customERC721.connect(owner).transferFrom(owner.address, addr1.address, 1)
//     )
//       .to.emit(customERC721, "Transfer")
//       .withArgs(owner.address, addr1.address, 1);
//   });

//   it("should revert if sender is not owner or approved", async function () {
//     await customERC721.connect(owner).exposedMint(owner.address, 1);
//     await expect(
//       customERC721.connect(addr1).transferFrom(owner.address, addr2.address, 1)
//     ).to.be.revertedWith("ERC721: transfer caller not owner nor approved");
//   });

//   it("should emit ApprovalForAll event when setting operator approval", async function () {
//     await expect(
//       customERC721.connect(owner).exposedSetApprovalForAll(addr1.address, true)
//     )
//       .to.emit(customERC721, "ApprovalForAll")
//       .withArgs(owner.address, addr1.address, true);
//   });

//   it("should revert when trying to approve a token that doesn't exist", async function () {
//     await expect(
//       customERC721.connect(owner).approve(addr1.address, 999)
//     ).to.be.revertedWith("ERC721: query for nonexistent token");
//   });
// });

require("dotenv").config();
const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("CustomERC721 - Event Emission Tests", function () {
  let customERC721;
  let owner, addr1, addr2;
  let contractAddress; // This variable holds the deployed contract's address.

  // Instead of deploying, we load the instance from the provided address.
  before(async function () {
    [owner, addr1, addr2] = await ethers.getSigners();
    const providedAddress = process.env.TESTCUSTOMERC721;
    if (!providedAddress || providedAddress.trim() === "") {
      throw new Error(
        "No deployed contract address provided in TESTCUSTOMERC721."
      );
    }
    customERC721 = await ethers.getContractAt(
      "TestCustomERC721",
      providedAddress.trim()
    );
    contractAddress = providedAddress.trim();
    console.log("Using deployed TestCustomERC721 at address:", contractAddress);
  });

  // After each test, we perform cleanup by burning all tokens—so that leftover tokens do not interfere.
  afterEach(async function () {
    const countBigInt = await customERC721.allTokensCount();
    const count = Number(countBigInt);
    // Loop backward (since burning a token may shift indices)
    for (let i = count - 1; i >= 0; i--) {
      const tokenId = await customERC721.readAllToken(i);
      const tokenOwner = await customERC721.ownerOf(tokenId);
      // Use the appropriate signer to call burn.
      if (tokenOwner === owner.address) {
        await customERC721.connect(owner).exposedBurn(tokenId);
      } else if (tokenOwner === addr1.address) {
        await customERC721.connect(addr1).exposedBurn(tokenId);
      } else if (tokenOwner === addr2.address) {
        await customERC721.connect(addr2).exposedBurn(tokenId);
      }
    }
  });

  it("should emit Mint event on successful minting", async function () {
    // For the auto-assigned mint, call mint() on addr1.
    await expect(customERC721.connect(addr1).mint())
      .to.emit(customERC721, "Transfer")
      .withArgs(ethers.ZeroAddress, addr1.address, 1);
  });

  it("should revert mint if the token is already minted", async function () {
    // Mint token with tokenId 1 via addr1.
    await customERC721.connect(addr1).mint();
    // Attempting to mint again with tokenId 1 using exposedMint should revert.
    await expect(
      customERC721.connect(addr1).exposedMint(addr2.address, 1)
    ).to.be.revertedWith("ERC721: token already added");
  });

  it("should revert when trying to burn a non-existent token", async function () {
    await expect(
      customERC721.connect(addr1).exposedBurn(999)
    ).to.be.revertedWith("ERC721: query for nonexistent token");
  });

  it("should emit Transfer event on successful transfer", async function () {
    // Use a unique token id (e.g. 101) for this test.
    await customERC721.connect(owner).exposedMint(owner.address, 101);
    await expect(
      customERC721
        .connect(owner)
        .transferFrom(owner.address, addr1.address, 101)
    )
      .to.emit(customERC721, "Transfer")
      .withArgs(owner.address, addr1.address, 101);
  });

  it("should revert if sender is not owner or approved", async function () {
    // Use a unique token id (e.g. 102) for this test.
    await customERC721.connect(owner).exposedMint(owner.address, 102);
    await expect(
      customERC721
        .connect(addr1)
        .transferFrom(owner.address, addr2.address, 102)
    ).to.be.revertedWith("ERC721: transfer caller not owner nor approved");
  });

  it("should emit ApprovalForAll event when setting operator approval", async function () {
    await expect(
      customERC721.connect(owner).exposedSetApprovalForAll(addr1.address, true)
    )
      .to.emit(customERC721, "ApprovalForAll")
      .withArgs(owner.address, addr1.address, true);
  });

  it("should revert when trying to approve a token that doesn't exist", async function () {
    await expect(
      customERC721.connect(owner).approve(addr1.address, 999)
    ).to.be.revertedWith("ERC721: query for nonexistent token");
  });
});
