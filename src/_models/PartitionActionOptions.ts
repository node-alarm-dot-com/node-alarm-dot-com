/**
 * These options are sent when arming a partition to indicate desired arming options.
 */
export interface PartitionActionOptions {
  noEntryDelay: boolean;
  silentArming: boolean;
  nightArming: boolean;
  forceBypass: boolean;
}
