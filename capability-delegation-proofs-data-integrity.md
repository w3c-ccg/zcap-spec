# Capability Delegation Proofs with Data Integrity

This appendix defines the
<dfn>Data Integrity capability delegation proof mechanism</dfn>: a
[proof mechanism](index.html#dfn-proof-mechanism) that expresses a
[capability delegation proof](index.html#dfn-capability-delegation-proof) as a
`DataIntegrityProof` [[VC-DATA-INTEGRITY-1.1]].

It is the mechanism every example in this document uses. Conformance to this
document does not require it. It is specified here, rather than in
[Delegated Capability](index.html#delegated-capability), so that the
requirements this document states about delegation stay independent of how a
delegation is secured.

## Media Types and Proof Purposes

As required of a [proof mechanism](index.html#dfn-proof-mechanism)
specification:

| | |
| --- | --- |
| Media types | `application/json` |
| Proof purposes | `capabilityDelegation` |

A delegated zcap is JSON, so a
[capability delegation proof](index.html#dfn-capability-delegation-proof) on one
is secured by this mechanism.

This mechanism defines no
[capability invocation proof](index.html#dfn-capability-invocation-proof).
Expressing one as a `DataIntegrityProof` is described in
[Invocation JSON `proof`](index.html#invocation-json-proof); binding that
description to this mechanism is left to the backlog items
[Specify algorithms for invocation JSON proof](index.html#specify-algorithms-for-invocation-json-proof)
and
[Specify algorithms for invocation HTTP proof](index.html#specify-algorithms-for-invocation-http-proof).

## Proof Format

A [capability delegation proof](index.html#dfn-capability-delegation-proof)
secured by this mechanism is an object with the following properties.

| Property | Value |
| --- | --- |
| `type` | `DataIntegrityProof` |
| `cryptosuite` | The identifier of the cryptosuite used, as defined by [[VC-DATA-INTEGRITY-1.1]]. |
| `proofPurpose` | `capabilityDelegation` |
| `verificationMethod` | The identifier of the verification method whose secret material produced the proof. |
| `capabilityChain` | The [capability ancestors array](index.html#dfn-capability-ancestors-array) of the delegated zcap, as required by [Delegated Capability](index.html#delegated-capability). |
| `proofValue` | The output of the cryptosuite, as defined by [[VC-DATA-INTEGRITY-1.1]]. |

The delegated zcap's `@context` SHOULD define the terms above that the zcap v1
context does not, and SHOULD NOT include the Data Integrity context
`https://w3id.org/security/data-integrity/v2` in order to obtain them.
[Delegated Capability](index.html#delegated-capability) gives definitions that
are sufficient, and says why they are preferred to the context URL.

## Adding a Proof

A proof is added by the
[Add Proof](https://www.w3.org/TR/vc-data-integrity-1.1/#add-proof) algorithm of
[[VC-DATA-INTEGRITY-1.1]], with the delegated zcap as the unsecured data
document and with proof options carrying the properties above other than
`proofValue`.

The verification method supplied in the options MUST be one that a `controller`
of the delegated zcap's `parentCapability` authorizes for the
`capabilityDelegation` proof purpose, as required by
[Creating a Capability Delegation Proof](index.html#creating-a-capability-delegation-proof).

## Verifying a Proof

A proof is verified by the
[Verify Proof](https://www.w3.org/TR/vc-data-integrity-1.1/#verify-proof)
algorithm of [[VC-DATA-INTEGRITY-1.1]], with an expected proof purpose of
`capabilityDelegation`.

Verifying that algorithm's output is not by itself sufficient to accept a
delegated zcap. A verifier must also establish that the delegation does not
broaden the authority of its ancestors, and that no member of the ancestry has
been revoked. Those requirements are stated in
[Delegated Capability](index.html#delegated-capability); the algorithm that
applies them in order is not yet specified, and is the subject of
[Specify algorithms for delegation proof](index.html#specify-algorithms-for-delegation-proof).

## How the Guarantees Are Established

| Guarantee | How this mechanism establishes it |
| --- | --- |
| Integrity | The cryptosuite covers the delegated zcap and the proof options, so verification fails if any property of the zcap, or the proof's `proofPurpose` or `capabilityChain`, was modified after the proof was added. |
| Purpose binding | `proofPurpose` is one of the proof options the cryptosuite covers, so a proof created for `capabilityInvocation` cannot be presented as a capability delegation proof. |
| Prover authorization | The proof's `verificationMethod`, which the cryptosuite covers, identifies the key that produced it. A verifier checks it against the `controller` of the parent capability, which the `capabilityChain` discloses. |
| Local verifiability | The `capabilityChain` embeds the parent delegated zcap in full and names every other ancestor except the root by ID, so a verifier needs no capability it was not given other than the root zcap. |

This mechanism therefore establishes prover authorization by disclosing the
delegated zcap's ancestry to the verifier. A mechanism that establishes it
without disclosing the ancestry would satisfy the same requirements; nothing in
[Delegated Capability](index.html#delegated-capability) or
[Proof Mechanism](index.html#proof-mechanism) names `capabilityChain`.
