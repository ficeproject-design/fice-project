/** Data demo (order + pelanggan contoh) hanya untuk dev; production mulai kosong. */
export function shouldSeedDemo(nodeEnv: string | undefined): boolean {
  return nodeEnv !== 'production';
}
