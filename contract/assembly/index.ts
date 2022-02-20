import { Context, PersistentUnorderedMap, MapEntry, logging, storage, util, math, u128 } from 'near-sdk-as'
import { bodyUrl, htmlResponse, Web4Request, Web4Response } from './web4'

export function renderNFT(accountId: string): string {
  let seed = math.hash(accountId);
  let h1 = seed[0];
  let h2 = seed[1];
  let cx = f64(seed[2]) / 255.;
  let cy = f64(seed[3]) / 255.;
  let r = (f64(seed[4]) / 255.) * 0.7 + 1;
  let s1 = seed[5] % 80 + 20;
  let s2 = seed[6] % 80 + 20;

  const svg = `
    <svg width="512" height="512" version="1.1" xmlns="http://www.w3.org/2000/svg">
      <defs>
          <radialGradient id="RadialGradient2" cx="${cx}" cy="${cy}" r="${r}">
            <stop offset="0%" stop-color="hsl(${h1}, ${s1}%, 50%)"/>
            <stop offset="100%" stop-color="hsl(${h2}, ${s2}%, 70%)"/>
          </radialGradient>
      </defs>
      <rect x="0" y="0" rx="15" ry="15" width="100%" height="100%" fill="url(#RadialGradient2)">
      </rect>
      <text x="50%" y="96" style="font-family: sans-serif; font-size: 24px; fill: white;" text-anchor="middle" >Claim at ${accountId}.page</text>
      <text x="50%" y="464" style="font-family: sans-serif; font-size: 48px; fill: white;" text-anchor="middle" >${accountId}</text>
    </svg>
  `;
  return svg;
}

const NFT_SPEC = 'nft-1.0.0'
const NFT_NAME = '.near club'
const NFT_SYMBOL = 'dotNEAR'

@nearBindgen
class TokenMetadata {
  constructor(
    public title: string,
    public description: string,
    public copies: u8,
    public media: string,
    // public media_hash: string = '',
    public issued_at: u64,
    // public expires_at: string = '',
    // public starts_at: string = '',
    // public updated_at: string = '',
    // public extra: string = '',
    // public reference: string = '',
    // public reference_hash: string = ''
  ) { }
}

@nearBindgen
class NFTContractMetadata {
  constructor(
    public spec: string = NFT_SPEC,
    public name: string = NFT_NAME,
    public symbol: string = NFT_SYMBOL,
    public icon: string = '',
    // public base_uri: string = '',
    // public reference: string = '',
    // public reference_hash: string = '',
  ) { }
}

@nearBindgen
class Token {
    id: string
    owner_id: string
    creator: string
    metadata: TokenMetadata

    constructor(creator: string, owner: string) {
      this.id = creator;
      this.creator = creator;
      this.owner_id = owner;

      const title = `${creator}`;

      const copies: u8 = 1

      let media = `http://localhost:1234/img/${creator}`;
      if (Context.contractName.endsWith('.near') || Context.contractName.endsWith('.testnet')) {
        media = `https://${Context.contractName}.page/img/${creator}`;
      }
      this.metadata = new TokenMetadata(
          title,
          `${creator} account for sale`,
          copies,
          media,
          Context.blockTimestamp,
      )
    }
}

export function web4_get(request: Web4Request): Web4Response {
  if (request.path.startsWith('/img')) {
    const parts = request.path.split('/');
    assert(parts.length == 3);
    const accountId = parts[2];
    // TODO: Validate account ID more thoroughly to make sure code cannot be injected
    assert(!accountId.includes('&') && !accountId.includes('<'));
    const svg = renderNFT(accountId);
    return { contentType: 'image/svg+xml; charset=UTF-8', body: util.stringToBytes(svg) };
  }

  // return bodyUrl(`ipfs://bafybeibbw4lwftmc5qp3qvixf6sy3xqizyydedj6h5wpt3uq5vtgs42xue${request.path}`);
  return htmlResponse(`
    <img src="/img/${Context.contractName}">
  `);
}

