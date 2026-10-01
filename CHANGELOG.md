# Change Log

This change log records changes that have been made since earlier versions of this document.

Planned changes are described in [Milestones](index.html#milestones)
Unscheduled possible changes are documented in [Backlog](index.html#backlog) until they are understood enough to schedule into Milestones.

<h2 id="changelog-v0.5.0">v0.5.0</h2>

This release contains normative changes.

* Clarified the `proof` property of a delegated zcap, resolving the backlog
  item [Clarify delegated capability `proof` property](index.html#clarify-delegated-capability-proof-property).
  The item is kept, with each of its questions annotated with how it was
  resolved and what was deliberately left to
  [Specify algorithms for delegation proof](index.html#specify-algorithms-for-delegation-proof).

  [capability delegation proof](index.html#dfn-capability-delegation-proof) is
  now a defined term. It was used normatively in four places and defined in
  none of them: a proof is one if its `proofPurpose` is `capabilityDelegation`
  and it establishes that the delegated zcap was created by a controller of its
  `parentCapability`.

  The requirement that every proof in the `proof` property "express a DI proof"
  is removed. It was stronger than anything a verifier needs and silent about
  the one proof that matters. This document now states no requirement about a
  proof that is not a capability delegation proof, and states that a verifier
  MUST NOT rely on one.

  The `type` of a capability delegation proof is not constrained. A
  `DataIntegrityProof` is stated to satisfy the requirements, and is the type
  every example uses, rather than being the only permitted type. The other
  requirements in [Delegated Capability](index.html#delegated-capability) bind
  whatever the type is, including `capabilityChain`.

  For that type, the delegated zcap's `@context` SHOULD define the terms the
  proof uses, and SHOULD NOT include the Data Integrity context
  `https://w3id.org/security/data-integrity/v2` in order to obtain them.
  [Delegated Capability](index.html#delegated-capability) gives definitions
  that are sufficient: `DataIntegrityProof`, `cryptosuite`, `created`,
  `proofPurpose`, `proofValue` and `verificationMethod`, each as the Data
  Integrity context defines it. The zcap v1 context already defines the rest of
  what a delegation proof uses, including `proof`, `expires` and
  `capabilityChain`.

  The existing requirement on `@context` already asks for the contexts that
  define the terms the delegation proof uses, but the zcap v1 context defines
  none of those six, so it was possible to satisfy the requirement as written
  while leaving them undefined.

  The reason to prefer the definitions to the context URL is not size — the
  object is larger on the wire. It is that what a zcap means should not depend
  on a document this specification neither pins nor publishes. The zcap v1
  context is pinned by its SHA2-256 digest and published alongside this
  document; the Data Integrity context is neither, and defines more proof terms
  than a zcap uses.

  `proofPurpose` needs no nested context, because its `@type` of `@vocab`
  expands its value against the active context, in which the zcap v1 context
  already defines `capabilityDelegation` and `capabilityInvocation` as the same
  IRIs the Data Integrity context's nested context does.

  The example in [Delegated Capability](index.html#delegated-capability) is
  updated to follow this. The figures in
  [Zcap by Example](index.html#zcap-by-example) and
  [Invocation](index.html#invocation) are not, and are noted in the backlog
  item as remaining editorial work.

* Added [Proofs](index.html#proofs) and, within it,
  [Proof Mechanism](index.html#proof-mechanism), placed after
  [Capabilities](index.html#capabilities) and
  [Invocation](index.html#invocation) so that a reader meets delegation and
  invocation before the abstraction over how either is secured.

  [capability proof](index.html#dfn-capability-proof) names what a
  [capability delegation proof](index.html#dfn-capability-delegation-proof) and
  a [capability invocation proof](index.html#dfn-capability-invocation-proof)
  have in common, and
  [proof mechanism](index.html#dfn-proof-mechanism) names the thing that
  produces and verifies one: a specification that defines how a document is
  secured for a proof purpose. A mechanism specification must define an add and
  a verify operation, must state the media types it secures and the proof
  purposes it defines proofs for, and must guarantee integrity, purpose
  binding, prover authorization, and local verifiability.

  Delegation and invocation are secured by the same kind of mechanism; they
  differ in the proof purpose and in what the mechanism must establish for it.
  The document secured need not be a capability, and need not be JSON.

  This lets the requirements this document already states about delegation —
  which properties may be attenuated, and which `controller` must have
  authorized a proof — be stated once rather than per proof format, and lets
  future algorithms be specified against a mechanism selected by media type and
  proof purpose rather than against a proof `type`. It also leaves room for a
  mechanism that establishes prover authorization without disclosing a
  delegated zcap's ancestry to the verifier, which a mechanism built on
  `capabilityChain` cannot do.

* Added [Capability Delegation Proofs with Data Integrity](index.html#capability-delegation-proofs-data-integrity),
  a normative appendix that binds `DataIntegrityProof` to the abstraction above:
  it states the mechanism's media types and proof purposes, the proof format,
  that a proof is added and verified by the Add Proof and Verify Proof
  algorithms of [[VC-DATA-INTEGRITY-1.1]], and how the mechanism establishes
  each guarantee.

  Conformance to this document does not require this mechanism. The appendix
  exists so that the mechanism every example uses is specified rather than
  merely described, while the rest of the document stays written against any
  mechanism providing the same guarantees. It is a separate markdown file
  included with `data-include`, as the [Change Log](index.html#changelog) is.

  It defines no capability invocation proof. Binding the description in
  [Invocation JSON `proof`](index.html#invocation-json-proof) to this
  abstraction is left to the existing backlog items for invocation proofs.

* Added [Creating a Capability Delegation Proof](index.html#creating-a-capability-delegation-proof),
  which states who may create one and what it must cover.

  Nothing previously said that a capability delegation proof must cover the
  properties a verifier reads from the delegated zcap. Without that, the
  attenuation requirements stated elsewhere in
  [Delegated Capability](index.html#delegated-capability) are forgeable: a proof
  could be valid over a document whose `expires` or `allowedAction` had been
  changed after it was added.

  The requirements a delegator must satisfy previously appeared only as
  requirements upon a verifier. This gives them a counterpart a delegator can
  follow, without specifying an algorithm.

* Added [Delegate](index.html#delegate), the first algorithm this document
  specifies. It applies the requirements already stated in
  [Delegated Capability](index.html#delegated-capability) and
  [Creating a Capability Delegation Proof](index.html#creating-a-capability-delegation-proof)
  in an order in which they can be applied, and secures the result by adding a
  proof with a [proof mechanism](index.html#dfn-proof-mechanism) rather than by
  naming a proof format.

  `capability ancestry` is defined, and `fail` states once how an algorithm
  fails, so each step names an error rather than spelling out what to return.
  `Delegate` can fail with `CHAIN_LENGTH_EXCEEDED`, `INVALID_ALLOWED_ACTION`,
  `INVALID_DELEGATOR`, `INVALID_EXPIRES`, `INVALID_INVOCATION_TARGET` or
  `INVALID_ROOT_CAPABILITY`. Each is specified by the step that raises it.

  `Delegate` accepts a root zcap's `id` in place of a root zcap expressed in
  full. A root zcap is never expressed in a delegated zcap or in its proof —
  only its `id` is — so requiring a delegator to supply one was asking for a
  document that exists nowhere in the protocol. The `INVALID_DELEGATOR` check
  is not performed in that case, because a root zcap's `controller` is only
  available by dereferencing it on the verifier's system, and a delegator that
  supplied the value would be checking itself.

  Step 4 compares the delegated zcap against its parent alone. That is sound
  for a delegator, because each ancestor was itself checked against its own
  parent when it was delegated. A verifier cannot rely on that and must apply
  the requirements across the whole chain, which is the subject of
  [Specify algorithms for delegation proof](index.html#specify-algorithms-for-delegation-proof).

  In the backlog item
  [Specify algorithms for delegation proof](index.html#specify-algorithms-for-delegation-proof),
  the criterion asking for an algorithm that adds a `capabilityDelegation`
  proof is annotated as resolved by `Delegate`, whose final step adds that
  proof and whose earlier steps are the checks that must pass for it to be
  worth adding. The criterion asking for a verification algorithm is not
  resolved.

  Two diagrams accompany it, rendered from mermaid sources by the
  [respec-mermaid](https://github.com/w3c/respec-mermaid) plugin: a flow chart
  of the course the steps take and the error each failing check raises, and a
  class diagram of the algorithm's signature and the things it relates. This is
  the document's first use of that plugin.

* Added `proof mechanism`, `capability delegation proof` and
  `capability invocation proof` to
  [Terminology](index.html#terminology), each with the sections that state what
  it must be, how it is created, and what it must establish. All three terms
  were used throughout the document without appearing there.

* Every entry in [Terminology](index.html#terminology) can now be linked to.
  Each term carries an `id` of the form `term-{term}`, so
  [#term-caveat](index.html#term-caveat) addresses that entry, and the six
  entries that this document did not already define elsewhere — `capability`,
  `target`, `capability chain`, `caveat`, `invocation` and `action` — plus
  `parentCapability` and `capabilityDelegation` are now definitions, so they
  can be cross-referenced from prose as well.

  `proof mechanism`, `capability delegation proof` and
  `capability invocation proof` are not defined in Terminology, because each is
  defined where the requirements that constrain it are stated; their
  Terminology entries describe them and link there. A second definition of the
  same term would be an error rather than a second place to link to.

  Each new definition is referenced from prose, so that adding them does not
  leave the document with definitions nothing points at.

* Added [Algorithms](index.html#algorithms), an index. It names each algorithm
  this document defines, with its signature and a one-sentence description, and
  links to the section that defines it. Each algorithm is defined alongside the
  data model it operates on rather than collected there, and each error is
  specified by the step that raises it, so there is no unified list of error
  definitions.

* Added a normative reference to
  [Verifiable Credential Data Integrity 1.1](https://www.w3.org/TR/vc-data-integrity-1.1/),
  cited where a `DataIntegrityProof` is mentioned. This is the document's first
  bibliography citation, so it also gains a References section.

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

* Added `expires` to every delegated capability in [Zcap by Example](index.html#zcap-by-example):
  the car's delegation to Alyssa, Alyssa's delegation to Ben, Ben's delegation to Lem,
  and each copy of those delegations embedded in a `capabilityChain` or invocation `proof`.
  Before, these delegated capabilities had no `expires`.
  After, they conform to the requirement that a delegated zcap MUST have an `expires` field.

* Added `invocationTarget` to every delegated capability in [Zcap by Example](index.html#zcap-by-example),
  with the same value as the root capability's invocation target, `https://whatacar.example/a-fancy-car`.
  Before, these delegated capabilities had no `invocationTarget`, so a verifier could not
  ensure that a delegated capability's `invocationTarget` matches that of its parent capability,
  as [Delegated Capability](index.html#delegated-capability) requires.

* Fixed the invocation of the car's delegation to Alyssa in [Zcap by Example](index.html#zcap-by-example)
  (the one that turns on the car) to conform to [Invocation JSON `proof`](index.html#invocation-json-proof).
  Before, the proof omitted `invocationTarget` and `capabilityAction`,
  and `proof.capability` was not the delegated capability being invoked.
  After, the proof includes the required `invocationTarget` and `capabilityAction`,
  and `proof.capability` expresses the full delegated zcap being invoked,
  as required when invoking a delegated capability using a DI proof.

* Fixed the embedded parent capabilities in the `proof.capabilityChain` of Alyssa's delegation to Ben
  and Ben's delegation to Lem in [Zcap by Example](index.html#zcap-by-example).
  Before, the embedded copies differed from the parent capabilities they stood for
  (e.g. in `@context`, `proofValue`, `expires`, and `invocationTarget`).
  After, each embedded capability is identical to its parent capability,
  conforming to the requirement that the parent delegated zcap MUST be fully embedded
  in the capability ancestors array.

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
