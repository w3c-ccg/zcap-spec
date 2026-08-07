# Issue: Example 2 capabilityInvocation proof does not express the full invoked capability

Example 2 is like
```json
{"@context": ["https://w3id.org/zcap/v1",
              "https://autopower.example/"],
 "id": "urn:uuid:ad86cb2c-e9db-434a-beae-71b82120a8a4",
 "action": "Drive",
 "proof": {
    "type": "RsaSignature2016",
    // A linked data document can be an invocation if it has a
    // proofPurpose of capabilityInvocation and links to the capability
    // chain it is invoking
    "proofPurpose": "capabilityInvocation",
    "capability": "https://whatacar.example/a-fancy-car/proc/7a397d7b",
    "created": "2016-02-08T17:13:48Z",
    "creator": "https://social.example/alyssa/#key-for-car",
    "signatureValue": "..."}}
```

The `proof.capability` value is a string HTTPS URL `https://whatacar.example/a-fancy-car/proc/7a397d7b`, which seems to represent invoking the delegated capability from example 1.

However, later the spec requires
> When invoking a delegated capability using a DI proof, the capability property must express the full delegated zcap.

Example 2 appears not to satisfy this requirement, because the invocation proof's capability property identifies the delegated zcap it is invoking, but does not "express the full delegated zcap".

## Proposal: Example 2 `proof.capability` should be full capability

Change Example 2's to have a new `proof.capability` value identical to Example 1 (which is invoked by Example 2), so the new Example 2 matches:
```json
{"@context": ["https://w3id.org/zcap/v1",
              "https://autopower.example/"],
 "id": "urn:uuid:ad86cb2c-e9db-434a-beae-71b82120a8a4",
 "action": "Drive",
 "proof": {
    "type": "RsaSignature2016",
    "proofPurpose": "capabilityInvocation",
    "capability": {
        "@context": ["https://w3id.org/zcap/v1",
                    "https://autopower.example/"],
        "id": "https://whatacar.example/a-fancy-car/proc/7a397d7b",
        "parentCapability": "https://whatacar.example/a-fancy-car",
        "controller": "https://social.example/alyssa#key-for-car",
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
    },
    "created": "2016-02-08T17:13:48Z",
    "creator": "https://social.example/alyssa/#key-for-car",
    "signatureValue": "..."}}
```

By changing the invocation DI proof's `capability` property to be the full expression of the invoked delegated capability, this now satisfies the requirement
> When invoking a delegated capability using a DI proof, the capability property must express the full delegated zcap.
