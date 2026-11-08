# Spec Delta

## Purpose

Defines the private distribution's own brand mark — a solid shield holding the whale as a transparent knock-out — and the surfaces that carry it, so the application and its packaging present one consistent artwork instead of the upstream whale.

## ADDED Requirements

### Requirement: The mark is a shield with the whale knocked out

The mark SHALL render as a solid shield whose whale silhouette is a transparent knock-out covering 72% of the shield width.

#### Scenario: Background-independent knock-out

- **WHEN** the mark renders over any surface, in either theme
- **THEN** the whale reads as the surface behind the mark and the shield carries the foreground ink

#### Scenario: One artwork at every size

- **WHEN** the mark renders at any size from the brand row to the application icon
- **THEN** the same shield and whale geometry is used, without a separate small-size variant

#### Scenario: The mark carries no text

- **WHEN** the mark renders anywhere
- **THEN** it contains only the shield and the whale, and the product name is presented separately as text

### Requirement: Non-official builds carry the private mark in the client

A non-official client build SHALL present the private mark in the sidebar brand row, in the collapsed rail, and on the home hero.

#### Scenario: Sidebar in both states

- **WHEN** a non-official build renders the sidebar expanded and collapsed
- **THEN** the private mark appears in the brand row and in the rail

#### Scenario: Rail mark keeps the expand affordance

- **WHEN** the user clicks the mark in the collapsed rail
- **THEN** the sidebar expands and no version is copied

#### Scenario: Static hero mark

- **WHEN** a non-official build shows the blank home
- **THEN** the private mark renders beside the headline without an animation on hover

#### Scenario: Official builds keep the upstream artwork

- **WHEN** an official build renders the sidebar or the hero
- **THEN** the upstream mark and wordmark appear and the private mark does not

### Requirement: The application icon and install surfaces carry the private mark

The install and application artwork SHALL be generated from the private mark.

#### Scenario: Browser tab

- **WHEN** the client is served in a browser
- **THEN** the tab icon shows the private mark

#### Scenario: Installed web application

- **WHEN** the web client is installed as an application
- **THEN** the install icons render the private mark on the application tile

#### Scenario: Desktop application icon

- **WHEN** the packaged application appears in the dock or the taskbar
- **THEN** its icon shows the private mark on the dark neutral plate

#### Scenario: Windows tray

- **WHEN** the Windows application runs in the tray
- **THEN** the tray icon shows the private mark

### Requirement: The installer artwork pairs the mark with the product name

The installer and uninstaller artwork SHALL show the private mark and the product name "Private DSH" set in Montserrat.

#### Scenario: Installer panel

- **WHEN** the installer shows its artwork
- **THEN** the mark appears beside the name "Private DSH" in Montserrat

#### Scenario: Dark installer theme

- **WHEN** the installer runs in its dark theme
- **THEN** the same lockup renders in the inverted ink

#### Scenario: Uninstaller

- **WHEN** the uninstaller shows its artwork
- **THEN** the private mark appears there too
