// SPDX-License-Identifier: MIT
interface PeriodicPrizeStrategyInterface {
  function startAward() external;
  function completeAward() external;
  function canStartAward() external view returns (bool);
  function canCompleteAward() external view returns (bool);
}