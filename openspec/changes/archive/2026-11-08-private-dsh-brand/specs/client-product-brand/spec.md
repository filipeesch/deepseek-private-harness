# Spec Delta

## MODIFIED Requirements

### Requirement: Private builds present the private product name in the sidebar

The web client SHALL render the product name "Private DSH" in the sidebar brand row when the client build is not an official build.

#### Scenario: Local build shows the private name

- **WHEN** a non-official client build loads the sidebar
- **THEN** the expanded brand row shows "Private DSH" beside the brand mark

#### Scenario: Official build keeps the upstream brand

- **WHEN** an official client build loads the sidebar
- **THEN** the brand row shows the official wordmark instead of "Private DSH"

### Requirement: The document title carries the private product name

A non-official client build SHALL use "Private DSH" as its document title, both in the initial document and at runtime.

#### Scenario: Title on the blank home

- **WHEN** a non-official build shows the blank home
- **THEN** the document title reads "Private DSH"

#### Scenario: Title while a session is open

- **WHEN** a non-official build opens a session
- **THEN** the document title reads the session title followed by "Private DSH"

### Requirement: The product name is not translated

The product name SHALL read "Private DSH" in every supported interface language.

#### Scenario: Non-English interface

- **WHEN** the interface language is any supported language other than English
- **THEN** the sidebar and the document title still read "Private DSH"

## REMOVED Requirements

### Requirement: The sidebar brand mark remains the upstream whale

**Reason**: This distribution now owns the sidebar brand mark; the mark's behavior is specified by the `product-brand-mark` capability.

**Migration**: None for consumers. The mark remains a root-scoped single seat that any plugin can occupy, and an unoccupied seat still renders the shell fallback.
