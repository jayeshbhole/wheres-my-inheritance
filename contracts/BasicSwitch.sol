// SPDX-License-Identifier: MIT
pragma solidity 0.8.7;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Address.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/utils/introspection/ERC165.sol";
import "./Interfaces/IBasicSwitch.sol";

contract BasicSwitch is Ownable, AccessControl, IBasicSwitch {
    using Address for address;

    // Define HEIR_ROLE for the AccessControl contract
    bytes32 internal constant HEIR_ROLE = keccak256("HEIR_ROLE");
    uint256 internal expectancy;
    address payable internal heir;

    uint256 public lastAlive;
    // array of ERC20 token addresses included in the switch
    address[] public erc20Tokens;

    // mapping of erc20 token status. 0 for not included, 1 for included and enabled, 2 for included and disabled
    mapping(address => uint8) public erc20Status;

    modifier onlyHeir() {
        require(hasRole(HEIR_ROLE, msg.sender), "Caller is not a heir");
        _;
    }

    constructor(uint256 _expectancy, address _heir) payable {
        expectancy = _expectancy;
        heir = payable(_heir);
        lastAlive = block.number;
        _setupRole(HEIR_ROLE, _heir);
    }

    // External Functions
    function getHeir() public view returns (address) {
        return heir;
    }

    function changeHeir(address _heir) public onlyOwner {
        _revokeRole(HEIR_ROLE, heir);
        heir = payable(_heir);
        _setupRole(HEIR_ROLE, _heir);
    }

    function keepAlive() external payable override onlyOwner {
        lastAlive = block.number;
    }

    // ERC20 Token operations for the switch treasury
    function addERC20(address _token) external {
        require(_token.isContract(), "Token address is not a contract");
        require(
            erc20Status[_token] == 0,
            "ERC20 token address is already included"
        );

        erc20Tokens.push(_token);
        _changeERC20Status(_token, 1);
    }

    function changeERC20Status(address _token, uint8 _status) external {
        require(erc20Status[_token] == 0, "Token does not exist");

        _changeERC20Status(_token, _status);
    }

    // Claim operations
    function claimInheritance() public override {
        require(block.number - lastAlive > expectancy, "Owner is alive");

        heir.transfer(address(this).balance);
    }

    function claimInheritanceERC20() public {
        require(block.number - lastAlive > expectancy, "Owner is alive");

        _transferErc20Tokens();
    }

    // Private Functions
    function _changeERC20Status(address _token, uint8 _status) internal {
        require(erc20Status[_token] == 0, "ERC20 does not exist");

        erc20Status[_token] = _status;
    }

    // transfer erc20 tokens to the heir
    function _transferErc20Tokens() internal {
        for (uint256 i = 0; i < erc20Tokens.length; i++) {
            if (erc20Status[erc20Tokens[i]] == 1) {
                uint allowance = ERC20(erc20Tokens[i]).allowance(
                    owner(),
                    address(this)
                );

                uint amount = allowance >
                    ERC20(erc20Tokens[i]).balanceOf(owner())
                    ? ERC20(erc20Tokens[i]).balanceOf(owner())
                    : allowance;

                ERC20(erc20Tokens[i]).transferFrom(owner(), heir, amount);
            }
        }
    }
}
