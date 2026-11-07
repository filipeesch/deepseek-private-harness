# Spec Delta

## Purpose

Defines which visible texts in the desktop application carry the product brand name and which keep the installed application's own identity, so the product name and the operating system's view of the application stay consistent.

## ADDED Requirements

### Requirement: Desktop brand texts use the private product name

The desktop application SHALL present "DSH Private" in its brand-bearing texts: the About panel product name, the welcome screen title and brand, the update title, and the startup-failure message.

#### Scenario: Welcome screen

- **WHEN** the desktop application shows its welcome screen
- **THEN** the brand text reads "DSH Private"

#### Scenario: About panel

- **WHEN** the user opens the About panel
- **THEN** the product name reads "DSH Private"

#### Scenario: Update surface

- **WHEN** the update surface renders its title
- **THEN** the title reads "DSH Private Update"

#### Scenario: Startup failure

- **WHEN** the desktop application cannot start its interface
- **THEN** the failure message names "DSH Private"

### Requirement: Application-identity strings keep the installed application name

Desktop menu items that name the application SHALL keep "DeepSeek Harness" while the installed application keeps that name.

#### Scenario: Application menu names the installed application

- **WHEN** the user opens the application menu
- **THEN** the About item, the hide item, the quit item, the quit confirmation, and the open item name "DeepSeek Harness"

#### Scenario: Brand texts and identity strings differ deliberately

- **WHEN** a locale renders both kinds of text
- **THEN** brand texts read "DSH Private" and application-identity strings read "DeepSeek Harness"

### Requirement: The brand name is not translated in desktop copy

Every shipped desktop locale SHALL use "DSH Private" for the brand texts rather than a translated form.

#### Scenario: Non-English desktop locale

- **WHEN** any shipped non-English desktop locale is active
- **THEN** the brand texts still read "DSH Private"

### Requirement: Application packaging identity is unchanged

The packaged application SHALL keep its existing product name, application identifier, user data location, and update feed through this change.

#### Scenario: Existing installation upgrades

- **WHEN** an existing installation upgrades to a build containing this change
- **THEN** the application keeps its installed identity, its user data, and its update channel
