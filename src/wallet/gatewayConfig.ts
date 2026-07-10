import { env } from "../shared/env";
import { bgFetch } from "../api/bgFetch";

/** EIP-3085 chain params for wallet_switchEthereumChain / wallet_addEthereumChain. */
export interface ChainParams {
  chainId: string; // hex
  chainName: string;
  rpcUrls: string[];
  nativeCurrency: { name: string; symbol: string; decimals: number };
  blockExplorerUrls: string[];
}

export interface RelayConfig {
  chainId: number;
  forwarder: { address: string; name: string; version: string };
  token: { address: string; name: string; version: string };
  postingFeeWei: string;
  addresses: { stakeEngine: string; postRegistry: string; vspToken: string };
  chain: ChainParams;
}

let _cfg: RelayConfig | null = null;

/** Fetch (and cache) the relay/chain config from the verity-api gateway. */
export async function getRelayConfig(): Promise<RelayConfig> {
  if (_cfg) return _cfg;
  const res = await bgFetch<RelayConfig>(`${env.verityApiUrl}/relay/config`);
  if (!res.ok || !res.json) throw new Error(res.error ?? "Relay config unavailable");
  _cfg = res.json;
  return _cfg;
}
