# conversation-window Specification

## Purpose

Gives any plugin a supported way to render the complete native conversation window — Session header chrome and conversation body — in a surface other than the main panel, so the window can be embedded without being reimplemented.

## Requirements

### Requirement: The native conversation window can be hosted outside the main panel

The client SHALL expose one reusable window composition that renders, for the Session bound at its render position, both the strict Session header — title ancestry, View tabs and their More menu, header actions, header utilities, and the right-bar corner — and the conversation body — the active View, the composer, and the Session statistics. A host SHALL obtain that composition without rendering `main.conversation`, without registering into it, and without assembling any header input itself.

#### Scenario: A host renders the window for a Session other than the selected one

- **WHEN** a host renders one window occurrence around a retained Session while a different Session is selected in the main panel
- **THEN** the occurrence shows that Session's title ancestry, View tabs, header actions, header utilities, right-bar corner, transcript, and composer
- **AND** the main panel keeps showing its own Session unchanged

#### Scenario: The main panel renders through the same composition

- **WHEN** the application starts with no Session selected and then opens one
- **THEN** the main panel renders the same window chrome and body it renders today, including the blank-Session state before a Session exists

#### Scenario: A host does not have to reimplement the chrome

- **WHEN** a plugin renders the window composition in a surface of its own
- **THEN** it passes only the window variant and Session area it is already able to provide
- **AND** it registers no header component, fabricates no header inputs, and reads no header internals

### Requirement: Header extension points serve every window occurrence

Every contribution registered into the window's header extension points SHALL render in every mounted occurrence of the window, including an embedded one. A contribution registered once SHALL NOT have to be registered again per occurrence.

#### Scenario: A header action reaches both occurrences

- **WHEN** a plugin registers one entry in the header actions extension point
- **THEN** that entry appears in the main panel's header and in every embedded window's header

#### Scenario: A header utility reaches both occurrences

- **WHEN** a plugin registers one entry in the header utilities extension point
- **THEN** that entry appears in the main panel's header and in every embedded window's header

#### Scenario: The View More menu keeps its rows

- **WHEN** a plugin registers a row in the View tab row's More actions extension point
- **THEN** the embedded window's More menu lists the same rows the main panel's More menu lists

### Requirement: An embedded occurrence drops application chrome

An embedded window occurrence SHALL omit the leading global-navigation seat, SHALL NOT mark its header as a window-drag region, and SHALL NOT inherit the main conversation column's window-frame clearance.

#### Scenario: Embedded header carries no global navigation

- **WHEN** a plugin registers an occupant for the leading global-navigation seat and renders an embedded window
- **THEN** that occupant renders in the main panel's header and not in the embedded window's

#### Scenario: Dragging an embedded header does not move the application window

- **WHEN** the pointer drags the embedded window's header on a platform with a custom title bar
- **THEN** the application window does not move

#### Scenario: Embedded title row is not indented for the frame

- **WHEN** the main conversation column reserves window-frame clearance for shell controls
- **THEN** the embedded window's title row starts at its own container's edge, without that clearance

### Requirement: A window occurrence binds the Session of its render position

The window SHALL take its Session from the render position and SHALL NOT accept an independent Session identity. A host SHALL address another Session by providing that Session's area around the occurrence. An occurrence rendered with no Session SHALL render the no-Session state rather than fail.

#### Scenario: The occurrence follows the Session area around it

- **WHEN** a host wraps an occurrence in the area of Session B while Session A is the selected one
- **THEN** the occurrence renders Session B's window
- **AND** selecting another Session elsewhere does not rebind the occurrence to it

#### Scenario: An occurrence without a Session shows the empty state

- **WHEN** an occurrence renders where no Session area is provided
- **THEN** it renders the blank and hero state, including the composer's inert presentation
- **AND** it reports no failure

### Requirement: View selection and pin choices stay per-Session and shared

The window SHALL use the same View roster, unpinned-View choices, and per-Session View selection as the main panel. Mounting an embedded occurrence SHALL NOT create a second copy of any of them.

#### Scenario: Selecting a View in one occurrence selects it in the other

- **WHEN** the user selects a View tab in an embedded window and the main panel shows the same Session
- **THEN** the main panel shows that View selected as well

#### Scenario: Unpinning a View affects every occurrence

- **WHEN** the user unpins a View from the More menu in an embedded window
- **THEN** that View's tab disappears from the main panel's header for the same Session

### Requirement: The body-only composition remains available

The existing body-only composition SHALL continue to render the active View, the composer, and the Session statistics without any header chrome, for hosts that deliberately omit it.

#### Scenario: A body-only host keeps working

- **WHEN** a host renders the body-only composition with its own View selection
- **THEN** it renders the transcript and composer with no title row, tabs, header actions, header utilities, or corner

### Requirement: A failing header entry is reported and contained

A window occurrence SHALL render its header through ordinary Slot dispatch, so a crashing header entry is reported against that entry and retired from its cell instead of taking the window with it. The occurrence SHALL keep rendering its other chrome and its body, and a cell left without a live entry SHALL show the composition's crash face. The window SHALL NOT catch the failure or substitute a header of its own.

#### Scenario: A crashing header entry leaves the window usable

- **WHEN** an entry registered into a header extension point throws while a window occurrence renders
- **THEN** the failure is reported against that entry and the entry is retired
- **AND** the occurrence still renders its header chrome and its body

#### Scenario: A failed cell shows the crash face rather than a silent gap

- **WHEN** every entry of one header cell has been retired
- **THEN** that cell renders the composition's crash face
- **AND** the occurrence keeps rendering the rest of the window
