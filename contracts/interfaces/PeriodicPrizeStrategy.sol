// SPDX-License-Identifier: MIT
interface PeriodicPrizeStrategy {
  function startAward() external;
  function completeAward() external;
  function isPrizePeriodOver() external view returns (bool);
  function isRngRequested() external view returns (bool);
  function isRngCompleted() external view returns (bool);
}