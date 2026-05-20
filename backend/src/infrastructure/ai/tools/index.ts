/**
 * Standardize historical records query matches for analysis workflows
 * @param records Raw historical records database array
 */
export const normalizeHistoricalRecords = (records: any[] = []) =>
  records.map((record: any) => ({
    key: record.key,
    source: record.source,
    value: record.value,
  }));
