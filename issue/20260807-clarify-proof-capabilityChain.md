# Issue: Clarify `proof.capabilityChain`

Authors
* bengo.is

## Introduction

[example 1][] and [example 7][] are capability delegations that have a `proof.capabilityChain` property,
but this property name isn't described anywhere in the spec.

In thinking through what to do about it, I am left with some questions, and a thought that maybe the spec's examples are inconsistent with its recommendations, and the result is a lack of clarity about how delegations and invocations should be proven.

## Background: Spec Text

* In [Delegation through Capability Chains](https://w3c-ccg.github.io/zcap-spec/#delegation)
  * > A capability document that is not the target MUST also have a parentCapability property which either points at the target or another capability document. A series of capability chained together in this way is called a "capability chain" and is how delegation of capabilities are handled in zcaps.

* In [Delegated Capability](https://w3c-ccg.github.io/zcap-spec/#delegated-capability), right after example 7 
  * > all delegated zcaps in a chain must be fully provided to the verifier when invoking a delegated zcap, so that the verifier is not required to dereference them other than via the provided chain.
  * > However, a verifier MUST NOT be required to perform network requests or database queries to dereference delegated zcaps by ID when verifying the capability chain, prior to inspecting it for potential revocations.
  * > A delegated zcap can only be invoked by submitting the entire zcap. A delegated zcap MUST have a capability delegation proof which MUST contain the delegation chain.
    > 
    > A capability delegation chain MUST be an array that includes the root zcap using its ID (i.e., by reference only, not embedded) and every other delegated zcap in its ancestry must be referenced by ID except for the parent delegated zcap, which MUST be fully embedded. This ensures that delegated zcaps are of minimal size (other delegated zcaps in the chain are never repeated) and that every delegated zcap can be dereferenced directly from the chain without ever having to hit a network resource or similar. The capability delegation chain is ordered; the first entry MUST be the root zcap's ID and any other entries must be in the order of delegation from least recent to most recent.
    * My best guess is this requirement is what the current examples are trying to satisfy with `proof.capabilityChain`
    * The term "capability delegation chain" doesn't appear anywhere else in the spec
    * This spec text about a "capability delegation chain" that MUST be an array is very easily confused with the other text defining a "capability chain":
      > A series of capability chained together in this way [not an array, instead a (partial?) reverse linked list using `parentCapability`] is called a "capability chain" and is how delegation of capabilities are handled in zcaps.

* In [Invocation](https://w3c-ccg.github.io/zcap-spec/#invocation)
  * > the proof must validate against cryptographic material granted authority by the controller field from the capability chain.
  *  > The capability document that is invoked's chain is recursively traversed up along the parentCapability document until the target is found (the root document that has no parentCapability property). The target's capabilityDelegation cryptographic material is marked in the initial set of authority. The capability chain is then traversed from this root target back down through each delegated capability all the way to the invoked capability document leaf, validating while restricting and delegating authority:
    * It's not clear whether the (first) "chain" mentioned here refers to the "capability chain" that results from traversing `parentCapability` points or the "capability delegation chain"

## Challenge: Terms `capability chain` and `capability delegation chain` sound very similar, refer to very different things, are easy to confuse

I'm not sure which term was defined first, but `capabilityChain` i.e. "capability delegation chain" is more critical to the verifier.

It may reduce confusion to remove the informative text that currently also defines "capability chain" to be different than "capability delegation chain".

### Proposal: Use `delegation ancestors array` instead of `capability delegation chain`

A later proposal makes changes to use the term "delegation ancestors array" instead of "capability delegation chain".
The new term was chosen because
* it represent that this array does not have the full chain, only the chain of ancestor capabilities of the delegated capability
* it clarifies the data type is an array, to distinguish it from the other, currently more prevalent in the spec, "capability chain" that is not an array but a linked list.

## Problem: There is not enough detail on how to satisfy `A delegated zcap MUST have a capability delegation proof which MUST contain the delegation chain.` to ensure interoperability

There is a requirement
> A delegated zcap MUST have a capability delegation proof which MUST contain the delegation chain.

Some of the delegation examples include this as `proof.capabilityChain`.

Some of the examples don't, which appears to be an oversight. These problems are addressed later in this document.

The bigger problem is implementors (and example authors) are lacking text that explains how to satisfy this requirement in a way that facilitates interoperable verification with verifiers. There's no text that explains the method of including `proof.capabilityChain` as a way for the delegation proof to "contain the delegation chain".

### Proposal: Adjust the requirement text to require the delegation chain be included as the value of the `capabilityChain` property

Change
> A delegated zcap can only be invoked by submitting the entire zcap. A delegated zcap MUST have a capability delegation proof which MUST contain the delegation chain.
> 
> A capability delegation chain MUST be an array that includes the root zcap using its ID (i.e., by reference only, not embedded) and every other delegated zcap in its ancestry must be referenced by ID except for the parent delegated zcap, which MUST be fully embedded.

To
> A delegated zcap can only be invoked by submitting the entire zcap.
> 
> A delegated zcap MUST have a capability delegation proof.
> A capability delegation proof MUST have a `capabilityChain` property whose value is a delegation ancestors array.
> A delegation ancestors array MUST be an array that includes the root zcap using its ID (i.e., by reference only, not embedded) and every other delegated zcap in its ancestry must be referenced by ID except for the parent delegated zcap, which MUST be fully embedded.

This change clarifies that the capability delegation proof should use a `capabilityChain` property to include the array.


The change also uses "delegation ancestors array" instead of "capability delegation chain" to avoid the current challenge of confusing "capability delegation chain" (array in proof) with "capability chain". The new term was chosen because
* it represent that this array does not have the full chain, only the chain of ancestors capabilities of the proven delegated capability
* it clarifies the data type is an array, to distinguish it from the other, currently more prevalent in the spec, "capability chain" that is not an array but a linked list.

## Problem: Example 1 `parentCapability` aims to be root capability, but uses a URI that implies a delegated capability

[Example 1][] (many properties omitted) is like
```json
{
  "id": "https://whatacar.example/a-fancy-car/proc/7a397d7b",
  // Since this is the first delegated capability, the parentCapability
  // points to the target this capability will operate against
  // (in this case, Alyssa's Car)
  "parentCapability": "https://whatacar.example/a-fancy-car",
  "proof": {
    "capabilityChain": [
      "https://whatacar.example/a-fancy-car"
    ]
  }
}
```

The comment above example 1 `parentCapability` implies that the identified `parentCapability` is meant to be a root capability, and it is identified withan `https:` URL.
The `proof.capabilityChain` includes this same URL as the first item, also hinting that the intention is for the parentCapability to be a root capability zcap.

However, later the [Root Capability](https://w3c-ccg.github.io/zcap-spec/#root-capability) section requires
> A root zcap MUST have an id that is a string that expresses a URN

Because the currently parentCapability URL does not satisfy requirements of a root capability `id`, the delegation's `proof.capabilityChain` does not appear to satisfy the requirement
> The capability delegation chain is ordered; the first entry MUST be the root zcap's ID and any other entries must be in the order of delegation from least recent to most recent.

But if we decide that the intended `parentCapability` is a root zcap URI (not the URL of the invocationTarget itself), and we change to identifying it by a URN, then we can resolve the challenge.

#### Proposal: Change Example 1 to identify parentCapability/root using a URN

Status:
* This proposal has agreement from bengo and dzagidulin
* A version of this change has been made in the text

These changes will ensure Example 1 has an unambiguous parentCapability which is identified using a URN as required and a `urn:zcap:root:` URN as recommended.

* [ ] Change [Example 1][] (many properties omitted) to use these property values:
  ```json
  {
    "id": "https://whatacar.example/a-fancy-car/proc/7a397d7b",
    // URN of Root Capability of <https://whatacar.example/a-fancy-car>
    "parentCapability": "urn:zcap:root:https%3A%2F%2Fwhatacar.example%2Fa-fancy-car",
    "proof": {
      "capabilityChain": [
        "urn:zcap:root:https%3A%2F%2Fwhatacar.example%2Fa-fancy-car"
      ]
    }
  }
  ```

## Problem: Delegation examples don't clarify how to satisfy "A delegated zcap MUST have a capability delegation proof which MUST contain the delegation chain." when parentCapability is a delegated capability

Currently, there is no example of a delegated zcap's capability chain when the chain is longer than 2. An example would help reduce ambiguity of the normative text. Ideally the normative text is unambiguous *and* tricky-but-common cases like capability chains of length 3+ are demonstrated by example.

This is satisfied by the other proposals to add `proof.capabilityChain` to Examples 3 and 4.

If we don't update those examples to demonstrate this case, e.g. because it makes those early examples too large, then we should ensure there is an example in an appendix, or address this problem some other way.

## Problem: Example 3 does not satisfy requirement "A delegated zcap MUST have a capability delegation proof which MUST contain the delegation chain."

[Example 3][] is a capability delegation whose `parentCapability` is `"https://whatacar.example/a-fancy-car/proc/7a397d7b"`, which is the identifier of the capability delegation from [Example 1][].

The `proof` value for the capability delegation from [Example 3][] does *not* contain a `capabilityChain` property, so it does not appear to satisfy the requirement
> A delegated zcap MUST have a capability delegation proof which MUST contain the delegation chain.

This appears to be an oversight. If so, we can add the required `capabilityChain`.

### Proposal: Add `proof.capabilityChain` to Example 3

The full new Example 3 would be as follows, which has the following changes from the original example 3:
* `proof.capabilityChain` inserted whose value is a capability delegation ancestors array.
The first entry in the array is the URN of the root zcap, `"urn:zcap:root:https%3A%2F%2Fwhatacar.example%2Fa-fancy-car"`. The second entry in the array is the full capability delegation object corresponding to the proven delegation's `parentCapability` (identified as `"https://whatacar.example/a-fancy-car/proc/7a397d7b"`).

```json
{"@context": ["https://w3id.org/zcap/v1",
              "https://autopower.example/"],
 "id": "https://social.example/alyssa/caps#79795d78",

 // Pointing up the chain at the capability from which Alyssa was
 // initially gained authority
 "parentCapability": "https://whatacar.example/a-fancy-car/proc/7a397d7b",

 // Alyssa grants authority specifically to one of Ben's
 // cryptographic keys
 "controller": "https://chatty.example/ben/#key-33",

 // Alyssa adds a caveat: Ben can drive her car, unless she flips
 // the bit at this url
 "caveat": [
   {"type": "ValidWhileTrue",
    "uri": "https://social.example/alyssa/ben-can-still-drive"}],

 // Finally Alyssa signs this object with the key she was granted
 // authority with
 "proof": {
    "type": "RsaSignature2016",
    "proofPurpose": "capabilityDelegation",
    "created": "2017-03-28T06:01:25Z",
    "creator": "https://social.example/alyssa/#key-for-car",
    "signatureValue": "...",
    "capabilityChain": [
      "urn:zcap:root:https%3A%2F%2Fwhatacar.example%2Fa-fancy-car",
      {
        "@context": ["https://w3id.org/zcap/v1",
                    "https://autopower.example/"],

        "id": "https://whatacar.example/a-fancy-car/proc/7a397d7b",

        // Since this is the first delegated capability, the parentCapability
        // points to the target this capability will operate against
        // (in this case, Alyssa's Car)
        "parentCapability": "https://whatacar.example/a-fancy-car",

        // We are granting authority specifically to one of Alyssa's
        // cryptographic keys (not to be confused with the car
        // key metaphor!)
        "controller": "https://social.example/alyssa#key-for-car",

        // Finally we sign this object with cryptographic material from
        // Alyssa's Car's capabilityDelegation field, and using the
        // capabilityDelegation proofPurpose.
        "proof": {
          "type": "Ed25519Signature2018",
          "created": "2018-02-13T21:26:08Z",
          "capabilityChain": [
            "https://whatacar.example/a-fancy-car"
          ],
          "jws": "eyJhbGciOiJFZERTQSIsImI2NCI6ZmFsc2UsImNyaXQiOlsiYjY0Il19..lfAFjrWE-4RxhL0gtzSMRX72NR9SRDgaMmkjPA4if0ERbw4R2bnts5sAs8OyhAlbFzBAKOqrFk57AYqwSR2vCw",
          "proofPurpose": "capabilityDelegation",
          "verificationMethod": "https://example.com/i/alice/keys/1"
        }
      }
    ]
  }
}
```

## Problem: Example 4 does not satisfy requirement "A delegated zcap MUST have a capability delegation proof which MUST contain the delegation chain."

The `proof` value for the capability delegation from [Example 4][] does *not* contain a `capabilityChain` property, so it does not appear to satisfy the requirement
> A delegated zcap MUST have a capability delegation proof which MUST contain the delegation chain.

### Proposal: Add `proof.capabilityChain` to Example 4

Make the following changes to Example 4
* add `proof.capabilityChain` array
  * the first entry is the URN of the root zcap
  * the second entry is the identifier of the delegation of the root zcap, which is `https://whatacar.example/a-fancy-car/proc/7a397d7b`
  * the third entry is the full expression of the delegation of the capability identified by the second entry. This is also the referent of the outer delegation's `parentCapability` value `"https://social.example/alyssa/caps#79795d78"`.

This makes the example much longer, because the `capabilityChain` includes a full expression of the parent capability delegation `https://social.example/alyssa/caps#79795d78`, which itself has a `proof.capabilityChain` that includes a full expression of `https://whatacar.example/a-fancy-car/proc/7a397d7b`, which itself has a `proof.capabilityChain`. This seems to be the unavoidable if we hope the examples to be a complete demonstration of the normative requirements.

The resulting Example 4 would be
```json
{"@context": ["https://w3id.org/zcap/v1",
              "https://autopower.example/"],
 "id": "https://chatty.example/ben/caps#2cdea8c1",
 "parentCapability": "https://social.example/alyssa/caps#79795d78",
 "controller": "https://lem.example/#key-bf36",

 // Ben adds this caveat: this capability can be used to drive the
 // car, but not for more than 5 kilometers
 "caveat": [
   {"type": "DriveNoMoreThan",
    // Alyssa's gauge currently says 123854 kilometers driven,
    // so this is only 5 km more than the current value
    "kilometers": 123859}],

 // Finally Ben signs this object with the key he was granted
 // authority with
 "proof": {
    "type": "RsaSignature2016",
    "proofPurpose": "capabilityDelegation",
    "created": "2017-06-13T19:15:03Z",
    "creator": "https://chatty.example/ben/#key-33",
    "signatureValue": "...",
    "capabilityChain": [
      "urn:zcap:root:https%3A%2F%2Fwhatacar.example%2Fa-fancy-car",
      "https://whatacar.example/a-fancy-car/proc/7a397d7b",
      {"@context": ["https://w3id.org/zcap/v1",
                    "https://autopower.example/"],
      "id": "https://social.example/alyssa/caps#79795d78",

      // Pointing up the chain at the capability from which Alyssa was
      // initially gained authority
      "parentCapability": "https://whatacar.example/a-fancy-car/proc/7a397d7b",

      // Alyssa grants authority specifically to one of Ben's
      // cryptographic keys
      "controller": "https://chatty.example/ben/#key-33",

      // Alyssa adds a caveat: Ben can drive her car, unless she flips
      // the bit at this url
      "caveat": [
        {"type": "ValidWhileTrue",
          "uri": "https://social.example/alyssa/ben-can-still-drive"}],

      // Finally Alyssa signs this object with the key she was granted
      // authority with
      "proof": {
          "type": "RsaSignature2016",
          "proofPurpose": "capabilityDelegation",
          "created": "2017-03-28T06:01:25Z",
          "creator": "https://social.example/alyssa/#key-for-car",
          "signatureValue": "...",
          "capabilityChain": [
            "urn:zcap:root:https%3A%2F%2Fwhatacar.example%2Fa-fancy-car",
            {
              "@context": ["https://w3id.org/zcap/v1",
                          "https://autopower.example/"],

              "id": "https://whatacar.example/a-fancy-car/proc/7a397d7b",

              // Since this is the first delegated capability, the parentCapability
              // points to the target this capability will operate against
              // (in this case, Alyssa's Car)
              "parentCapability": "urn:zcap:root:https%3A%2F%2Fwhatacar.example%2Fa-fancy-car",

              // We are granting authority specifically to one of Alyssa's
              // cryptographic keys (not to be confused with the car
              // key metaphor!)
              "controller": "https://social.example/alyssa#key-for-car",

              // Finally we sign this object with cryptographic material from
              // Alyssa's Car's capabilityDelegation field, and using the
              // capabilityDelegation proofPurpose.
              "proof": {
                "type": "Ed25519Signature2018",
                "created": "2018-02-13T21:26:08Z",
                "capabilityChain": [
                  "urn:zcap:root:https%3A%2F%2Fwhatacar.example%2Fa-fancy-car"
                ],
                "jws": "eyJhbGciOiJFZERTQSIsImI2NCI6ZmFsc2UsImNyaXQiOlsiYjY0Il19..lfAFjrWE-4RxhL0gtzSMRX72NR9SRDgaMmkjPA4if0ERbw4R2bnts5sAs8OyhAlbFzBAKOqrFk57AYqwSR2vCw",
                "proofPurpose": "capabilityDelegation",
                "verificationMethod": "https://example.com/i/alice/keys/1"
              }
            }
          ]
        }
      }
    ]
  }
}
```

## Problem: Requirements of "capability delegation chain" array lead to large delegation examples that are hard to read

After updating Examples 3 and 4 to satisfy the requirements of capability delegation proofs by including a proof `capabilityChain`, the examples are no longer very easy to read.

Should the examples omit the full expression of the parent capability in the last entry of `capabilityChain`? That would make the examples smaller, but it might hinder implementors who would then lack a clear full example. A full example could be included in an appendix.

The current syntax for the `capabilityChain` also seems like it leads to some verbosity in long chains. Specifically, because delegation includes the id of every ancestor delegation, adding the Nth delegation requires a proof with a `capabilityChain` of length N-1, so the number of ancestor ids in a delegation chain of length n is O(n**2).
* We can't just drop `proof.capabilityChain` unless we're ok with a verifier no longer having ability to know chain length in O(1). But if that's the only reason it's here, the verbosity could be cut down by keeping only a `chainLength` integer and not repeating all the capability ids.
* There may be other optimizations possible, but they all depend on things like whether the proof `capabilityChain` is required to verify the `proofValue`

## Question: Should the requirement of "capability delegation chain" array in proof be determined by the Proof Type / cryptosuite instead of the zcap spec?

There may be ways of proving and verifying delegation that do not require sharing the entire capability delegation chain. Is it really appropriate to have zcap-spec add requirements for all proof mechanisms? Or should the requirements of what is in a proof be specific to certain proof types?

It seems like it should be up to proof mechanisms to decide the output of their proof?

[example 1]: https://w3c-ccg.github.io/zcap-spec/#example-1
[example 3]: https://w3c-ccg.github.io/zcap-spec/#example-3
[example 4]: https://w3c-ccg.github.io/zcap-spec/#example-4
[example 7]: https://w3c-ccg.github.io/zcap-spec/#example-7