export function nft_token(token_id: string): Token | null {
  if (token_id != Context.contractName) {
    return null;
  }

  const stateKey = `state:${token_id}`;
  const state = storage.getSome<TokenState>(stateKey);

  return new Token(token_id, state.owner);
}

export function nft_total_supply(): u64 {
  return 1;
}

export function nft_tokens(from_index: u64 = 0, limit: u8 = 0): Token[] {
  return [nft_token(Context.contractName)!];
}

export function nft_supply_for_owner(account_id: string): u64 {
  const token_id = Context.contractName;
  const stateKey = `state:${token_id}`;
  const state = storage.getSome<TokenState>(stateKey);

  return state.owner == account_id ? 1 : 0;
}

export function nft_tokens_for_owner(
  account_id: string,
  from_index: u64 = 0,
  limit: u8 = 0
): Token[] {
  const token = nft_token(Context.contractName);  
  if (nft_supply_for_owner(account_id) == 0) {
    return [];
  }

  return token ? [token!] : [];
}

export function nft_metadata(): NFTContractMetadata {
  return new NFTContractMetadata();
}

@nearBindgen
class Payout {
  payout: Map<string, u128> = new Map();
}


/// Given a `token_id` and NEAR-denominated balance, return the `Payout`.
/// struct for the given token. Panic if the length of the payout exceeds
export function nft_payout(token_id: string, balance: u128, max_len_payout: u32): Payout {
  // TODO: Real payouts for more complex tokens
  return new Payout();
}

/// Given a `token_id` and NEAR-denominated balance, transfer the token
/// and return the `Payout` struct for the given token. Panic if the
/// length of the payout exceeds `max_len_payout.`
export function nft_transfer_payout(
  receiver_id: string,
  token_id: string,
  approval_id: u64,
  balance: u128,
  max_len_payout: u32,
): Payout {
  assert_one_yocto();

  const  payout = nft_payout(token_id, balance, max_len_payout);
  nft_transfer(receiver_id, token_id, approval_id);
  return payout
}

@nearBindgen
class TokenState {
  owner: string;
  last_id: u64;
  approved: Map<string, u64> = new Map();
}

export function nft_transfer(
  receiver_id: string,
  token_id: string,
  // TODO: Is it allowed to skip approval_id for external callers?
  approval_id: u64 = 0,
  // memo: string | null
): void {
  const senderId = Context.predecessor;
  
  assert(senderId != receiver_id, 'The token owner and the receiver should be different');

  const stateKey = `state:${token_id}`;
  const state = storage.getSome<TokenState>(stateKey);
  if (senderId != state.owner) {
    assert(state.approved.has(senderId)), 'sender is not approved';

    if (approval_id) {
      assert(state.approved.get(senderId) == approval_id, `approval_id doesn't exist for sender`);
    }
  }

  state.approved = new Map();
  state.owner = receiver_id;
  storage.set(stateKey, state);
}

export function nft_approve(token_id: string, account_id: string, msg: string | null): void {
  assert(msg == null, 'msg not supported');

  const stateKey = `state:${token_id}`;
  const state = storage.getSome<TokenState>(stateKey);
  assert(state.owner == Context.predecessor, 'Must be called by token owner');

  state.last_id++;
  state.approved.set(account_id, state.last_id);
  storage.set(stateKey, state);
}

export function nft_mint_to(receiver_id: string): void {
  assert(Context.predecessor == Context.contractName, 'Must be called by self');

  const token_id = Context.contractName;
  const stateKey = `state:${token_id}`;
  // assert(!storage.hasKey(stateKey), 'Can only be minted once');

  const state = new TokenState();
  state.owner = receiver_id;
  storage.set(stateKey, state);

  logging.log(`EVENT_JSON:{
    "standard": "nep171",
    "version": "1.0.0",
    "event": "nft_mint",
    "data": [
      {"owner_id": "${receiver_id}", "token_ids": ["${token_id}"]}
    ]
  }`);
}

function assert_one_yocto(): void {
  assert(Context.attachedDeposit >= u128.One, 'need to attach at least 1 yoctoNEAR');
}