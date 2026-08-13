# zcap-spec Change Log

## v0.4.0-draft

* Fix examples of delegations `@context` to start with the required value `https://w3id.org/zcap/v1`.
  Previously, some values started with URLs to other contexts like `example.org`.

* Fix example 6 root capability `@context` value to be a string, as required. Previously it was an array.

* Fix respec warning "Document uses RFC2119 keywords but lacks a conformance section." by adding a minimal conformance section. <https://github.com/w3c-ccg/zcap-spec/pull/59>
