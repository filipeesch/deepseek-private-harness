# Spec Delta

## MODIFIED Requirements

### Requirement: Desktop brand texts use the private product name

The desktop application SHALL present "Private DSH" in its brand-bearing texts: the About panel product name, the welcome screen title and brand, the update title, and the startup-failure message.

#### Scenario: Welcome screen

- **WHEN** the desktop application shows its welcome screen
- **THEN** the brand text reads "Private DSH"

#### Scenario: About panel

- **WHEN** the user opens the About panel
- **THEN** the product name reads "Private DSH"

#### Scenario: Update surface

- **WHEN** the update surface renders its title
- **THEN** the title reads "Private DSH Update"

#### Scenario: Startup failure

- **WHEN** the desktop application cannot start its interface
- **THEN** the failure message names "Private DSH"

### Requirement: The brand name is not translated in desktop copy

Every shipped desktop locale SHALL use "Private DSH" for the brand texts rather than a translated form.

#### Scenario: Non-English desktop locale

- **WHEN** any shipped non-English desktop locale is active
- **THEN** the brand texts still read "Private DSH"
