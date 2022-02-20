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
      <text x="50%" y="48" style="font-family: sans-serif; font-size: 16px; fill: white;" text-anchor="middle" >Claim at ${accountId}.page</text>
      <text x="50%" y="464" style="font-family: sans-serif; font-size: 24px; fill: white;" text-anchor="middle" >${accountId}</text>

      <text x="50%" y="352" style="font-family: sans-serif; font-size: 24px; fill: white;" text-anchor="middle" >for sale</text>

      <!-- NOTE: Taken from https://www.svgrepo.com/svg/12039/for-sale -->
      <svg x="37%" y="37%" width="25%" height="25%"
        viewBox="0 0 512 512"
        style="enable-background:new 0 0 512 512; fill: white;"
        xml:space="preserve">
      <g>
        <g>
          <g>
            <path d="M213.333,119.467H384c4.719,0,8.533-3.823,8.533-8.533S388.719,102.4,384,102.4H213.333
              c-4.719,0-8.533,3.823-8.533,8.533S208.614,119.467,213.333,119.467z"/>
            <path d="M324.267,230.4c0,4.71,3.814,8.533,8.533,8.533h85.333c4.719,0,8.533-3.823,8.533-8.533s-3.814-8.533-8.533-8.533H332.8
              C328.081,221.867,324.267,225.69,324.267,230.4z"/>
            <path d="M332.8,187.733H384c4.719,0,8.533-3.823,8.533-8.533s-3.814-8.533-8.533-8.533h-51.2c-4.719,0-8.533,3.823-8.533,8.533
              S328.081,187.733,332.8,187.733z"/>
            <path d="M401.067,273.067H332.8c-4.719,0-8.533,3.823-8.533,8.533s3.814,8.533,8.533,8.533h68.267
              c4.719,0,8.533-3.823,8.533-8.533S405.786,273.067,401.067,273.067z"/>
            <path d="M264.533,494.933H179.2c-4.719,0-8.533,3.823-8.533,8.533S174.481,512,179.2,512h85.333c4.719,0,8.533-3.823,8.533-8.533
              S269.252,494.933,264.533,494.933z"/>
            <path d="M332.8,494.933h-17.067c-4.719,0-8.533,3.823-8.533,8.533s3.814,8.533,8.533,8.533H332.8
              c4.719,0,8.533-3.823,8.533-8.533S337.519,494.933,332.8,494.933z"/>
            <path d="M185.233,227.9l2.5-2.5V281.6c0,4.71,3.814,8.533,8.533,8.533H281.6c4.719,0,8.533-3.823,8.533-8.533v-56.201l2.5,2.5
              c1.664,1.664,3.849,2.5,6.033,2.5c2.185,0,4.369-0.836,6.033-2.5c3.336-3.337,3.336-8.73,0-12.066L244.966,156.1
              c-3.337-3.337-8.73-3.337-12.066,0l-59.733,59.733c-3.337,3.337-3.337,8.73,0,12.066
              C176.503,231.236,181.897,231.236,185.233,227.9z M238.933,174.199l35.209,35.209c-0.623,1.195-1.075,2.483-1.075,3.925v59.733
              h-25.6v-25.6c0-4.71-3.814-8.533-8.533-8.533s-8.533,3.823-8.533,8.533v25.6h-25.6v-59.733c0-1.442-0.452-2.731-1.075-3.925
              L238.933,174.199z"/>
            <path d="M503.467,494.933H366.933c-4.719,0-8.533,3.823-8.533,8.533s3.814,8.533,8.533,8.533h136.533
              c4.719,0,8.533-3.823,8.533-8.533S508.186,494.933,503.467,494.933z"/>
            <path d="M162.133,102.4c-23.526,0-42.667,19.14-42.667,42.667v170.667c0,23.526,19.14,42.667,42.667,42.667H435.2
              c23.526,0,42.667-19.14,42.667-42.667V145.067c0-23.526-19.14-42.667-42.667-42.667h-8.533V68.267h76.8
              c4.719,0,8.533-3.823,8.533-8.533s-3.814-8.533-8.533-8.533H85.333V25.6c0-14.114-11.486-25.6-25.6-25.6s-25.6,11.486-25.6,25.6
              v469.333h-25.6c-4.719,0-8.533,3.823-8.533,8.533S3.814,512,8.533,512H128c4.719,0,8.533-3.823,8.533-8.533
              s-3.814-8.533-8.533-8.533H85.333V93.867c0-4.71-3.814-8.533-8.533-8.533s-8.533,3.823-8.533,8.533v401.067H51.2V25.6
              c0-4.702,3.823-8.533,8.533-8.533s8.533,3.831,8.533,8.533v34.133c0,4.71,3.814,8.533,8.533,8.533h93.867V102.4H162.133z
              M179.2,119.467c4.719,0,8.533-3.823,8.533-8.533V68.267H409.6v42.667c0,4.71,3.814,8.533,8.533,8.533H435.2
              c14.114,0,25.6,11.486,25.6,25.6v170.667c0,14.114-11.486,25.6-25.6,25.6H162.133c-14.114,0-25.6-11.486-25.6-25.6V145.067
              c0-14.114,11.486-25.6,25.6-25.6H179.2z"/>
          </g>
        </g>
      </g>
      </svg>
    </svg>
  `;
  return svg;
}

const NFT_SPEC = 'nft-1.0.0'
const NFT_SYMBOL = '.near'

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
    public name: string = `${Context.contractName}`,
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