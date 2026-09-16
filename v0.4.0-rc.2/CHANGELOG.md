# Change Log

This change log records changes that have been made since earlier versions of this document.

Planned changes are described in [Milestones](index.html#milestones)
Unscheduled possible changes are documented in [Backlog](index.html#backlog) until they are understood enough to schedule into Milestones.

<h2 id="changelog-v0.4.0">v0.4.0</h2>

The goals of this release are
to ship some low cost high impact readability improvements,
ensure examples conform to specified behaviors,
move quickly and safely by prioritizing only non-normative changes,
and to begin planning more substantial normative changes in the
[backlog](index.html#backlog) for v0.5.0 and beyond.

All changes in this release are non-normative.

Readability

* Removed all usage of inline "TODO" and "[comment...]" text that rendered for readers.
  Some were converted to HTML comments so the text does not render for readers.
  Some TODO comments were copied to the appendix describing a backlog of future work.
  The resulting zcap-spec is more readable because the text now focuses on explaining
  zcap's normative behavior as defined today,
  deferring for the reader any discussion of planning how the spec may change tomorrow,
  so new readers can understand the basics quickly.
  Instead, discussion of future work is moved from parentheticals to a
  [section](index.html#backlog) where the future work can be prioritized into a plan.

* Added [Invocation JSON](index.html#invocation-json) and
  [Invocation HTTP Request](index.html#invocation-http-request).
  This establishes clearly-named sections in the Table of Contents offering readers a
  reference description of how an invocation may be represented as JSON and as an HTTP request.

* Moved
  [Root Capability](index.html#root-capability),
  [Delegated Capability](index.html#delegated-capability),
  and [Capabilities vs. Access Control Lists](index.html#capabilities-vs-ACLs)
  from [Introduction](index.html#introduction) to [Capabilities](index.html#capabilities).
  This keeps the Introduction focused on introductory material
  and centralizes normative details in a more specific section.

* Fixed respec warning "Document uses RFC2119 keywords but lacks a conformance section."
  by adding a minimal conformance section.
  * Pull Request: <https://github.com/w3c-ccg/zcap-spec/pull/59>

Clarifications

* Clarified that a delegation `proof` requires a `capabilityChain`,
  and refer to the value of `capabilityChain` as "capability ancestors array" instead of
  "capability delegation chain", to avoid ambiguity with the other way the spec uses
  "capability chain" referring to something else.
  * This is considered a reasonably non-normative change, because it seems consistent with
    what prior zcap-spec versions intended based on examples 1 & 7.
  * See [decision record](decision/20260807-clarify-proof-capabilityChain.md) for more.

Examples

* Added [Example Invocation HTTP Requests](index.html#invocation-http-example) and
  [Example Invocation JSON](index.html#invocation-json-example).
  Previously, there were no examples of how an invocation is expressed as an HTTP request.
  The new example illustrates the general form of the invocation request much more quickly
  and clearly than the previous text-only description.

* Replaced all usage of RsaSignature2016 in examples with
  [DataIntegrityProof](https://www.w3.org/TR/vc-data-integrity/#dataintegrityproof),
  which uses the property named `proofValue` (instead of the formerly used `signatureValue`)
  for the output of the algorithm used by the verification method.
  This makes the examples a better reflection of the kind of proofs described by the rest of the spec.

* Fixed examples of delegations `@context` to start with the required value `https://w3id.org/zcap/v1`.
  Previously, some values started with URLs to other contexts like `example.org`.

* Added `capabilityChain` to delegation proofs in examples 3 & 4.

* Fixed example 1 `parentCapability` and `proof.capabilityChain` to identify the parent root
  capability by a URN.
  Before, the example text identified the parent capability using an HTTPS URL.
  After, example 1 conforms to the requirement that delegations identify root capabilities using a URN.
  * Pull Request: <https://github.com/w3c-ccg/zcap-spec/pull/66>

* Fixed [Example Invocation JSON](index.html#invocation-json-example) (example 10) invocation `proof`
  to conform to [Invocation JSON `proof`](index.html#invocation-json-proof).
  Before, `proof.capability` was an HTTPS URL string identifying a delegated capability,
  and the proof omitted `invocationTarget` and `capabilityAction`.
  After, `proof.capability` expresses the full delegated zcap, as required when invoking a
  delegated capability using a DI proof,
  and the proof includes the required `invocationTarget` and `capabilityAction`.

* Renamed the verification method used by example 1's capability delegation proof
  from `https://example.com/i/alice/keys/1` to `https://example.com/i/alyssa/keys/1`.
  The key belongs to Alyssa, so it did not make sense for its URL to name Alice.

* Added an example of the document that the target `https://whatacar.example/a-fancy-car`
  dereferences to, including its `capabilityDelegation` property value.
  Before, example 1's delegation proof was created with a verification method that the document
  never showed to be authorized by the car.
  After, the reader can follow the initial source of authority from the target's
  `capabilityDelegation` property to the key that signs the first delegation.

* Fixed example 6 root capability `@context` value to be a string, as required.
  Previously it was an array.
  * Pull Request: <https://github.com/w3c-ccg/zcap-spec/pull/60>

Other

* Added `contexts/zcap-v1.jsonld`, a representation of the JSON-LD Context that the zcap-spec
  assumes is resolvable at <https://w3id.org/zcap/v1>,
  the location required in zcap JSON-LD `@context` property values.

* Added [The zcap v1 JSON-LD Context](index.html#zcap-v1-context),
  which publishes the hexadecimal encoded SHA2-256 digest value of the context file served at
  <https://w3id.org/zcap/v1>, namely
  `4c0bd364bf3a5215779c0b636e14bcdf1d6818dae002bc7580237bcf8d2a72e0`,
  along with a command a reader can run to confirm it.
  Before, no digest was published, so a reader had no way to tell whether a context file they
  retrieved was the one this document assumes.
  * Issue: <https://github.com/w3c-ccg/zcap-spec/issues/101>
