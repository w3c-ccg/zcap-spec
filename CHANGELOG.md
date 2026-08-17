# zcap-spec Change Log

## v0.4.0-draft

Non-normative (but normative adjacent)
* Clarify that a delegation `proof` requires a `capabilityChain`.
  refer to the value of `capabilityChain` as "capability ancestors array" instead of "capability delegation chain", to avoid ambiguity with the other way the spec uses "capability chain" referring to something else
  * This is considered a reasonably non-normative change, because it seems consistent with what prior zcap-spec versions intended based on examples 1 & 7.

Non-normative
* Fix examples of delegations `@context` to start with the required value `https://w3id.org/zcap/v1`.
  Previously, some values started with URLs to other contexts like `example.org`.
* Fix example 6 root capability `@context` value to be a string, as required. Previously it was an array.               
* add `capabilityChain` to delegation proofs in examples 3 & 4
