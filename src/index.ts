interface McpToolDefinition {
  name: string;
  description: string;
  inputSchema: {
    type: 'object';
    properties: Record<string, unknown>;
    required?: string[];
  };
}

interface McpToolExport {
  tools: McpToolDefinition[];
  callTool: (name: string, args: Record<string, unknown>) => Promise<unknown>;
  meter?: { credits: number };
  cost?: Record<string, unknown>;
  provider?: string;
}

/**
 * ifsc-in MCP — Indian bank branch IFSC code lookup via Razorpay's open
 * IFSC API (ifsc.razorpay.com). Keyless.
 *
 * Tools:
 * - ifsc_lookup: resolve an 11-character IFSC code to bank/branch details
 *   (bank, branch, address, city, district, state, MICR, SWIFT, contact)
 *   plus NEFT/RTGS/UPI/IMPS payment-rail support flags. Includes an offline
 *   format check (format_valid) in the same response.
 *
 * Resolves/validates the CODE only — it does not verify a bank account.
 */


const BASE_URL = 'https://ifsc.razorpay.com';

// IFSC format: 4 letters (bank code) + '0' (reserved) + 6 alphanumerics (branch) = 11 chars
const IFSC_RE = /^[A-Z]{4}0[A-Z0-9]{6}$/;

const tools: McpToolExport['tools'] = [
  {
    name: 'ifsc_lookup',
    description:
      'Indian bank branch lookup by IFSC code. Resolves an 11-character IFSC code (printed on Indian cheques and bank statements) to the bank name, branch, address, city, district, state, MICR code, SWIFT code, and contact number, plus whether the branch supports the NEFT, RTGS, UPI, and IMPS payment rails. India banking / fund-transfer routing data via the open Razorpay IFSC dataset (keyless). Also returns an offline format_valid check of the code structure. NOTE: this validates and resolves the IFSC code itself — it does NOT verify a bank account or account holder. Examples: ifsc_lookup({ ifsc: "HDFC0CAGSBK" }), ifsc_lookup({ ifsc: "sbin0000691" }) (case and spaces are forgiven).',
    inputSchema: {
      type: 'object' as const,
      properties: {
        ifsc: {
          type: 'string',
          description:
            'The 11-character IFSC code, e.g. "HDFC0CAGSBK" or "SBIN0000691". Format: 4 letters (bank) + 0 + 6 alphanumerics (branch). Spaces and lowercase are tolerated.',
        },
      },
      required: ['ifsc'],
    },
  },
];

interface UpstreamBranch {
  IFSC?: string;
  BANK?: string;
  BANKCODE?: string;
  BRANCH?: string;
  ADDRESS?: string;
  CENTRE?: string;
  CITY?: string;
  DISTRICT?: string;
  STATE?: string;
  MICR?: string | null;
  SWIFT?: string | null;
  CONTACT?: string | null;
  ISO3166?: string | null;
  UPI?: boolean;
  RTGS?: boolean;
  NEFT?: boolean;
  IMPS?: boolean;
}

async function callTool(name: string, args: Record<string, unknown>): Promise<unknown> {
  switch (name) {
    case 'ifsc_lookup': {
      const raw = args.ifsc;
      if (typeof raw !== 'string' || !raw.trim()) {
        throw new Error('Required argument "ifsc" is missing. Pass a string like "HDFC0CAGSBK".');
      }
      // Forgiving normalization: trim, strip internal spaces/dashes, uppercase.
      const code = raw.replace(/[\s-]/g, '').toUpperCase();
      const formatValid = IFSC_RE.test(code);
      if (!formatValid) {
        return {
          error: `"${raw}" is not a valid IFSC format. An IFSC code is exactly 11 characters: 4 letters (bank code) + the digit 0 + 6 letters/digits (branch code), e.g. "HDFC0CAGSBK" or "SBIN0000691".`,
          input: raw,
          normalized: code,
          format_valid: false,
        };
      }

      const res = await fetch(`${BASE_URL}/${code}`, {
        headers: { Accept: 'application/json' },
      });
      if (res.status === 404) {
        return {
          error: `No branch found for IFSC ${code} — check the code; IFSC codes are printed on Indian cheques and bank statements.`,
          ifsc: code,
          format_valid: true,
          found: false,
        };
      }
      if (!res.ok) {
        throw new Error(`IFSC API error: HTTP ${res.status} for code ${code}`);
      }
      const b = (await res.json()) as UpstreamBranch;

      return {
        ifsc: b.IFSC ?? code,
        format_valid: true,
        found: true,
        bank: b.BANK ?? null,
        bank_code: b.BANKCODE ?? null,
        branch: b.BRANCH ?? null,
        address: b.ADDRESS ?? null,
        centre: b.CENTRE ?? null,
        city: b.CITY ?? null,
        district: b.DISTRICT ?? null,
        state: b.STATE ?? null,
        micr: b.MICR ?? null,
        swift: b.SWIFT ?? null,
        contact: b.CONTACT ?? null,
        iso3166: b.ISO3166 ?? null,
        upi: b.UPI ?? null,
        rtgs: b.RTGS ?? null,
        neft: b.NEFT ?? null,
        imps: b.IMPS ?? null,
        note: 'Resolves the IFSC code to branch details only — does not verify a bank account.',
      };
    }
    default:
      throw new Error(`Unknown tool: ${name}`);
  }
}

export default { tools, callTool } satisfies McpToolExport;
