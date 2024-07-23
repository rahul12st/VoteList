require("@nomicfoundation/hardhat-toolbox");


/** @type import('hardhat/config').HardhatUserConfig */

module.exports = {
  solidity: "0.8.9",
  networks: {
    hardhat: {
      chainId: 31337,
    },
    polygon_sepolia: {
      url: "https://eth-sepolia.g.alchemy.com/v2/bhVrpHca6ProL7FKGMj908oiAkhjTjx3",
      accounts: [`0x${"9d7047fafcaed07a6e5278b42e46f6a81d4dde2d4ed99891564932682fdddc4a"}`],
    },
  },
};
