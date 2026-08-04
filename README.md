# mcp-ifsc-in

ifsc-in MCP — Indian bank branch IFSC code lookup via Razorpay's open

Part of [Pipeworx](https://pipeworx.io) — an MCP gateway connecting AI agents to 1394+ live data sources.

## Tools

| Tool | Description |
|------|-------------|
| `ifsc_lookup` | Indian bank branch lookup by IFSC code. Resolves an 11-character IFSC code (printed on Indian cheques and bank statements) to the bank name, branch, address, city, district, state, MICR code, SWIFT code, and contact number, plus whether the branch supports the NEFT, RTGS, UPI, and IMPS payment rails. India banking / fund-transfer routing data via the open Razorpay IFSC dataset (keyless). Also returns an offline format_valid check of the code structure. NOTE: this validates and resolves the IFSC code itself — it does NOT verify a bank account or account holder. Examples: ifsc_lookup({ ifsc: "HDFC0CAGSBK" }), ifsc_lookup({ ifsc: "sbin0000691" }) (case and spaces are forgiven). |

## Quick Start

Add to your MCP client (Claude Desktop, Cursor, Windsurf, etc.):

```json
{
  "mcpServers": {
    "ifsc-in": {
      "url": "https://gateway.pipeworx.io/ifsc-in/mcp"
    }
  }
}
```

Or connect to the full Pipeworx gateway for access to all 1394+ data sources:

```json
{
  "mcpServers": {
    "pipeworx": {
      "url": "https://gateway.pipeworx.io/mcp"
    }
  }
}
```

## Using with ask_pipeworx

Instead of calling tools directly, you can ask questions in plain English:

```
ask_pipeworx({ question: "your question about Ifsc In data" })
```

The gateway picks the right tool and fills the arguments automatically.

## More

- [Docs and guides](https://pipeworx.io/docs)
- [pipeworx.io](https://pipeworx.io)

## License

MIT
