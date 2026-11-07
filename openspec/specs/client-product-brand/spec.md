# client-product-brand Specification

## Purpose

Defines the product name, version badge, and document title the web client presents, including which build profiles receive the private brand and which keep the upstream one.

## Requirements

### Requirement: Private builds present the private product name in the sidebar

The web client SHALL render the product name "DSH Private" in the sidebar brand row when the client build is not an official build.

#### Scenario: Local build shows the private name

- **WHEN** a non-official client build loads the sidebar
- **THEN** the expanded brand row shows "DSH Private" beside the brand mark

#### Scenario: Official build keeps the upstream brand

- **WHEN** an official client build loads the sidebar
- **THEN** the brand row shows the official wordmark instead of "DSH Private"

### Requirement: The sidebar brand mark remains the upstream whale

The web client SHALL keep presenting the existing whale mark as the sidebar brand mark, in both the expanded brand row and the collapsed rail.

#### Scenario: Mark renders in both sidebar states

- **WHEN** the sidebar is expanded and when it is collapsed
- **THEN** the whale mark renders at its existing size and position

#### Scenario: Name change does not replace the mark

- **WHEN** a non-official client build renders the private product name
- **THEN** the brand mark is still the whale and no substitute artwork appears

### Requirement: The build version is legible below the product name

The sidebar brand row SHALL show the build version stacked below the product name, with the name and the version rendered at the same 11px size, and the version SHALL remain readable within the 24px brand row.

#### Scenario: Version metadata present

- **WHEN** the client build embeds a version
- **THEN** the sidebar shows `version[-commit][-dirty]` below the product name at 11px

#### Scenario: Version metadata absent

- **WHEN** the client build embeds no version
- **THEN** the sidebar shows the product name alone, with no version badge

### Requirement: Copying the build version from the brand row

Activating the version badge SHALL copy the version text to the clipboard and SHALL NOT start a new session.

#### Scenario: Version copied

- **WHEN** the user activates the version badge
- **THEN** the version text is copied and a confirmation is shown, and the client does not open a new session

#### Scenario: Clipboard write refused

- **WHEN** the clipboard write fails
- **THEN** no confirmation is shown and the client state is unchanged

### Requirement: The document title carries the private product name

A non-official client build SHALL use "DSH Private" as its document title, both in the initial document and at runtime.

#### Scenario: Title on the blank home

- **WHEN** a non-official build shows the blank home
- **THEN** the document title reads "DSH Private"

#### Scenario: Title while a session is open

- **WHEN** a non-official build opens a session
- **THEN** the document title reads the session title followed by "DSH Private"

### Requirement: The product name is not translated

The product name SHALL read "DSH Private" in every supported interface language.

#### Scenario: Non-English interface

- **WHEN** the interface language is any supported language other than English
- **THEN** the sidebar and the document title still read "DSH Private"
