# Deadman's Switch Proof of Concept

This project demonstrates a proof of concept for a deadman's switch.
The deadman's switch is a simple contract that allows the owner to
deposit ether to the contract. The contract will then allow the `heir` of the user to claim the inheritance `user` has deposited.

Inheritance is can be in the form of Ether or ERC20 tokens.

## Relevant Scripts

### `Compile`

```bash
    npx hardhat compile
```

### `Run a local node`

```bash
    npx hardhat node --network hardhat
```

### `Deploy`

```bash
    npx hardhat deploy --network localhost
```

### `Test`

```bash
    npx hardhat test --network localhost
```
